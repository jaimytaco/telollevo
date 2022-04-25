import { EDatabaseMode } from '../enums/database.enum'
import { ILocalDbInit } from '../interfaces/localDb.model.interface'
// import { IMProduct } from '../interfaces/model.interface'
import { IError } from '../interfaces/error.interface'
import { isNode, getServiceWorkerContainer, supportsWorkerType, supportsIndexedDB } from '../helpers/browser.helper'
import { Firebase as OnlineDB } from '../services/firebase.service'
import { IndexedDb as LocalDB } from '../services/indexedDb.service'
// import { IModels } from '../interfaces/model.interface'

export class ADatabase {
    static supportsWorkerType = supportsWorkerType()
    static supportsLocalDB = supportsIndexedDB()
    static models

    static init = (mode: string): Promise<void> | Promise<ILocalDbInit> => {
        if (mode === EDatabaseMode.Online) return OnlineDB.init()
        if (mode === EDatabaseMode.Local) return LocalDB.init(!getServiceWorkerContainer())
    }

    static getAll = (collectionName: string, mode: string) => {
        if (isNode()) mode = EDatabaseMode.Online

        if (mode === EDatabaseMode.Online) return OnlineDB.getAll(collectionName)
        if (mode === EDatabaseMode.Local) return LocalDB.getInitialData(collectionName, 'all')
    }

    static add = (collectionName: string, doc: any, mode: string): Promise<any> => {
        // if (mode === EDatabaseMode.Online) return OnlineDB.add(collectionName, doc);
        if (mode === EDatabaseMode.Local) return LocalDB.add(collectionName, doc);
    }

    static initDatas = async () => {
        const datas = await Promise.all(globalThis.webfluid.loaders
            .map(loader => this.getAll(loader, EDatabaseMode.Online)))
        
        for (const data of datas){
            this.datas[loader] = data
        }
    }

    static loadLocalDatabase = async () => {
        await this.initDatas()

        console.log('this.datas =', this.datas)

        await Promise.all(
            Object.keys(this.models)
                .map(collectionName => {
                    const docs = this.datas[collectionName];
                    console.info(`Loaded ${docs.length} docs in '${collectionName}'`)
                    return docs
                        .map(doc => this.add(collectionName, doc, EDatabaseMode.Local))
                })
        )
    }
}