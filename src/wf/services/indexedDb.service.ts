import { 
    openDB, 
    deleteDB, 
    IDBPTransaction 
} from 'idb'

import { 
    getIndexedDBDatabases 
} from '../helpers/browser.helper'

import {
    EOperator
} from '../enums/database.enum'


const localDatabases = getIndexedDBDatabases()

const getDBName = (): string => `${dbPrefix}-${dbVersion}`

const clearPreviousDB = async () => (await localDatabases)
    .filter(ldb => ldb.name.startsWith(dbPrefix) && ldb.name !== getDBName())
    .map(ldb => deleteDB(ldb.name))

const existDB = async (dbName: string) => (await localDatabases)
    .map(ldb => ldb.name)
    .includes(dbName)

const getObjetcStore = (transaction: IDBPTransaction<unknown, string[], 'versionchange'>, storeName: string) => {
    try {
        return transaction.objectStore(storeName);
    } catch (e) {
        return null; 
    }
}

const openDatabase = (storeNames: string[]) => {
    return openDB(getDBName(), 1, {
        upgrade(upgradeDb, oldVersion, newVersion, transaction) {

            storeNames.push('offline-timestamp')
            for (const storeName of storeNames)
                stores[storeName] = getObjetcStore(transaction, storeName)

            switch (oldVersion) {
                case 0:
                    for (const storeName of storeNames)
                        stores[storeName] = upgradeDb.createObjectStore(storeName, {
                            keyPath: 'id'
                        })


                    // stores['products'] = upgradeDb.createObjectStore('products', {
                    //     keyPath: 'id'
                    // })

                    // indexes['products']
                    //     .forEach(index => stores['products'].createIndex(`by-${index}`, `${index}`))
            }
        }
    })
}

const formatOperation = (a, b, op) => {
    if (op === EOperator.LessThan) return a < b
    if (op === EOperator.LessThanOrEqualTo) return a <= b
    if (op === EOperator.EqualTo) return a === b
    if (op === EOperator.GreaterThan) return a > b
    if (op === EOperator.GreaterThanOrEqualTo) return a >= b
    if (op === EOperator.NotEqualTo) return a !== b
}

const remove = async (collectionName, key) => {
    if (!localDbPromise) return { err: 'offline DB not opened' }
    const tx = (await localDbPromise).transaction(collectionName, 'readwrite');
    const store = tx.objectStore(collectionName);
    store.delete(key);
    // return tx.complete;
    return tx.oncomplete
}

const getAll = async (collectionName, filters) => {
    if (!localDbPromise) return { err: 'offline DB not opened' }
    const query = (await localDbPromise).transaction(collectionName).objectStore(collectionName)
    const docs = await query.getAll()
    const filterFns = !filters ? 
        null : 
        filters
            .map((filter) => {
                return (doc) => formatOperation(doc[filter.field], filter.value, filter.operator)
            })

    const data = !filterFns ? 
        docs : 
        filterFns
            .reduce((acc, filterFn) => {
                acc = acc.filter((doc) => filterFn(doc))
                return acc
            }, docs)

    return { data }
}

const get = async (collectionName, id) => {
    if (!localDbPromise) return { err: 'offline DB not opened' }
    const query = (await localDbPromise).transaction(collectionName).objectStore(collectionName)
    const data = await query.get(id)
    return { data }
}

const add = async (collectionName: string, doc: T) => {
    if (!localDbPromise) return { err: 'offline DB not opened' }
    const tx = (await localDbPromise).transaction(collectionName, 'readwrite')
    const store = tx.objectStore(collectionName)
    store.put(doc)
    await tx.oncomplete
    return { data: doc }
}

const update = add

const register = async (prefix, models): Promise<T> => {
    dbPrefix = `${prefix}-idb`
    await clearPreviousDB()
    const isFirstLoad = !(await existDB(getDBName()))
    localDbPromise = openDatabase(models)
    const isOfflineFirst = typeof (await localDbPromise) !== 'undefined'
    return {
        isOfflineFirst,
        isFirstLoad
    }
}

// const dbPrefix = 'emergencyphone-idb'
let dbPrefix
const dbVersion = 'v1'
// let storeNames
let localDbPromise

const stores = {}

export default {
    register,
    add,
    update,
    getAll,
    get,
    remove,
}