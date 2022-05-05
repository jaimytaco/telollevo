import { EDatabaseMode } from './enums/database.enum'
import { isNode, supportsWorkerType, supportsIndexedDB } from './helpers/browser.helper'
import WDatabase from './workers/database.worker?worker'

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
        wf.database.init(onlineDB, localDB)
        await wf.database.register(EDatabaseMode.Online)
    } else {
        if (supportsWorkerType()) {
            const { wrap } = await import('comlink')
            wf.database = await wrap(new WDatabase())
        } else wf.database = ADatabase

        const { proxy } = await import('comlink')

        wf.database.init(proxy(onlineDB), proxy(localDB))
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

export const registerWF = async (models: T, loaders: T[], onlineDB: T, localDB: T) => {
    await registerDB(onlineDB, localDB)
    registerModels(models)

    if (wf.isOfflineFirst && wf.isFirstLoad)
        await wf.database.loadLocalDatabase(Object.keys(models), loaders)
}

// globalThis.webfluid = wf
