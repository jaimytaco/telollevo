import { IIndexedDB, IIndexedDBDatabase } from '../interfaces/browser.interface'

export const isNode = () => typeof process !== 'undefined'

export const isBrowser = () => typeof window === 'object'

export const isWorker = () => typeof importScripts === 'function'

export const isServiceWorker = () => typeof ServiceWorkerGlobalScope !== 'undefined'

// Taken from https://stackoverflow.com/questions/62954570/javascript-feature-detect-module-support-for-web-workers
export const supportsWorkerType = () => {
    let supports = false;
    const tester: any = {
        get type() { 
            supports = true
            return 
        } // it's been called, it's supported
    }
    try {
        // We use "blob://" as url to avoid an useless network request.
        // This will either throw in Chrome
        // either fire an error event in Firefox
        // which is perfect since
        // we don't need the worker to actually start,
        // checking for the type of the script is done before trying to load it.
        const worker = new Worker('blob://', tester)
    } finally {
        return supports
    }
}

export const supportsIndexedDB = () => isServiceWorker() || isBrowser() ? !!indexedDB : false

export const getIndexedDBDatabases: Promise<IIndexedDBDatabase[]> = () => (indexedDB as IIndexedDB).databases()

export const getServiceWorkerContainer = () => navigator.serviceWorker

export const getWorkerPath = (fn: string) => {
    const { DEV } = import.meta.env
    const WORKER_PREFIX = DEV ? '/src/scripts/workers/' : './'
    return fn.split(WORKER_PREFIX)[1]?.split('",')?.[0]
}