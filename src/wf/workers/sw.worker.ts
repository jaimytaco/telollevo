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
    logger,
} from '@wf/lib.worker'

import {
    cacheStatic,
    serveFromCache,
    removePreviousCaches,
    getCacheName,
    sendMessage,
    isDocumentRequest,
    isRequestHandledBySW
} from '@wf/helpers/sw.helper'

import networkDB from '@wf/services/firebase.firestore.service'
import offlineDB from '@wf/services/indexedDb.service'

import authenticator from '@wf/services/firebase.auth.service'

let userCredential

const onInstall = async (e) => {
    await registerNetworkDB(networkDB, CREDENTIALS)
    await registerAuthenticator(authenticator, CREDENTIALS)

    wf.auth.onAuthStateChanged(async (credential) => {
        userCredential = credential
        const msg = credential ? 'User logged in:' : 'User logged out'
        logger(msg, credential)
    })

    const x =  typeof ServiceWorkerGlobalScope !== 'undefined'
    console.log('x =', x)

    await registerOfflineDB(offlineDB, app.code, app.loaders)

    cacheStatic(e, getCacheName(`sw-${app.code}`, SW_VERSION), app.sw.static)
}

const onFetch = (e) => {
    let fetchResponse

    e.waitUntil((async () => {
        if (isDocumentRequest(e.request)) {
            const url = new URL(e.request.url)
            const doesPathnameRequiresAuth = pathnameRequiresAuth({ ui: app.ui, url })
            const redirectForAuth = !userCredential && doesPathnameRequiresAuth

            if (redirectForAuth) {
                fetchResponse = Response.redirect('/login', 302)
                return
            }

            console.log(`${e.request.url} updating cache`)
            await updateOfflineDB(app.loaders)
            await cacheDynamically({ ui: app.ui, cacheName: getCacheName(`sw-${app.code}`, SW_VERSION), url })

            fetchResponse = serveFromCache(e.request, getCacheName(`sw-${app.code}`, SW_VERSION))
        }
    })())

    return fetchResponse || fetch(e.request)
}

const onActivate = (e) => {
    removePreviousCaches(`sw-${app.code}`, [getCacheName(`sw-${app.code}`, SW_VERSION)])
}

addEventListener('install', (e) => {
    sendMessage({ msg: 'install' })
    skipWaiting()
    e.waitUntil(onInstall(e))
})

addEventListener('activate', (e) => {
    sendMessage({ msg: 'activate' })
    e.waitUntil(onActivate(e))
    return self.clients.claim()
})

addEventListener('fetch', (e) => {
    if (isRequestHandledBySW(e.request)) e.respondWith(onFetch(e))
})

export const SW_VERSION = 65