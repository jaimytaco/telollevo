import { EDatabaseMode } from '../enums/database.enum'
import { isNode } from '../helpers/browser.helper'

interface IOfflineDbInit {
    isOfflineFirst: boolean
    isFirstLoad: boolean,
}

const dataLoaders = {}

let NetworkDB
let OfflineDB

const initNetwork = (db: T) => NetworkDB = db

const initOffline = (db: T) => OfflineDB = db

const register = async (mode: string): Promise<void> | Promise<IOfflineDbInit> => {
    // if (mode === EDatabaseMode.Network) return NetworkDB.register()
    if (mode === EDatabaseMode.Offline) return OfflineDB.register()
}

const getAll = (collectionName: string, mode: string) => {
    if (isNode()) mode = EDatabaseMode.Network
    if (mode === EDatabaseMode.Network) return NetworkDB.getAll(collectionName)
    if (mode === EDatabaseMode.Offline) return OfflineDB.getInitialData(collectionName, 'all')
}

const add = (collectionName: string, doc: T, mode: string): Promise<T> => {
    // if (mode === EDatabaseMode.Network) return NetworkDB.add(collectionName, doc);
    if (mode === EDatabaseMode.Offline) return OfflineDB.add(collectionName, doc);
}

const registerLoaders = async (loaders) => {
    const datas = await Promise.all(
        loaders
            .map(loader => getAll(loader, EDatabaseMode.Network))
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
    add
}

export const ADatabase = {
    register,
    registerLoaders,
    loadOfflineDatabase,
    ...ADatabaseMethods,
    methods: Object.keys(ADatabaseMethods),
    
    initNetwork,
    initOffline,
    NetworkDB,
    OfflineDB
}