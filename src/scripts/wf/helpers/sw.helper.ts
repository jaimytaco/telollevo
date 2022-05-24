export const cacheStatic = async (e, cacheName, staticPaths) => {
    try {
        const cache = await caches.open(cacheName)
        cache.addAll(staticPaths)    
    } catch (err) {
        console.error(err)
    }
}

export const getURLFromRequest = (request) => new URL(request.url)

export const getPathnameFromRequest = (request) => getURLFromRequest(request).pathname

export const serveFromCache = async (request, cacheName) => {
    try {
        const cache = await caches.open(cacheName)
        const response = await cache.match(request, { ignoreSearch: true })

        if (response) console.info('served with cache: ', getPathnameFromRequest(request))
        return response || fetch(request)
    } catch (err) {
        console.error(err)
    }
}

// const streamHTML = (e, htmls) => {
//     const responsePromises = htmls
//         .map(html => new Response(html, {
//             headers: { 'Content-Type': 'text/html; charset=utf-8' }
//         }))

//     const { readable, writable } = new TransformStream()

//     e.waitUntil(async function () {
//         for (const responsePromise of responsePromises) {
//             const response = await responsePromise
//             await response.body.pipeTo(writable, { preventClose: true })
//         }
//         writable.getWriter().close()
//     }())

//     return new Response(readable, {
//         headers: {
//             'Content-Type': 'text/html; charset=utf-8'
//         }
//     })
// }

// export const serveWithStreams = async (e, cacheName) => {
//     const { pathname } = e.request
//     // await registerOfflineDB(offlineDB)
//     // registerModels(models)

//     const { html, err } = await getHTML({ pathname })
//     const response = err ?
//         serveFromCache(new Request(get404Pathname()), cacheName) :
//         streamHTML(e, [html])

//     if (response) console.info('served with streams: ', getPathnameFromRequest(e.request))
//     return response || fetch(e.request)
// }

export const removePreviousCaches = async (prefix, allCaches: string[]) => {
    const cacheNames = await caches.keys()
    return Promise.all(
        cacheNames
            .filter(cacheName => cacheName.startsWith(prefix) && !allCaches.includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
    )
}

export const getCacheName = (prefix, version) => `${prefix}-static-${version}`
