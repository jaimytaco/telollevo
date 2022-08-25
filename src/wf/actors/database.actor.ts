import { EDatabaseMode } from '../enums/database.enum'
import { isNode } from '../helpers/browser.helper'
import { formatFn } from '../helpers/lib.helper'

interface IOfflineDbInit {
    isOfflineFirst: boolean
    isFirstLoad: boolean,
}

let NetworkDB
let OfflineDB

const setNetworkDB = (db: T) => NetworkDB = db

const setOfflineDB = (db: T) => OfflineDB = db

const initApp = (db, credentials) => db.initApp(credentials)

const register = async ({ mode, prefix, models }): Promise<void> | Promise<IOfflineDbInit> => {
    if (mode === EDatabaseMode.Network) return NetworkDB.register()
    if (mode === EDatabaseMode.Offline) return OfflineDB.register(prefix, models)
}

const getAll = (mode, collectionName, filters?) => {
    if (isNode()) mode = EDatabaseMode.Network
    if (mode === EDatabaseMode.Network) return NetworkDB.getAll(collectionName, filters)
    if (mode === EDatabaseMode.Offline) return OfflineDB.getAll(collectionName, filters)
}

const add = (mode, collectionName: string, doc: T): Promise<T> => {
    if (mode === EDatabaseMode.Network) return NetworkDB.add(collectionName, doc)
    if (mode === EDatabaseMode.Offline) return OfflineDB.add(collectionName, doc)
}

const update = (mode, collectionName: string, doc: T): Promise<T> => {
    if (mode === EDatabaseMode.Network) return NetworkDB.update(collectionName, doc)
    if (mode === EDatabaseMode.Offline) return OfflineDB.update(collectionName, doc)
}

const get = (mode, collectionName, id) => {
    if (mode === EDatabaseMode.Network) return NetworkDB.get(collectionName, id)
    if (mode === EDatabaseMode.Offline) return OfflineDB.get(collectionName, id)
}

const remove = (mode, collectionName, id) => {
    if (mode === EDatabaseMode.Offline) return OfflineDB.remove(collectionName, id);
}

const runWithTransaction = (mode, collectionName, docData, callback) => {
    if (mode === EDatabaseMode.Network) return NetworkDB.runWithTransaction(collectionName, docData, formatFn(callback))
}

const customRunWithTransaction = (transactionData, onTransaction) => {
    return NetworkDB.customRunWithTransaction(transactionData, onTransaction)
}

const formatDocForDB = (docData: T) => NetworkDB.formatDocForDB(docData)

const ADatabaseMethods = {
    getAll,
    add,
    update,
    get,
    remove,

    runWithTransaction,
    customRunWithTransaction,

    formatDocForDB,
}

export const ADatabase = {
    initApp,

    register,
    ...ADatabaseMethods,
    methods: Object.keys(ADatabaseMethods),
    
    setNetworkDB,
    setOfflineDB,
}