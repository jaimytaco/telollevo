import {
    wrap,
    proxy
} from 'comlink'

import { 
    EDatabaseMode 
} from './enums/database.enum'

import {
    isNode,
    supportsWorkerType,
    supportsIndexedDB,
} from './helpers/browser.helper'

import { 
    AUI 
} from './actors/ui.actor'

import { 
    ADatabase 
} from './actors/database.actor'

import {
    EDatabaseMode,
    EOperator
} from './enums/database.enum'

import WDatabase from './workers/database.worker?worker'


export const wf = {
    mode: EDatabaseMode,
    operator: EOperator
}

const formatDatabaseActor = () => {
    if (isNode()) return ADatabase
    if (supportsWorkerType()) return wrap(new WDatabase())
    return ADatabase
}

const formatDB = (db) => {
    if (isNode()) return db
    if (supportsWorkerType()) proxy(db)
    return db
}

export const registerNetworkDB = async (networkDB: T) => {
    if (!wf?.database) wf.database = await formatDatabaseActor()

    await wf.database.setNetworkDB(formatDB(networkDB))
}

export const registerOfflineDB = async (offlineDB: T) => {
    if (!wf?.database) wf.database = await formatDatabaseActor()

    await wf.database.setOfflineDB(formatDB(offlineDB))
    
    if (supportsIndexedDB()) {
        const { isOfflineFirst, isFirstLoad } = await wf.database.register(EDatabaseMode.Offline)
        wf.isOfflineFirst = isOfflineFirst
        wf.isFirstLoad = isFirstLoad
    }
}

export const updateOfflineDB = async (models, loaders) => {
    if (!wf?.database) throw 'database actor not registered'
    if (wf?.isOfflineFirst && wf?.isFirstLoad) console.info('Populating DB for the first time')
    await wf.database.loadOfflineDatabase(Object.keys(models), loaders)
    wf.isFirstLoad = false
}

// const addModel = (key, value) => {
//     wf.models ? null : wf.models = {}
//     console.log('value =', value)
//     wf.models[key] = {
//         _collection: key,
//         ...value
//     }
// }

// export const registerModels = (models: T) => Object.keys(models)
//     .forEach(key => addModel(key, models[key]))

export const getContent = async ({ ui, pathname, viewId }) => {
    return AUI.getDynamicContent({ lib: wf, builders: ui, pathname, viewId })
}

export const getHTML = async ({ ui, pathname, viewId }) => {
    const { content, err } = await getContent({ ui, pathname, viewId })
    if (err) return { err }

    const blankResponse = await fetch(getBlankPathname())
    const blankText = await blankResponse.text()

    const html = blankText
        .replace(getTitleTag(), content.head.title)
        .replace(getMetaTag(), content.head.meta)
        .replace(getBodyTag(), content.body)

    return { html }
}

export const cacheDynamically = async ({ ui, cacheName, url, pattern }) => {
    const { pathname } = url
    if (!isDynamicPathname({ ui, url, pattern })) return
    const { html, err } = await getHTML({ ui, pathname })
    if (err) return { err }
    const cache = await caches.open(cacheName)
    return cache.put(new Request(pathname), new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }))
}

export const cacheFromUI = async (ui, cacheName) => Promise.all([
    Object.keys(ui)
        .map((key) => cacheDynamically({ ui, cacheName, url: new URL(`${location.origin}${ui[key].pathname}`), pattern: ui[key].pattern }))
])

const getMultipleHTML = async ({ viewId, generator }) => {
    const { content, err } = await AUI.getDynamicContent({ lib: wf, builders: generator, viewId })
    if (err) return { err }

    const blankResponse = await fetch(getBlankPathname())
    const blankText = await blankResponse.text()

    const htmls = content
        .map((contentItem) => {
            return blankText
                .replace(getTitleTag(), contentItem.head.title)
                .replace(getMetaTag(), contentItem.head.meta)
                .replace(getBodyTag(), contentItem.body)
        })

    return { htmls }
}

// export const cacheFromGenerator = async ({ cacheName, viewId, generator }) => {
//     const { htmls, err } = await getMultipleHTML({ viewId, generator })
//     console.log('htmls =', htmls)
//     console.log('err =', err)
//     if (err) return { err }

//     console.log('htmls =', htmls)

//     // const cache = await caches.open(cacheName)
//     // return Promise.all(
//     //     htmls
//     //         .map((html) => {
//     //             return cache.put(new Request(pathname), new Response(html, {
//     //                 headers: { 'Content-Type': 'text/html; charset=utf-8' }
//     //             }))
//     //         })
//     // )
// }

const getBlankPathname = () => '/blank'

const getTitleTag = () => '<!-- [TITLE] -->'
const getMetaTag = () => '<!-- [META] -->'
const getBodyTag = () => '<!-- [BODY] -->'

const testPattern = (url, pattern) => (new URLPattern({ pathname: pattern })).test(url.href)

const isDynamicPathname = ({ ui, url, pattern }) => {
    if (pattern) return testPattern(url, pattern)
    return Object.keys(ui)
        .find(key => testPattern(url, new URLPattern({ pathname: ui[key].pattern })))
}