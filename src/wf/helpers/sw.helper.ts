import {
    logger
} from '@wf/helpers/browser.helper'

export const cacheStatic = async (e, cacheName, staticPaths) => {
    try {
        const cache = await caches.open(cacheName)
        for(const path of staticPaths){
            try{
                await cache.addAll([path])
            }catch(err){
                logger(`Request failed while caching statically for ${path}`)
            } 
        }
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

        // if (response) {
        //     sendMessage({msg: `from cache: ${getPathnameFromRequest(request)}`})
        // }

        return { response }
    } catch (err) {
       return { err }
    }
}

export const sendMessage = async (message) => {
    const clients = await self.clients.matchAll({
        includeUncontrolled: true,
    })

    clients.forEach((client) => client.postMessage(message))
}

export const removePreviousCaches = async (prefix, allCaches: string[]) => {
    const cacheNames = await caches.keys()
    return Promise.all(
        cacheNames
            .filter(cacheName => cacheName.startsWith(prefix) && !allCaches.includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
    )
}

export const getCacheName = (prefix, version) => `${prefix}-static-${version}`

export const isDocumentRequest = (request: Request) => request.destination === 'document'

export const isRequestHandledBySW = (request) => location.origin === (new URL(request.url)).origin

export const offlineFirst = async (request, cacheName) => {
    const { response: offlineResponse } = await serveFromCache(request, cacheName)
    if (offlineResponse) {
        logger(`Request fetched from cache for ${request.url}`)
        return offlineResponse
    }

    // const failResponse = await serveFromCache(new Request('/404'), cacheName)
    // console.log('--- failResponseFromCache =', failResponse)
    // failResponse.status = 404

    // const failResponseFromCache = await serveFromCache(new Request('/404'), cacheName)
    // const failResponseFromCacheText = failResponseFromCache?.err ? '404' : await failResponseFromCache.text()
    // const failResponse = new Response(failResponseFromCacheText, {
    //     headers: { 'Content-Type': 'text/html; charset=utf-8' },
    //     status: 404
    // })

    const failResponse = new Response(null, { status: 404 })

    try {
        const networkResponse = await fetch(request)
        if (networkResponse && networkResponse.ok) {
            logger(`Request fetched from network for ${request.url}`)
            return networkResponse
        }

        logger(`Request couldn't be fetched from network for ${request.url}`)
        return failResponse
    } catch (err) {
        logger(`Error catched while fetching from network for ${request.url}`)
        return failResponse
    }
}