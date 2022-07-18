export const cacheStatic = async (e, cacheName, staticPaths) => {
    try {
        const cache = await caches.open(cacheName)
        
        for(const path of staticPaths){
            try{
                await cache.addAll([path])
                // console.info(`${path} is cached`)
            }catch(err){
                console.log(err)
            } 
        }
        // cache.addAll(staticPaths)   
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

        if (response) {
            sendMessage({msg: `from cache: ${getPathnameFromRequest(request)}`})
        }

        return response || fetch(request)
    } catch (err) {
        console.error(err)
    }
}

export const sendMessage = async message => {
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