import { EDatabaseMode } from './enums/database.enum'
import { isNode, supportsWorkerType, supportsIndexedDB } from './helpers/browser.helper'

interface IWebFluid {
    models?: T[],
    database?: T,
    isOfflineFirst?: boolean,
    isFirstLoad?: boolean
}

export interface IError {
    err: T
}

export const wf: IWebFluid = {
    database: {}
}

export const addModel = (key, value) => {
    wf.models ? null : wf.models = {}
    wf.models[key] = {
        _collection: key,
        ...value
    }
}

const registerDB = async (onlineDB: T, localDB: T) => {
    const { ADatabase } = await import('./actors/database.actor')
    
    if (isNode()) {
        wf.database = ADatabase
        // wf.database.init(onlineDB, localDB)
        wf.database.initOnline(onlineDB)
        await wf.database.register(EDatabaseMode.Online)
    } else {
        if (supportsWorkerType()) {
            const { wrap } = await import('comlink')
            const WDatabase = (await import('./workers/database.worker?worker')).default
            wf.database = await wrap(new WDatabase())
        } else wf.database = ADatabase

        const { proxy } = await import('comlink')

        // wf.database.init(proxy(onlineDB), proxy(localDB))
       
        wf.database.initOnline(proxy(onlineDB))
        wf.database.initLocal(proxy(localDB))

        await wf.database.register(EDatabaseMode.Online)

        if (supportsIndexedDB()) {
            const { isOfflineFirst, isFirstLoad } = await wf.database.register(EDatabaseMode.Local)
            wf.isOfflineFirst = isOfflineFirst
            wf.isFirstLoad = isFirstLoad
        }
    }
}

const registerOnlineDB = async (onlineDB: T) => {
    const { ADatabase } = await import('./actors/database.actor')
    
    if (isNode()) {
        wf.database = ADatabase
        wf.database.initOnline(onlineDB)
        await wf.database.register(EDatabaseMode.Online)
    } else {
        if (supportsWorkerType()) {
            const { wrap } = await import('comlink')
            const WDatabase = (await import('./workers/database.worker?worker')).default
            wf.database = await wrap(new WDatabase())
        } else wf.database = ADatabase

        const { proxy } = await import('comlink')       
        wf.database.initOnline(proxy(onlineDB))
    }
}

const registerLocalDB = async (onlineDB: T, localDB: T) => {
    if (!isNode()){
        if (wf.database.OnlineDB) wf.database.initOnline(onlineDB)
        
        const { proxy } = await import('comlink')  

        wf.database.initLocal(proxy(localDB))

        await wf.database.register(EDatabaseMode.Online)

        if (supportsIndexedDB()) {
            const { isOfflineFirst, isFirstLoad } = await wf.database.register(EDatabaseMode.Local)
            wf.isOfflineFirst = isOfflineFirst
            wf.isFirstLoad = isFirstLoad
        }
    }
}

const registerModels = (models: T) => Object.keys(models)
    .forEach(key => addModel(key, models[key]))

export const registerWF = async ({ models, loaders, services, sw, ui }) => {
    const { OnlineDB, LocalDB } = services

    // await registerDB(OnlineDB, LocalDB)
    await registerOnlineDB(OnlineDB)
    console.timeEnd('online-db')
    await registerLocalDB(OnlineDB, LocalDB)
    console.timeEnd('local-db')
    
    registerModels(models)

    if (wf.isOfflineFirst && wf.isFirstLoad)
        await wf.database.loadLocalDatabase(Object.keys(models), loaders)

    // await registerUI(ui)

    if (sw.actor) {
        await sw.actor.registerSW()

        if (sw.dynamic?.length) {
            const { getCacheName } = await import('./workers/sw.worker')
            const { AUI } = await import('./actors/ui.actor')

            for (const pathname of sw.dynamic) {
                const { content, err } = await AUI.getDynamicContent({ lib: wf, builders: ui, pathname })
                if (err) continue
                const blankResponse = await fetch('/blank')
                const blankText = await blankResponse.text()
                const html = blankText
                    .replace('<!-- [TITLE] -->', content.head.title)
                    .replace('<!-- [META] -->', content.head.meta)
                    .replace('<!-- [BODY] -->', content.body)

                const cacheName = getCacheName(sw.cache.prefix)
                const cache = await caches.open(cacheName)
                await cache.put(new Request(pathname), new Response(html, { headers: { 'content-type': 'text/html' } }))
            }

            // const { isDynamicPathname } = await import('../utils')
            // if (isDynamicPathname()) location.reload()
        }
    }
}

// export const registerUI = async (ui) => {
//     // const paths = Object.keys(ui)

//     // for (const path of paths) {
//     //     console.log('path =', path)
//     //     const content = await ui[path].builder(wf)
//     //     console.log('content =', content)

//     //     // const response = await serveFromCache(new Request('/blank'))
//     //     // const blank = await response.text()
//     //     // const html = blank
//     //     //     .replace('<!-- [TITLE] -->', content.head.title)
//     //     //     .replace('<!-- [META] -->', content.head.meta)
//     //     //     .replace('<!-- [BODY] -->', content.body)

//     //     // console.log('html =', html)
//     // }

//     const { AUI } = await import('./actors/ui.actor')
//     wf.ui = AUI
// }
