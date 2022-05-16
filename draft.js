//////////////////////////////////////////////
//////////////////////////////////////////////
// main.ts

const {
    models,
    networkDB,
    offlineDB,

    isDynamicPathname,
    isViewUpdatable
} = await import('./utils')

const {
    registerNetworkDB,
    registerOfflineDB,
    registerModels,
    registerSW,
    getHTML,
} = await import('./wf')

await registerNetworkDB(networkDB)
await registerOfflineDB(offlineDB)

registerSW()

registerModels(models)

const { pathname } = location
if (!isDynamicPathname(pathname)) return

const { html, lastUpdate, err } = await getHTML({ pathname })
if (err) return
isViewUpdatable(lastUpdate) ? document.body.innerHTML = html : null


//////////////////////////////////////////////
//////////////////////////////////////////////
// sw.worker.ts

import {
    models,
    offlineDB,

    isStaticPathname,
    isDynamicPathname,
    getCachePrefix,
    get404Pathname,
    getBlankPathname,
    
    getTitleTag,
    getMetaTag,
    getBodyTag,
} from './utils'

import {
    registerOfflineDB
} from './wf'

const CACHE_VERSION = 1
const cacheStatic = async () => { }
const getCacheName = () => { }
const removePreviousCaches = () => { }

const serveFromCache = async (request) => {
    const cache = await caches.open(getCacheName())
    const response = await cache.match(request, { ignoreSearch: true })
    return response
}

const serveWithStreams = async (e) => {
    const { pathname } = e.request
    await registerOfflineDB(offlineDB)
    registerModels(models)

    const { html, err } = await getHTML({ pathname })
    return err ?
        serveFromCache(new Request(get404Pathname())) :
        streamHTML(e, [html])
}

const streamHTML = (e, htmls) => {
    const responsePromises = htmls
        .map(html => new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }))

    const { readable, writable } = new TransformStream()

    e.waitUntil(async function () {
        for (const responsePromise of responsePromises) {
            const response = await responsePromise
            await response.body.pipeTo(writable, { preventClose: true })
        }
        writable.getWriter().close()
    }())

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    })
}

addEventListener('install', (e) => {
    skipWaiting()
    e.waitUntil(
        cacheStatic()
    )
})

addEventListener('activate', (e) => {
    e.waitUntil(
        removePreviousCaches()
    )
})

addEventListener('fetch', (e) => {
    const { pathname } = e.request
    e.respondWith(() => {
        if (isStaticPathname(pathname)) return serveFromCache(e.request)
        else if (isDynamicPathname(pathname)) return serveWithStreams(e)
        else return fetch(request)
    })
})









