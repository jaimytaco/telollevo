import { 
    cacheStaticAssets, 
    removePreviousCaches, 
    handleFetch
} from '../helpers/sw.worker.helper'

addEventListener('install', (e: Event) => {
    e.waitUntil(cacheStaticAssets())
    skipWaiting()
})

addEventListener('activate', (e: Event) => {
    e.waitUntil(removePreviousCaches())
})

addEventListener('fetch', (e: Event) => {
    handleFetch(e)
})