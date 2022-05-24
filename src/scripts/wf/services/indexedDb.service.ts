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

const openDatabase = () => {
    return openDB(getDBName(), 1, {
        upgrade(upgradeDb, oldVersion, newVersion, transaction) {
            storeNames
                .forEach(store => stores[store] = getObjetcStore(transaction, store))

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

const getAll = async (collectionName, filters) => {
    if (!localDbPromise) throw 'offline DB not opened'
    const query = (await localDbPromise).transaction(collectionName).objectStore(collectionName)
    const docs = await query.getAll()
    const filterFns = !filters ? 
        null : 
        filters
            .map((filter) => {
                return (doc) => formatOperation(doc[filter.field], filter.value, filter.operator)
            })

    return !filterFns ? 
        docs : 
        filterFns
            .reduce((acc, filterFn) => {
                acc = acc.filter((doc) => filterFn(doc))
                return acc
            }, docs)
}

const get = async (collectionName, id) => {
    if (!localDbPromise) throw 'offline DB not opened'
    const query = (await localDbPromise).transaction(collectionName).objectStore(collectionName)
    return query.get('by-id', id)
}

const add = async (collectionName: string, doc: T) => {
    if (!localDbPromise) throw 'offline DB not opened'
    const tx = (await localDbPromise).transaction(collectionName, 'readwrite')
    const store = tx.objectStore(collectionName)
    store.put(doc)
    return tx.oncomplete
}

const register = async (prefix, models): Promise<T> => {
    dbPrefix = 'telollevo-idb'
    storeNames = Object.keys(models)

    await clearPreviousDB()
    const isFirstLoad = !(await existDB(getDBName()))
    localDbPromise = openDatabase()
    const isOfflineFirst = typeof (await localDbPromise) !== 'undefined'
    return {
        isOfflineFirst,
        isFirstLoad
    }
}

let dbPrefix
let dbVersion = 'v1'
let storeNames
let localDbPromise

const stores = {}

export default {
    register,
    add,
    getAll
}
