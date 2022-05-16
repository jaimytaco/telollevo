// import { default as OnlineDB } from '../services/firebase.service'
// import { default as LocalDB } from '../services/indexedDb.service'
import { getConfig } from '../../utils'
// import { wf, registerWF } from '../lib'

export const SW_VERSION = 16

const cacheStaticAssets = async (cacheName: string, sw: T) => {
    try {
        const cache = await caches.open(cacheName)
        cache.addAll(sw.static)

        // await initAppForSW()
    } catch (err) {
        console.error(err)
    }
}

const removePreviousCaches = async (prefix: string, allCaches: string[]) => {
    const cacheNames = await caches.keys()
    return Promise.all(
        cacheNames
            .filter(cacheName => cacheName.startsWith(prefix) && !allCaches.includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
    )
}

// TODO: regex matching
const pathMatches = (path: string, p: string) => {
    return path === p
}

// const handleFetch = (e: Event, cacheName: string, { static, dynamic }: T) => {
//     const isDynamic = dynamic.find(s => pathMatches(e.request.pathname, s))

//     e.respondWith(
//         caches.open(cacheName)
//             .then((cache) => {
//                 if (isDynamic) return serveDynamically(e)

//                 return cache.match(e.request, { ignoreSearch: true })
//                     .then((response) => {
//                         return (
//                             response ||
//                             fetch(e.request)
//                                 .then((response) => {
//                                     if (e.request.method !== 'POST') cache.put(e.request, response.clone())
//                                     return response
//                                 })
//                                 .catch((err) => console.error(err))
//                         )
//                     })
//             }),
//     )
// }

// const serveFromCache = async (request: Request) => {
//     const response = await caches.match(request, { ignoreSearch: true })
//     if (!response || request.url.origin === location.origin) console.info(`${request.url} served without cache`)
//     return response || fetch(request)
// }
  
const serveFromCache = async (request: Request, cacheName: string, cacheOnFetch: boolean = false) => {
    const cache = await caches.open(cacheName)
    const cacheResponse = await cache.match(request, { ignoreSearch: true })
    if (cacheResponse) return cacheResponse

    if (cacheOnFetch) {
        try {
            const networkResponse = await fetch(request)
            const url = new URL(request.url)
            const bypassCache = request.method === 'POST' || request.url.includes('/sw.worker.') || location.origin !== url.origin
            // console.log('request =', request)
            if (!bypassCache) cache.put(request, networkResponse.clone())
            return networkResponse
        } catch (err) {
            console.error(err)
        }
    }
}

const fullfillBlank = async (content: T) => {
    const response = await serveFromCache(new Request('/blank'))
    const blank = await response.text()
    return blank
        .replace('<!-- [TITLE] -->', content.head.title)
        .replace('<!-- [META] -->', content.head.meta)
        .replace('<!-- [BODY] -->', content.body)
}

const serveWithStream = async (e: Event, content: T) => {
    const response = await serveFromCache(new Request('/blank'))
    const blank = await response.text()

    return streamHTML(e, [
        blank
            .replace('<!-- [TITLE] -->', content.head.title)
            .replace('<!-- [META] -->', content.head.meta)
            .replace('<!-- [BODY] -->', content.body)
    ])
}

const serveDynamically = async (e: Event) => {
    const { pathname } = e.request
    const { content, err } = await wf.ui.getDynamicContent({ pathname })
    return err ?
        serveFromCache(new Request('/404')) :
        serveWithStream(e, content)
}

export const getCacheName = (prefix) => `${prefix}-static-${SW_VERSION}`

const registerSW = async () => {
    // const OnlineDB = (await import('../services/firebase.service')).default
    // const LocalDB = (await import('..f/services/indexedDb.service')).default

    const config = await getConfig(OnlineDB, LocalDB)
    const { sw } = config
    const cacheName = getCacheName(sw.cache.prefix)

    // await registerWF(config)

    addEventListener('install', (e: Event) => {
        skipWaiting()
        e.waitUntil(cacheStaticAssets(cacheName, sw))
        // e.waitUntil(cacheStaticAssets(cacheName, sw))
        // skipWaiting()
    })

    addEventListener('activate', (e: Event) => {
        e.waitUntil(removePreviousCaches(sw.cache.prefix, [cacheName]))
    })

    addEventListener('fetch', (e: Event) => {
        // const isDynamic = sw.dynamic.find(s => pathMatches(e.request.pathname, s))
        // e.respondWith(isDynamic ?
        //     serveDynamically(e) :
        //     serveFromCache(e.request, cacheName, true)
        // )

        e.respondWith(
            serveFromCache(e.request, cacheName, true)
        )
    })
}

registerSW()