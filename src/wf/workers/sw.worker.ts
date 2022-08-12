import { app } from '@helpers/app.helper'
import { CREDENTIALS } from '@helpers/database.helper'

import {
    registerNetworkDB,
    registerOfflineDB,
    updateOfflineDB,
    cacheDynamically,
    routeRequiresAuth,
    wf,

    registerAuthenticator,
    buildDynamicResponse,
    isDynamicPathname,
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

let userCredential

const prefetchDynamicRoutes = (ui) => Promise.all(
    Object.keys(ui)
        .map((key) => {
            logger(`Prefetching for ${ui[key].pathname}`)
            return prefetchRequest(new Request(ui[key].pathname))
        })
)

const installHdlr = (e) => {
    const fn = async () => {
        logger(`Installing SW (v.${SW_VERSION})`)

        registerApp(app)
        await registerNetworkDB(networkDB, CREDENTIALS)
        await registerAuthenticator(authenticator, CREDENTIALS)
        await registerOfflineDB(offlineDB, app.code, app.loaders)
        await cacheStatic(e, CACHE_NAME, app.sw.static)

        wf.auth.onAuthStateChanged(async (credential) => {
            userCredential = credential
            const msg = credential ? 'User logged in:' : 'User logged out'
            logger(msg, credential)

            if (userCredential) {
                const userId = userCredential.uid
                const user = await MUser.install(wf, userId)
                await prefetchDynamicRoutes(app.ui)
            }else{
                 // TODO: unregister user content in offline-DB
            }
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
    }

    e.waitUntil(fn())
}

const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

const prefetchRequest = async (request) => {
    const url = new URL(request.url)
    const { ui } = app

    const dynamicKey = isDynamicPathname({ ui, url })
    if (!dynamicKey) return

    const { loader } = ui[dynamicKey]
    if (!loader) {
        const err = `Module ${dynamicKey} has no loader function to work offline for ${url}`
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

    const { response } = await buildDynamicResponse({ ui, url, cacheName: CACHE_NAME })
    if (!response) {
        const err = `Dynamic response for ${url} couldn't be built`
        logger(err)
        return { err }
    }

    const cache = await caches.open(CACHE_NAME)
    await cache.put(new Request(url), response)

    logger(`Dynamic response cached successfully for ${url}`)
}

const fetchHdlr = (e) => {
    const fn = async () => {
        if (isDocumentRequest(e.request)) {
            const url = new URL(e.request.url)

            const redirectForAuth = !userCredential && routeRequiresAuth({ ui: app.ui, url })
            if (redirectForAuth){
                logger('Redirecting to login because user is not authenticated')
                // TODO: Clear cached routes that need authentication
                return Response.redirect('/login', 302)
            }

            const prefetchRequestPromise = prefetchRequest(e.request)
            
            const prefetchStatus = await Promise.any([
                prefetchRequestPromise,
                (async (ms, url) => {
                    await delay(ms)
                    return { err: `Fetch for ${url} took more than ${ms}ms. Content updated will be ready for next fetch` }
                })(MAX_FETCH_MS, url)
            ])

            prefetchStatus?.err ? logger(prefetchStatus?.err) : logger(`Fetch for ${url} is up to date!`)
        }

        return offlineFirst(e.request, CACHE_NAME)
    }

    if (isRequestHandledBySW(e.request)) e.respondWith(fn())
}

addEventListener('install', installHdlr)
addEventListener('activate', activateHdlr)
addEventListener('fetch', fetchHdlr)

export const SW_VERSION = 280

const CACHE_NAME = getCacheName(`sw-${app.code}`, SW_VERSION)
const MAX_LOADER_MS = 3000
const MAX_FETCH_MS = 1500