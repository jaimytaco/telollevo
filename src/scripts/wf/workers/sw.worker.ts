import {
    models,
    loaders,
    sw,
    ui,
    // generator
} from '../../config'

import {
    registerNetworkDB,
    registerOfflineDB,
    updateOfflineDB,
    cacheDynamically,
    cacheFromUI,
    wf
} from '../lib.worker'

import {
    cacheStatic,
    serveFromCache,
    removePreviousCaches,
    getCacheName,
    sendMessage
} from '../helpers/sw.helper'

import { default as networkDB } from '../services/firebase.service'
import { default as offlineDB } from '../services/indexedDb.service'


let registerNetworkDBPromise
let registerOfflineDBPromise

const onInstall = async (e) => {
    // registerNetworkDBPromise = registerNetworkDB(networkDB)
    // registerOfflineDBPromise = registerOfflineDB(offlineDB)

    cacheStatic(e, getCacheName(sw.cache.prefix, SW_VERSION), sw.static)

    // await registerNetworkDBPromise
    // await registerOfflineDBPromise

    // await updateDB()

    // await cacheFromUI(ui, getCacheName(sw.cache.prefix, SW_VERSION))

    console.log('onInstall wf =', wf)
}

// TODO: Update db only when users hit reload (start fetching)
let isDBUpdating = false
const updateDB = async () => {
    if (!isDBUpdating){
        isDBUpdating = true
        await updateOfflineDB(models, loaders)
        isDBUpdating = false
    }
}

const onFetch = (e) => {
    // e.waitUntil((async () => {
    //     await updateDB()
    //     await cacheDynamically({ ui, cacheName: getCacheName(sw.cache.prefix, SW_VERSION), url: new URL(e.request.url) })
    // })())

    return serveFromCache(e.request, getCacheName(sw.cache.prefix, SW_VERSION))
}

addEventListener('install', (e) => {
    sendMessage({msg: 'install'})

    skipWaiting()
    e.waitUntil(onInstall(e))
})

addEventListener('activate', (e) => {
    sendMessage({msg: 'activate'})

    e.waitUntil(removePreviousCaches(sw.cache.prefix, [getCacheName(sw.cache.prefix, SW_VERSION)]))
    return self.clients.claim()
})

addEventListener('fetch', (e) => {
    e.respondWith(onFetch(e))
})

export const SW_VERSION = 30
