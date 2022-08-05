import { app } from '@helpers/app.helper'
import { CREDENTIALS } from '@helpers/database.helper'

import {
    registerNetworkDB,
    registerOfflineDB,
    updateOfflineDB,
    cacheDynamically,
    pathnameRequiresAuth,
    wf,

    registerAuthenticator,
    getDynamicResponse,
    isDynamicPathname,
    updateOfflineTimestamp
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

const installHdlr = (e) => {
    const fn = async () => {
        logger(`Installing SW (v.${SW_VERSION})`)

        await registerNetworkDB(networkDB, CREDENTIALS)
        await registerAuthenticator(authenticator, CREDENTIALS)
        await registerOfflineDB(offlineDB, app.code, app.loaders)

        wf.auth.onAuthStateChanged(async (credential) => {
            userCredential = credential
            const msg = credential ? 'User logged in:' : 'User logged out'
            logger(msg, credential)

            // TODO: unregister/register user content in offline-DB
            if (userCredential) {
                // await MUser.installOnAuth(wf, userCredential.uid)
            }
        })

        await cacheStatic(e, CACHE_NAME, app.sw.static)

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


const fetchHdlr = (e) => {
    const updateBeforeFetch = async (request) => {
        const url = new URL(e.request.url)
        const { ui } = app

        if (!isDocumentRequest(request)) return

        const dynamicKey = isDynamicPathname({ ui, url })
        if (!dynamicKey) return

        const { loader } = ui[dynamicKey]
        if (!loader)
            logger(`Module ${dynamicKey} has no loader function to work offline for ${e.request.url}`)
        
        const loaderStatus = await loader(wf)
        if (loaderStatus?.err){
            logger(`Error in loader for '${dynamicKey}' ~`, loaderStatus?.err)
            // TODO: Indicate in someway that the document is rendered with data outdated
            return
        }

        const { response } = await getDynamicResponse({ ui, url, cacheName: CACHE_NAME })
        if (!response){
            logger(`Dynamic response for ${e.request.url} couldn't be built`)
            return
        }

        const cache = await caches.open(CACHE_NAME)
        await cache.put(new Request(url.pathname), response)
        logger(`Dynamic response cached successfully`)
    }

    const fn = async () => {
        await updateBeforeFetch(e.request)
        return offlineFirst(e.request, CACHE_NAME)
    }

    if (isRequestHandledBySW(e.request)) e.respondWith(fn())
}

addEventListener('install', installHdlr)
addEventListener('activate', activateHdlr)
addEventListener('fetch', fetchHdlr)

export const SW_VERSION = 194
const CACHE_NAME = getCacheName(`sw-${app.code}`, SW_VERSION)