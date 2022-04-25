import { wrap } from 'comlink'
import { AUI } from '../actors/ui.actor'
import { ADatabase } from '../actors/database.actor'
import { EDatabaseMode } from '../enums/database.enum'
import { isNode, isBrowser } from '../helpers/browser.helper'
import WDatabase from '../workers/database.worker?worker'
// import { IActors } from '../interfaces/actor.interface'
import { APWA } from '../actors/pwa.actor'

export const initApp = async () => {
    // globalThis.actors = {} as IActors
    globalThis.actors = {}
    globalThis.actors.ui = AUI

    if (isNode()){
        globalThis.actors.database = ADatabase
        await globalThis.actors.database.init(EDatabaseMode.Online)
    }
    else{
        ADatabase.supportsWorkerType ? 
            globalThis.actors.database = await wrap(new WDatabase()) :
            globalThis.actors.database = ADatabase

        await globalThis.actors.database.init(EDatabaseMode.Online)

        if (globalThis.actors.database.supportsLocalDB){
            const { isOfflineFirst, isFirstLoad } = await globalThis.actors.database.init(EDatabaseMode.Local)
            if (isOfflineFirst && isFirstLoad) await globalThis.actors.database.loadLocalDatabase()
        }
    }
}

export const initSW = async () => {
    if (isBrowser()) {
        globalThis.actors.pwa = APWA
        await globalThis.actors.pwa.registerSW()
    }
}