import { app } from '@helpers/app.helper'
import { DB_CREDENTIALS } from '@helpers/database.helper'

import {
    registerNetworkDB,
    registerOfflineDB,
    updateOfflineDB,
    cacheDynamically,
    cacheFromUI,
    isHTMLURL,
    wf,
} from '@wf/lib.worker'

import {
    cacheStatic,
    serveFromCache,
    removePreviousCaches,
    getCacheName,
    sendMessage
} from '@wf/helpers/sw.helper'

import networkDB from '@wf/services/firebase.firestore.service'
import offlineDB from '@wf/services/indexedDb.service'

const onInstall = (e) => {
    registerNetworkDB(networkDB, DB_CREDENTIALS)
    registerOfflineDB(offlineDB, app.code, app.loaders)

    cacheStatic(e, getCacheName(`sw-${app.code}`, SW_VERSION), app.sw.static)
}

const onFetch = (e) => {
    e.waitUntil((async () => {
        const url = new URL(e.request.url)
        if (isHTMLURL(url)) {
            await updateOfflineDB(app.loaders)
            await cacheDynamically({ ui: app.ui, cacheName: getCacheName(`sw-${app.code}`, SW_VERSION), url })
        }
    })())

    return serveFromCache(e.request, getCacheName(`sw-${app.code}`, SW_VERSION))
}

addEventListener('install', (e) => {
    sendMessage({msg: 'install'})

    skipWaiting()
    e.waitUntil(onInstall(e))
})

addEventListener('activate', (e) => {
    sendMessage({msg: 'activate'})

    e.waitUntil(removePreviousCaches(`sw-${app.code}`, [getCacheName(`sw-${app.code}`, SW_VERSION)]))
    return self.clients.claim()
})

addEventListener('fetch', (e) => {
    e.respondWith(onFetch(e))
})

export const SW_VERSION = 52