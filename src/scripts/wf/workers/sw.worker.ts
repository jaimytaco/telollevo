import {
    models,
    sw,
    ui
} from '../../utils'

import {
    isStaticPathname,
    get404Pathname,
} from '../lib'

import {
    registerNetworkDB,
    getHTML,
    cacheFromNetwork,
} from '../lib.worker'

import { default as networkDB } from '../services/firebase.service'

const registerNetworkDBPromise = registerNetworkDB(networkDB)

const cacheStatic = async (e) => {
    try {
        const cache = await caches.open(getCacheName())
        cache.addAll(sw.static)

        await registerNetworkDBPromise
        for (const key of Object.keys(ui)) cacheFromNetwork({ cacheName: getCacheName(), url: new URL(`${location.origin}${ui[key].pathname}`), pattern: ui[key].pattern })
    } catch (err) {
        console.error(err)
    }
}

const getCacheName = () => `${sw.cache.prefix}-static-${SW_VERSION}`

const removePreviousCaches = async (allCaches: string[]) => {
    const cacheNames = await caches.keys()
    return Promise.all(
        cacheNames
            .filter(cacheName => cacheName.startsWith(sw.cache.prefix) && !allCaches.includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
    )
}

const getURLFromRequest = (request) => new URL(request.url)
const getPathnameFromRequest = (request) => getURLFromRequest(request).pathname

const serveFromCache = async (request) => {
    try {
        const cache = await caches.open(getCacheName())
        const response = await cache.match(request, { ignoreSearch: true })

        if (response) console.info('served with cache: ', getPathnameFromRequest(request))
        return response || fetch(request)
    } catch (err) {
        console.error(err)
    }
}

const serveWithStreams = async (e) => {
    const { pathname } = e.request
    await registerOfflineDB(offlineDB)
    registerModels(models)

    const { html, err } = await getHTML({ pathname })
    const response = err ?
        serveFromCache(new Request(get404Pathname())) :
        streamHTML(e, [html])

    if (response) console.info('served with streams: ', getPathnameFromRequest(e.request))
    return response || fetch(e.request)
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
    e.waitUntil(cacheStatic(e))
    skipWaiting()
})

addEventListener('activate', (e) => {
    e.waitUntil(removePreviousCaches([getCacheName()]))
})

const updateFromNetwork = async (e) => {
    await registerNetworkDBPromise
    await cacheFromNetwork({ cacheName: getCacheName(), url: new URL(e.request.url) })
}

addEventListener('fetch', (e) => {
    e.waitUntil(updateFromNetwork(e))
    e.respondWith(serveFromCache(e.request))
})

const SW_VERSION = 25