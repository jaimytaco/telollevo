import { EDatabaseMode } from './enums/database.enum'
import {
    isNode,
    supportsWorkerType,
    supportsIndexedDB,
} from './helpers/browser.helper'

interface IWebFluid {
    models?: T[],
    database?: T,
    isOfflineFirst?: boolean,
    isFirstLoad?: boolean
}

export const wf: IWebFluid = {}

export const registerNetworkDB = async (networkDB: T) => {
    const { ADatabase } = await import('./actors/database.actor')

    if (isNode()) {
        wf.database = ADatabase
        wf.database.initNetwork(networkDB)
        await wf.database.register(EDatabaseMode.Network)
    } else {
        if (supportsWorkerType()) {
            const { wrap } = await import('comlink')
            const WDatabase = (await import('./workers/database.worker?worker')).default
            wf.database = await wrap(new WDatabase())
        } else wf.database = ADatabase

        const { proxy } = await import('comlink')
        wf.database.initNetwork(proxy(networkDB))
    }
}

export const registerOfflineDB = async (networkDB: T, offlineDB: T) => {
    if (!isNode()) {
        if (wf.database.NetworkDB) wf.database.initNetwork(networkDB)

        const { proxy } = await import('comlink')

        wf.database.initOffline(proxy(offlineDB))

        await wf.database.register(EDatabaseMode.Network)

        if (supportsIndexedDB()) {
            const { isOfflineFirst, isFirstLoad } = await wf.database.register(EDatabaseMode.Offline)
            wf.isOfflineFirst = isOfflineFirst
            wf.isFirstLoad = isFirstLoad
        }
    }
}

export const updateOfflineDB = async (models, loaders) => {
    if (wf?.isOfflineFirst && wf?.isFirstLoad) {
        await wf?.database?.loadOfflineDatabase(Object.keys(models), loaders)
    }
}

const addModel = (key, value) => {
    wf.models ? null : wf.models = {}
    wf.models[key] = {
        _collection: key,
        ...value
    }
}

export const registerModels = (models: T) => Object.keys(models)
    .forEach(key => addModel(key, models[key]))

// export const registerSW = async () => {
//     const { APWA } = await import('./actors/pwa.actor')
//     return APWA.registerSW
// }

export const getHTML = async ({ pathname, viewId }) => {
    const { AUI } = await import('./actors/ui.actor')
    const { ui } = await import('../utils')

    const { content, err } = await AUI.getDynamicContent({ lib: wf, builders: ui, pathname, viewId })
    if (err) return { err }

    const blankResponse = await fetch(getBlankPathname())
    const blankText = await blankResponse.text()

    const html = blankText
        .replace(getTitleTag(), content.head.title)
        .replace(getMetaTag(), content.head.meta)
        .replace(getBodyTag(), content.body)

    return { html }
}

export const get404Pathname = () => '/404'

const getBlankPathname = () => '/blank'

const getTitleTag = () => '<!-- [TITLE] -->'
const getMetaTag = () => '<!-- [META] -->'
const getBodyTag = () => '<!-- [BODY] -->'

// TODO
export const isStaticPathname = (pathname: string) => true

export const isDynamicPathname = ({ url, pattern }) => {
    return Object.keys(ui)
        .find(key => {
            const urlPattern = new URLPattern({ pathname: ui[key].pattern })
            return urlPattern.test(url.href) || ui[key].pathname === url.pathname
        })
}

// TODO
export const isViewUpdatable = () => true