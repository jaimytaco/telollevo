import { EDatabaseMode } from '../enums/database.enum'
import { isNode } from '../helpers/browser.helper'

interface IOfflineDbInit {
    isOfflineFirst: boolean
    isFirstLoad: boolean,
}

const dataLoaders = {}

let NetworkDB
let OfflineDB

const setNetworkDB = (db: T) => NetworkDB = db

const setOfflineDB = (db: T) => OfflineDB = db

const register = async (mode: string, prefix, models): Promise<void> | Promise<IOfflineDbInit> => {
    if (mode === EDatabaseMode.Offline) return OfflineDB.register()
}

const getAll = (mode, collectionName, filters) => {
    if (isNode()) mode = EDatabaseMode.Network
    if (mode === EDatabaseMode.Network) return NetworkDB.getAll(collectionName, filters)
    if (mode === EDatabaseMode.Offline) return OfflineDB.getAll(collectionName, filters)
}

const add = (mode, collectionName: string, doc: T): Promise<T> => {
    if (mode === EDatabaseMode.Network) return NetworkDB.add(collectionName, doc);
    if (mode === EDatabaseMode.Offline) return OfflineDB.add(collectionName, doc);
}

const update = (mode, collectionName: string, doc: T): Promise<T> => {
    if (mode === EDatabaseMode.Network) return NetworkDB.update(collectionName, doc);
}

const get = (mode, collectionName, id) => {
    if (mode === EDatabaseMode.Network) return NetworkDB.get(collectionName, id)
}

const registerLoaders = async (loaders) => {
    const datas = await Promise.all(
        loaders
            .map(loader => getAll(EDatabaseMode.Network, loader))
    )

    datas
        .forEach((data, i) => {
            dataLoaders[loaders[i]] = data
        })
}

const loadOfflineDatabase = async (modelKeys, loaders) => {
    await registerLoaders(loaders)

    await Promise.all(
        modelKeys
            .map(collectionName => {
                const docs = dataLoaders[collectionName];
                if (!docs) return []
                console.info(`Loaded ${docs.length} docs in '${collectionName}'`)
                return docs
                    .map(doc => add(collectionName, doc, EDatabaseMode.Offline))
            })
    )
}

const ADatabaseMethods = {
    getAll,
    add,
    update,
    get
}

const isNetworkDBRegistered = () => !!NetworkDB

export const ADatabase = {
    register,
    registerLoaders,
    loadOfflineDatabase,
    ...ADatabaseMethods,
    methods: Object.keys(ADatabaseMethods),
    
    setNetworkDB,
    setOfflineDB,
    // NetworkDB,
    // OfflineDB,
    isNetworkDBRegistered
}