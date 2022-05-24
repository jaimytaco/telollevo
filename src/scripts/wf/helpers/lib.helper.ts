import { 
    EDatabaseMode 
} from '../enums/database.enum'

import {
    isNode,
    supportsWorkerType,
    supportsIndexedDB,
} from '../helpers/browser.helper'

import {
    ADatabase
} from '../actors/database.actor'

import { 
    wrap, 
    proxy 
} from 'comlink'

import { 
    AUI 
} from '../actors/ui.actor'

import { 
    ui 
} from '../../config'

import WDatabase from '../workers/database.worker?worker'

export default{
    EDatabaseMode,
    isNode,
    supportsWorkerType,
    supportsIndexedDB,
    ADatabase,
    wrap, 
    proxy,
    AUI,
    ui
}