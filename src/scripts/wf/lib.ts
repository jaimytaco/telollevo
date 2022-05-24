import { EDatabaseMode } from './enums/database.enum'
import {
    isNode,
    supportsWorkerType,
    supportsIndexedDB,
} from './helpers/browser.helper'

export const wf = {}

export const registerNetworkDB = async (networkDB: T) => {
    const { ADatabase } = await import('./actors/database.actor')

    if (isNode()) {
        wf.database = ADatabase
        wf.database.setNetworkDB(networkDB)
        await wf.database.register(EDatabaseMode.Network)
    } else {
        if (supportsWorkerType()) {
            const { wrap } = await import('comlink')
            const WDatabase = (await import('./workers/database.worker?worker')).default
            wf.database = await wrap(new WDatabase())
        } else wf.database = ADatabase

        const { proxy } = await import('comlink')
        wf.database.setNetworkDB(proxy(networkDB))
    }
}

export const registerOfflineDB = async (networkDB: T, offlineDB: T) => {
    if (!isNode()) {
        if (wf.database.NetworkDB) wf.database.setNetworkDB(networkDB)

        const { proxy } = await import('comlink')

        wf.database.setOfflineDB(proxy(offlineDB))

        await wf.database.register(EDatabaseMode.Network)

        if (supportsIndexedDB()) {
            const { isOfflineFirst, isFirstLoad } = await wf.database.register(EDatabaseMode.Offline)
            wf.isOfflineFirst = isOfflineFirst
            wf.isFirstLoad = isFirstLoad
        }
    }
}

export const updateOfflineDB = async (models, loaders) => {
    if (wf?.isOfflineFirst && wf?.isFirstLoad) {
        await wf?.database?.loadOfflineDatabase(Object.keys(models), loaders)
    }
}

const addModel = (key, value) => {
    wf.models ? null : wf.models = {}
    wf.models[key] = {
        _collection: key,
        ...value
    }
}

export const registerModels = (models: T) => Object.keys(models)
    .forEach(key => addModel(key, models[key]))

export const getContent = async ({ pathname, viewId }) => {
    const { AUI } = await import('./actors/ui.actor')
    const { ui } = await import('../config')

    return AUI.getDynamicContent({ lib: wf, builders: ui, pathname, viewId })
}

export const getHTML = async ({ pathname, viewId }) => {
    const { content, err } = await getContent({ pathname, viewId })
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
    const { html, err } = await getHTML({ pathname })

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

export const get404Pathname = () => '/404'

const getBlankPathname = () => '/blank'

const getTitleTag = () => '<!-- [TITLE] -->'
const getMetaTag = () => '<!-- [META] -->'
const getBodyTag = () => '<!-- [BODY] -->'

// TODO
export const isStaticPathname = () => true

const testPattern = (url, pattern) => (new URLPattern({ pathname: pattern })).test(url.href)

export const isDynamicPathname = ({ ui, url, pattern }) => {
    if (pattern) return testPattern(url, pattern)
    return Object.keys(ui)
        .find(key => testPattern(url, ui[key].pattern))
}

export const updateView = async (mainTag, pathname) => {
    const { content, err, lastUpdate } = await getContent({ pathname })
    if (!err && isViewUpdatable(lastUpdate)) {
        document.title = content.head.title
        document.querySelector(mainTag).innerHTML = content.body
    }
}

// TODO
export const isViewUpdatable = () => true