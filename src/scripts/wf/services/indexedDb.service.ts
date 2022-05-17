import { openDB, deleteDB, IDBPTransaction } from 'idb'
import { getIndexedDBDatabases } from '../helpers/browser.helper'

const dbPrefix = 'telollevo-idb'
const dbVersion = 'v1'

const storeNames = [
    'products'
]

const indexes = {
    'products': ['name']
}

const stores = {}

const localDatabases = getIndexedDBDatabases()
let localDbPromise = null

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
                    stores['products'] = upgradeDb.createObjectStore('products', {
                        keyPath: 'id'
                    })

                    indexes['products']
                        .forEach(index => stores['products'].createIndex(`by-${index}`, `${index}`))
            }
        }
    })
}

const getInitialData = async (collectionName: string, /*filters: IDatabaseFilter[],*/ mode: 'single' | 'all') => {
    const ldb = await localDbPromise
    if (!ldb) return
    // if (!filters.length) return

    const query = ldb.transaction(collectionName).objectStore(collectionName)
    // if (filters[0].method.includes('-by')) query = query.index(`by-${filters[0].key}`)

    // if (mode === 'single') return [await query.get(filters[0].value)]
    if (mode === 'all') return query.getAll()
}

const add = async (collectionName: string, doc: T) => {
    const ldb = await localDbPromise
    if (!ldb) return
    const tx = ldb.transaction(collectionName, 'readwrite')
    const store = tx.objectStore(collectionName)
    store.put(doc)
    return tx.oncomplete
}

const register = async (): Promise<T> => {
    await clearPreviousDB()
    const isFirstLoad = !(await existDB(getDBName()))
    localDbPromise = openDatabase()
    const isOfflineFirst = typeof (await localDbPromise) !== 'undefined'

    return {
        isOfflineFirst,
        isFirstLoad
    }
}


export default {
    register,
    add,
    getInitialData
}
