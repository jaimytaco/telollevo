import { wrap } from 'comlink'
import { AUI } from './actors/ui.actor'
import { ADatabase } from './actors/database.actor'
import { APWA } from './actors/pwa.actor'
import { isNode } from './helpers/browser.helper'
import WDatabase from './workers/database.worker?worker'
import { EDatabaseMode } from './enums/database.enum'


export class WebFluid{
    static models: any // should be object
    static ui: any
    static database: any
    static loaders: String[]
    static renders: any[]

    static initDatabase = async (models) => {
        if (isNode()){
            this.database = ADatabase
            await this.database.init(EDatabaseMode.Online)
        }else{
            ADatabase.supportsWorkerType ? 
                this.database = await wrap(new WDatabase()) :
                this.database = ADatabase
    
            await this.database.init(EDatabaseMode.Online)
    
            if (this.database.supportsLocalDB){
                const { isOfflineFirst, isFirstLoad } = await this.database.init(EDatabaseMode.Local)
                if (isOfflineFirst && isFirstLoad) await this.database.loadLocalDatabase()
            }
        }

        this.initModels(models)
    }

    static initSW = async () => {
        if (isBrowser()) {
            this.pwa = APWA
            await this.pwa.registerSW()
        }
    }

    static initModels = (models) => {
        if (!models) throw 'no modules considered'
        
        for (const key of Object.keys(models)){
            models[key]['getAll'] = (mode: string) => this.database.getAll(key, mode)
        }

        this.models = models    
    }

    static init = async (models, loaders, renders) => {
        if (models && !models.length) throw 'no models considered'
        if (loaders && !loaders.length) throw 'no loaders considered'
        if (!renders) throw 'no renders considered'

        this.loaders = loaders
        this.renders = renders
        this.ui = AUI

        await this.initDatabase(models)
        // await this.initSW()

        globalThis.webfluid = {
            models: this.models,
            ui: this.ui,
            database: this.database,
            loaders: this.loaders,
            renders: this.renders
        }
    }
}