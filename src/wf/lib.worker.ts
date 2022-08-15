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
    operator: T
    isOfflineFirst: boolean
    isFirstLoad: boolean,
    app: T
}

export const wf: IWF = {
    mode: EDatabaseMode,
    operator: EOperator
}

export const registerApp = (app: T) => !wf?.app ? wf.app = app : null

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

export const registerOfflineDB = async (offlineDB: T, prefix, models) => {
    if (!wf?.database) wf.database = await formatDatabaseActor()

    await wf.database.setOfflineDB(formatforWorker(offlineDB))
    
    if (supportsIndexedDB()) {
        const { isOfflineFirst, isFirstLoad } = await wf.database.register({ mode: EDatabaseMode.Offline, prefix, models })
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

export const getContent = async ({ routes, pathname, viewId }) => AUI.getViewContent(wf, routes, pathname)

export const getHTML = async ({ routes, pathname, cacheName }) => {
    const { content, err } = await getContent({ routes, pathname })
    if (err) return { err }

    const request = new Request(getLayoutPathname())
    const layoutFetchPromise = isServiceWorker() ? 
        serveFromCache(request, cacheName) :
        fetch(request)
    
    const layoutResponse = await layoutFetchPromise
    if (!layoutResponse) return { err: layoutResponse }
    if (layoutResponse?.err) return { err: layoutResponse.err }
    
    const { response } = layoutResponse
    const layoutText = await (response || layoutResponse).text()
    
    const html = layoutText
        .replace(getTitleTag(), content.head.title)
        .replace(getMetaTag(), content.head.meta)
        .replace(getBodyTag(), content.body)

    return { html }
}

export const buildRouteResponse = async ({ routes, url, cacheName }) => {
    const { pathname } = url
    const { html, err } = await getHTML({ routes, pathname, cacheName })
    if (err) return { err }

    return {
        response: new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }
}

const getLayoutPathname = () => '/admin/layout'

export const getTitleTag = () => '[TITLE]'
export const getMetaTag = () => '<!-- [META] -->'
export const getBodyTag = () => '<!-- [BODY] -->'

const testPattern = (url, pattern) => pattern.test(url.href)

// TODO: Remove this method
// export const isDynamicPathname = ({ routes, url, pattern }) => {
//     if (pattern) return testPattern(url, pattern)
//     return Object.keys(routes)
//         .find(key => testPattern(url, new URLPattern({ pathname: routes[key].pattern })))
// }

export const getOfflineTimestamp = async (id) => (await wf.database.get(wf.mode.Offline, 'offline-timestamp', id))?.data?.at

export const updateOfflineTimestamp = (id, date: Date) => {
    return wf.database.update(wf.mode.Offline, 'offline-timestamp', {
        id,
        at: date
    })
}