export interface IIndexedDB extends IDBFactory{
    databases: () => Promise<IDBDatabaseInfo[]>
}

export interface IIndexedDBDatabase{
    name: string
    version: number
}