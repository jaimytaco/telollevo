import {
    wrap,
    proxy
} from 'comlink'

import { 
    EDatabaseMode,
    EOperator
} from '@wf/enums/database.enum'

import {
    isNode,
    isServiceWorker,
    supportsWorkerType,
    supportsIndexedDB,
} from '@wf/helpers/browser.helper'

import {  
    serveFromCache 
} from '@wf/helpers/sw.helper'

import { 
    AUI 
} from '@wf/actors/ui.actor'

import { 
    ADatabase 
} from '@wf/actors/database.actor'

import { 
    AAuth 
} from '@wf/actors/auth.actor'

import WDatabase from '@wf/workers/database.worker?worker'

interface IWF{
    mode: T
    operator: S
    isOfflineFirst: boolean
    isFirstLoad: boolean
}

export const wf: IWF = {
    mode: EDatabaseMode,
    operator: EOperator
}

const formatDatabaseActor = () => {
    if (isNode()) return ADatabase
    if (supportsWorkerType()) return wrap(new WDatabase())
    return ADatabase
}

const formatforWorker = (db) => {
    if (isNode()) return db
    if (supportsWorkerType()) proxy(db)
    return db
}

export const registerNetworkDB = async (networkDB: T, credentials) => {
    if (!wf?.database) wf.database = await formatDatabaseActor()
    
    const formattedDB = formatforWorker(networkDB)
    if (!wf?.appInitialized) wf.appInitialized = await wf.database.initApp(formattedDB, credentials)

    await wf.database.setNetworkDB(formattedDB)
    wf.database.register({ mode: EDatabaseMode.Network })
}

export const registerOfflineDB = async (offlineDB: T, prefix, loaders) => {
    if (!wf?.database) wf.database = await formatDatabaseActor()

    await wf.database.setOfflineDB(formatforWorker(offlineDB))
    
    if (supportsIndexedDB()) {
        const { isOfflineFirst, isFirstLoad } = await wf.database.register({ mode: EDatabaseMode.Offline, prefix, loaderKeys: Object.keys(loaders) })
        wf.isOfflineFirst = isOfflineFirst
        wf.isFirstLoad = isFirstLoad
    }
}

export const registerAuthenticator = async (authenticator: T, credentials) => {
    if (!wf?.auth) wf.auth = AAuth
    if (!wf?.appInitialized) wf.appInitialized = await wf.auth.initApp(credentials)
    
    await wf.auth.setAuthenticator(authenticator)
    await wf.auth.register()
}

// TODO: Delete this method
export const updateOfflineDB = async (loaders) => {
    if (!wf?.database) throw 'database actor not registered'
    if (wf?.isOfflineFirst && wf?.isFirstLoad) console.info('Populating DB for the first time')

    const dataLoaders = await Promise.all(
        Object.keys(loaders)
            .map((key) => {
                return loaders[key](wf)
            })
    )
    
    const promises = []
    for (const [i, key] of Object.keys(loaders).entries()) {
        const docs = dataLoaders[i];
        if (!docs) return []
        console.info(`Loaded ${docs.length} docs in '${key}'`)
        promises.push(docs
            .map(doc => wf.database.add(wf.mode.Offline, key, doc)))
    }

    await Promise.all(promises)
}

export const getContent = async ({ ui, pathname, viewId }) => AUI.getDynamicContent({ lib: wf, builders: ui, pathname, viewId })

export const getHTML = async ({ ui, pathname, viewId, cacheName }) => {
    const { content, err } = await getContent({ ui, pathname, viewId })
    if (err) return { err }

    const request = new Request(getLayoutPathname())
    const layoutFetchPromise = isServiceWorker() ? 
        serveFromCache(request, cacheName) :
        fetch(request)
    
    const layoutResponse = await layoutFetchPromise
    if (layoutFetchPromise.err) return { err: layoutFetchPromise.err }
    
    const { response } = layoutResponse

    const layoutText = await (response ?? layoutResponse).text()
    
    const html = layoutText
        .replace(getTitleTag(), content.head.title)
        .replace(getMetaTag(), content.head.meta)
        .replace(getBodyTag(), content.body)

    return { html }
}

export const getDynamicResponse = async ({ ui, url, cacheName }) => {
    const { pathname } = url
    const { html, err } = await getHTML({ ui, pathname, cacheName })
    if (err) return { err }

    return {
        response: new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }
}

export const cacheDynamically = async ({ ui, cacheName, url, pattern }) => {
    const { pathname } = url
    const isDynamic = isDynamicPathname({ ui, url, pattern })
    if (!isDynamic) return
    
    const { html, err } = await getHTML({ ui, pathname })
    if (err) return { err }

    const cache = await caches.open(cacheName)
    await cache.put(new Request(pathname), new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }))
}

// export const cacheFromUI = async (ui, cacheName) => Promise.all([
//     Object.keys(ui)
//         .map((key) => cacheDynamically({ ui, cacheName, url: new URL(`${location.origin}${ui[key].pathname}`), pattern: ui[key].pattern }))
// ])

// const getMultipleHTML = async ({ viewId, generator }) => {
//     const { content, err } = await AUI.getDynamicContent({ lib: wf, builders: generator, viewId })
//     if (err) return { err }

//     const layoutResponse = await fetch(getLayoutPathname())
//     const layoutText = await layoutResponse.text()

//     const htmls = content
//         .map((contentItem) => {
//             return layoutText
//                 .replace(getTitleTag(), contentItem.head.title)
//                 .replace(getMetaTag(), contentItem.head.meta)
//                 .replace(getBodyTag(), contentItem.body)
//         })

//     return { htmls }
// }

const getLayoutPathname = () => '/admin/layout'

export const getTitleTag = () => '[TITLE]'
export const getMetaTag = () => '<!-- [META] -->'
export const getBodyTag = () => '<!-- [BODY] -->'

// const testPattern = (url, pattern) => (new URLPattern({ pathname: pattern })).test(url.href)
const testPattern = (url, pattern) => pattern.test(url.href)

export const isDynamicPathname = ({ ui, url, pattern }) => {
    if (pattern) return testPattern(url, pattern)
    return Object.keys(ui)
        .find(key => testPattern(url, new URLPattern({ pathname: ui[key].pattern })))
}

// export const isHTMLURL = (url) => {
//     const { origin, pathname } = url
//     return location.origin === origin && (pathname.includes('.html') || !pathname.includes('.'))
// }

export const pathnameRequiresAuth = ({ ui, url }) => {
    const key = isDynamicPathname({ ui, url })
    const el = key ? ui[key] : null
    return el?.withAuth
}

export const getOfflineTimestamp = async (id) => (await wf.database.get(wf.mode.Offline, 'offline-timestamp', id))?.data?.at

export const updateOfflineTimestamp = (id, date: Date) => {
    return wf.database.update(wf.mode.Offline, 'offline-timestamp', {
        id,
        at: date
    })
}