import { app } from '@helpers/app.helper'
import { CREDENTIALS } from '@helpers/database.helper'
import { delay } from '@helpers/util.helper'
import { ESWStatus } from '@helpers/sw.helper'

import {
    registerNetworkDB,
    registerOfflineDB,
    wf,

    registerAuthenticator,
    buildRouteResponse,
    updateOfflineTimestamp,
    registerApp,
} from '@wf/lib.worker'

import {
    cacheStatic,
    serveFromCache,
    removePreviousCaches,
    getCacheName,
    sendMessage,
    isDocumentRequest,
    isRequestHandledBySW,
    offlineFirst,
} from '@wf/helpers/sw.helper'

import { logger } from '@wf/helpers/browser.helper'

import networkDB from '@wf/services/firebase.firestore.service'
import offlineDB from '@wf/services/indexedDb.service'

import authenticator from '@wf/services/firebase.auth.service'

import MUser from '@models/user.model'
import MOrder from '@models/order.model'
import MFlight from '@models/flight.model'
import MQuotation from '@models/quotation.model'

import ModAuth from '@modules/admin/auth.module'


const prefetchRoutes = (routes) => Promise.all(
    Object.keys(routes)
        .filter((pahtname) => pahtname.startsWith('/'))
        .map((pathname) => {
            logger(`Prefetching for ${pathname}`)
            return prefetchRequest(new Request(pathname))
        })
)

const unprefetchRoutes = (routes) => Promise.all(
    Object.keys(routes)
        .filter((pathname) => pathname.startsWith('/'))
        .map((pathname) => {
            logger(`Unprefetching for ${pathname}`)
            return unprefetchRequest(new Request(pathname))
        })
)

const installHdlr = (e) => {
    const fn = async () => {
        logger(`Installing SW (v.${SW_VERSION})`)

        registerApp(app)
        await registerNetworkDB(networkDB, CREDENTIALS)
        await registerAuthenticator(authenticator, CREDENTIALS)
        await registerOfflineDB(offlineDB, app.code, app.models)
        await cacheStatic(e, CACHE_NAME, app.routes.static)

        wf.auth.onAuthStateChanged(async (credential) => {
            const msg = credential ? 'User logged in:' : 'User logged out'
            logger(msg, credential)

            if (credential) {
                const userId = credential.uid
                const user = await MUser.install(wf, userId)

                await prefetchRoutes(app.routes)
            }else{
                MUser.uninstall(wf)
                MOrder.uninstall(wf)
                MFlight.uninstall(wf)
                MQuotation.uninstall(wf)

                unprefetchRoutes(app.routes)
            }

            sendMessage({ msg: ESWStatus.ContentReady })
        })

        logger(`Installed SW (v.${SW_VERSION})`)
        skipWaiting()
    }

    e.waitUntil(fn())
}

const activateHdlr = async (e) => {
    const fn = async () => {
        logger(`Activating SW (v.${SW_VERSION})`)

        removePreviousCaches(`sw-${app.code}`, [CACHE_NAME])

        logger(`Activated SW (v.${SW_VERSION})`)

        logger(`Claiming clients SW (v.${SW_VERSION})`)
        await clients.claim()
        logger(`Claimed clients SW (v.${SW_VERSION})`)

        sendMessage({ msg: ESWStatus.Claimed })
    }

    e.waitUntil(fn())
}

const unprefetchRequest = async (request) => {
    const cache = await caches.open(CACHE_NAME)
    return cache.delete(request)
}

const prefetchRequest = async (request) => {
    const url = new URL(request.url)
    const { pathname } = url
    const { routes } = app

    const route = routes[pathname]
    if (!route){
        logger(`Route ${url} not found in app to build`)
        return
    }

    const { loader } = route
    if (!loader) {
        const err = `Module doesn't have loader-function to work offline for ${url}`
        logger(err)
        return { err }
    }

    const loaderStatus = await Promise.any([
        loader(wf),
        (async (ms: number, url) => {
            await delay(ms)
            return { err: `Loader for ${url} not finished in ${ms}ms` }
        })(MAX_LOADER_MS, url)
    ])

    if (loaderStatus?.err) {
        const err = `Error in loader for ${url} ~` 
        logger(err, loaderStatus.err)
        // TODO: Indicate in someway that the document is rendered with data outdated
        return { err: `${err} ${loaderStatus.err}`}
    }

    if (!loaderStatus?.done){
        logger(`Building dynamic response skipped for ${url}`)
        return
    }

    const { response } = await buildRouteResponse({ routes, url, cacheName: CACHE_NAME })
    if (!response) {
        const err = `Route response for ${url} couldn't be built`
        logger(err)
        return { err }
    }

    const cache = await caches.open(CACHE_NAME)
    await cache.put(new Request(url), response)

    logger(`Route response cached successfully for ${url}`)
}

const fetchHdlr = (e) => {
    const fn = async (request, destination) => {
        if (destination === 'document') {
            const url = new URL(request.url)
            const { pathname } = url
            if (pathname !== '/' && pathname.endsWith('/')){
                logger('Redirecting to same pathname without /')
                return Response.redirect(pathname.slice(0, -1))
            }

            const currentUserCredential = await ModAuth.getUserAuthenticated(wf)
            if (currentUserCredential?.err){
                sendMessage({ msg: 'unregister-sw' })
                return
            }
            
            const redirectForAuth = !currentUserCredential && app.routes[pathname]?.withAuth
            
            if (redirectForAuth){
                logger('Redirecting to login because user is not authenticated')
                // TODO: Clear cached routes that need authentication
                return Response.redirect('/login')
            }

            const prefetchRequestPromise = prefetchRequest(request)
            
            const prefetchStatus = await Promise.any([
                prefetchRequestPromise,
                (async (ms, url) => {
                    await delay(ms)
                    return { err: `Fetch for ${request.url} took more than ${ms}ms. Content updated will be ready for next fetch` }
                })(MAX_FETCH_MS, url)
            ])

            prefetchStatus?.err ? logger(prefetchStatus.err) : logger(`Fetch for ${request.url} is up to date!`)
        }

        return offlineFirst(request, CACHE_NAME)
    }

    if (isRequestHandledBySW(e.request)){
        const url = new URL(e.request.url)
        const request = new Request(url.pathname)
        e.respondWith(fn(request, e.request.destination))
    }
}

addEventListener('install', installHdlr)
addEventListener('activate', activateHdlr)
addEventListener('fetch', fetchHdlr)

export const SW_VERSION = 750

const CACHE_NAME = getCacheName(`sw-${app.code}`, SW_VERSION)
const MAX_LOADER_MS = 3000
const MAX_FETCH_MS = 3000