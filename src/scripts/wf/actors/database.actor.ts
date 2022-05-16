import { EDatabaseMode } from '../enums/database.enum'
import { isNode } from '../helpers/browser.helper'

interface ILocalDbInit {
    isOfflineFirst: boolean
    isFirstLoad: boolean,
}

const dataLoaders = {}

let OnlineDB
let LocalDB

const init = (onlineDB: T, localDB: T) => {
    OnlineDB = onlineDB
    LocalDB = localDB
}

const initOnline = (onlineDB: T) => {
    OnlineDB = onlineDB
}

const initLocal = (localDB: T) => {
    LocalDB = localDB
}

const register = async (mode: string): Promise<void> | Promise<ILocalDbInit> => {
    // if (mode === EDatabaseMode.Online) return OnlineDB.register()
    if (mode === EDatabaseMode.Local) return LocalDB.register()
}

const getAll = (collectionName: string, mode: string) => {
    if (isNode()) mode = EDatabaseMode.Online
    if (mode === EDatabaseMode.Online) return OnlineDB.getAll(collectionName)
    if (mode === EDatabaseMode.Local) return LocalDB.getInitialData(collectionName, 'all')
}

const add = (collectionName: string, doc: T, mode: string): Promise<T> => {
    // if (mode === EDatabaseMode.Online) return OnlineDB.add(collectionName, doc);
    if (mode === EDatabaseMode.Local) return LocalDB.add(collectionName, doc);
}

const registerLoaders = async (loaders) => {
    const datas = await Promise.all(
        loaders
            .map(loader => getAll(loader, EDatabaseMode.Online))
    )

    datas
        .forEach((data, i) => {
            dataLoaders[loaders[i]] = data
        })
}

const loadLocalDatabase = async (modelKeys, loaders) => {
    await registerLoaders(loaders)

    await Promise.all(
        modelKeys
            .map(collectionName => {
                const docs = dataLoaders[collectionName];
                if (!docs) return []
                console.info(`Loaded ${docs.length} docs in '${collectionName}'`)
                return docs
                    .map(doc => add(collectionName, doc, EDatabaseMode.Local))
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
    loadLocalDatabase,
    ...ADatabaseMethods,
    methods: Object.keys(ADatabaseMethods),
    init,
    
    initOnline,
    initLocal,
    OnlineDB,
    LocalDB
}