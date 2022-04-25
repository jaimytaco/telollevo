import { openDB, deleteDB, IDBPTransaction, IDBPDatabase } from 'idb'
import { getIndexedDBDatabases } from '../helpers/browser.helper'
import { ILocalDbInit } from '../interfaces/localDb.model.interface'
import { IIndexedDBDatabase } from '../interfaces/browser.interface'

export class IndexedDb {
    static dbPrefix = 'telollevo-idb'
    static dbVersion = 'v1'
    static storeNames = [
        'products'
    ]
    static indexes = {
        'products': ['name']
    }
    static stores = {}
    static localDatabases: Promise<IIndexedDBDatabase[]>
    static isSWNotReady = false
    static isFirstLoad = false
    static localDbPromise: Promise<IDBPDatabase<unknown>>
    static isOfflineFirst = false

    static getDbName = (): string => `${this.dbPrefix}-${this.dbVersion}`

    static init = async (swState: boolean): Promise<ILocalDbInit> => {
        this.localDatabases = getIndexedDBDatabases()
        this.isSWNotReady = swState
        await this.clearPreviousDB()
        this.isFirstLoad = !(await this.dbExist(this.getDbName()))
        this.localDbPromise = this.openDatabase()
        this.isOfflineFirst = typeof (await this.localDbPromise) !== 'undefined'

        return {
            isOfflineFirst: this.isOfflineFirst,
            isFirstLoad: this.isFirstLoad
        }
    }

    static openDatabase = () => {
        const storeNames = this.storeNames
        const stores = this.stores
        const indexes = this.indexes
        const getObjetcStore = this.getObjetcStore

        return openDB(this.getDbName(), 1, {
            upgrade(upgradeDb, oldVersion, newVersion, transaction) {
                console.log('storeNames =', storeNames)
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

    static getObjetcStore = (transaction: IDBPTransaction<unknown, string[], "versionchange">, storeName: string) => {
        try {
            return transaction.objectStore(storeName);
        } catch (e) {
            return null;
        }
    }

    static clearPreviousDB = async () => {
        const localDatabases = await this.localDatabases
        return localDatabases
            .filter(ldb => ldb.name.startsWith(this.dbPrefix) && ldb.name !== this.getDbName())
            .map(ldb => deleteDB(ldb.name))
    }

    static dbExist = async (dbName: string) => {
        const localDatabases = await this.localDatabases;
        return localDatabases
            .map(ldb => ldb.name)
            .includes(dbName)
    }

    static getInitialData = async (collectionName: string, /*filters: IDatabaseFilter[],*/ mode: 'single' | 'all') => {
        const ldb = await this.localDbPromise
        if (!ldb) return
        // if (!filters.length) return

        let query = ldb.transaction(collectionName).objectStore(collectionName)
        // if (filters[0].method.includes('-by')) query = query.index(`by-${filters[0].key}`)

        // if (mode === 'single') return [await query.get(filters[0].value)]
        if (mode === 'all') return query.getAll()
    }

    static add = async (collectionName: string, doc: any) => {
        const ldb = await this.localDbPromise
        if (!ldb) return
        const tx = ldb.transaction(collectionName, 'readwrite')
        const store = tx.objectStore(collectionName)
        store.put(doc)
        return tx.oncomplete
    }
}