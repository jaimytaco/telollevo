import { IViewContent } from '../interfaces/view.interface'
import { AUI } from '../actors/ui.actor'
import { ADatabase } from '../actors/database.actor'
// import { IActors } from '../interfaces/actor.interface'

const STATIC_CACHE_PREFIX = 'sw-telollevo'
const STATIC_CACHE_VERSION = 1
const STATIC_CACHE_NAME = `${STATIC_CACHE_PREFIX}-static-${STATIC_CACHE_VERSION}`

const TO_CACHE = [
    '/',
    '/blank',
]

const initAppForSW = async () => {
    // globalThis.actors = {} as IActors
    globalThis.actors = {}
    globalThis.actors.ui = AUI
    globalThis.actors.database = ADatabase

    await globalThis.actors.database.init(EDatabaseMode.Online)
    await globalThis.actors.database.init(EDatabaseMode.Local)
}

export const cacheStaticAssets = async () => {
    try {
        const cache = await caches.open(STATIC_CACHE_NAME)
        cache.addAll(TO_CACHE)

        await initAppForSW()
    } catch (err) {
        console.error(err)
    }
}

const serveFromCache = async (request: Request) => {
    const response = await caches.match(request, { ignoreSearch: true })
    if (!response || request.url.origin === location.origin) console.info(`${request.url} served without cache`)
    return response || fetch(request)
}

const streamHTML = (e: Event, htmls: String[]) => {
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

const serveWithStream = async (e: Event, content: IViewContent) => {
    const response = await caches.match(new Request('/blank'))
    const blank = await response.text()

    return streamHTML(e, [
        blank
            .replace('<!-- [DYNAMIC TITLE] -->', content.head.title)
            .replace('<!-- [DYNAMIC META] -->', content.head.meta)
            .replace('<!-- [DYNAMIC BODY] -->', content.body)
    ])
}

const serveDynamically = async (e: Event, pathname: String) => {
    const { content, err } = await globalThis.actors.ui.getDynamicContent({ pathname })
    return err ? serveFromCache(new Request('/404')) : serveWithStream(e, content)
}

export const removePreviousCaches = async () => {
    const cacheNames = await caches.keys()
    return Promise.all(
        cacheNames
            .filter(cacheName => cacheName.startsWith(STATIC_CACHE_PREFIX) && !ALL_CACHES.includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
    )
}

export const handleFetch = (e: Event) => {
    e.respondWith(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                return cache.match(e.request)
                    .then((response) => {
                        return (
                            response ||
                            fetch(e.request)
                                .then((response) => {
                                    if (e.request.method !== 'POST') cache.put(e.request, response.clone())
                                    return response
                                })
                                .catch((err) => console.error(err))
                        )
                    })
            }),
    )

}