import { expose } from 'comlink'
import { ADatabase } from '../actors/database.actor'
import { isWorker } from '../helpers/browser.helper'

if (isWorker()) expose(ADatabase)