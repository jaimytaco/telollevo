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

const register = async ({ mode, prefix, loaders, credentials }): Promise<void> | Promise<IOfflineDbInit> => {
    if (mode === EDatabaseMode.Network) return NetworkDB.register(credentials)
    if (mode === EDatabaseMode.Offline) return OfflineDB.register(prefix, loaders)
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

const ADatabaseMethods = {
    getAll,
    add,
    update,
    get
}

const isNetworkDBRegistered = () => !!NetworkDB

export const ADatabase = {
    register,
    ...ADatabaseMethods,
    methods: Object.keys(ADatabaseMethods),
    
    setNetworkDB,
    setOfflineDB,
    isNetworkDBRegistered
}