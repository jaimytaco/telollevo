import {
    wrap,
    proxy
} from 'comlink'
import { EDatabaseMode } from './enums/database.enum'
import {
    isNode,
    supportsWorkerType,
    supportsIndexedDB,
} from './helpers/browser.helper'
import { AUI } from './actors/ui.actor'
import { ui } from '../utils'
import { ADatabase } from './actors/database.actor'

import WDatabase from './workers/database.worker?worker'

interface IWebFluid {
    models?: T[],
    database?: T,
    isOfflineFirst?: boolean,
    isFirstLoad?: boolean
}

export const wf: IWebFluid = {}

export const registerNetworkDB = async (networkDB: T) => {
    if (isNode()) {
        wf.database = ADatabase
        wf.database.initNetwork(networkDB)
        await wf.database.register(EDatabaseMode.Network)
    } else {
        if (supportsWorkerType()) {
            wf.database = await wrap(new WDatabase())
        } else wf.database = ADatabase

        wf.database.initNetwork(proxy(networkDB))
    }
}

export const getHTML = async ({ pathname, viewId }) => {
    const { content, err } = await AUI.getDynamicContent({ lib: wf, builders: ui, pathname, viewId })
    if (err) return { err }

    const blankResponse = await fetch(getBlankPathname())
    const blankText = await blankResponse.text()

    const html = blankText
        .replace(getTitleTag(), content.head.title)
        .replace(getMetaTag(), content.head.meta)
        .replace(getBodyTag(), content.body)

    return { html }
}

export const cacheFromNetwork = async ({ cacheName, url, pattern }) => {
    const { pathname } = url

    if (!isDynamicPathname({ url, pattern })) return
    const { html, err } = await getHTML({ pathname })

    if (err) return { err }
    const cache = await caches.open(cacheName)
    return cache.put(new Request(pathname), new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }))
}

const getBlankPathname = () => '/blank'

const getTitleTag = () => '<!-- [TITLE] -->'
const getMetaTag = () => '<!-- [META] -->'
const getBodyTag = () => '<!-- [BODY] -->'

const isDynamicPathname = ({ url, pattern }) => {
    return Object.keys(ui)
        .find(key => {
            const urlPattern = new URLPattern({ pathname: ui[key].pattern })
            // return urlPattern.test(url.href) || ui[key].pathname === url.pathname
            return urlPattern.test(url.href)
        })
}