import {
    fonts,
    images,
    scripts,
    styles,
    routes,
    ESWStatus,
} from '@helpers/sw.helper'

import ModLogin from '@modules/login.module'
import ModAdminOrders from '@modules/admin/orders.module'
import ModAdminFlights from '@modules/admin/flights.module'

import MOrder from '@models/order.model'
import MFlight from '@models/flight.model'
import MQuotation from '@models/quotation.model'
import MUser from '@models/user.model'

import { logger } from '@wf/helpers/browser.helper'


export const app = {
    name: 'Te lo llevo',
    code: 'telollevo',
    version: 1,
    routes: {
        static: [
            ...fonts,
            ...images,
            ...scripts,
            ...styles,
            ...routes,
        ],
        '/admin/orders': {
            code: 'admin-orders',
            pattern: '/admin/orders{/}?',
            builder: ModAdminOrders.builder,
            loader: ModAdminOrders.loader,
            withAuth: true,
        },
        '/admin/flights': {
            code: 'admin-flights',
            pattern: '/admin/flights{/}?',
            builder: ModAdminFlights.builder,
            loader: ModAdminFlights.loader,
            withAuth: true,
        }
    },
    models: [
        MOrder.collection,
        MFlight.collection,
        MQuotation.collection,
        MUser.collection,
    ]
}

export const initApp = async () => {
    const { SW_VERSION } = await import('@scripts/workers/sw.worker') // Hack to generate sw.worker.js file
    const { delay } = await import('@helpers/util.helper')
    const {
        registerSW,
        subscribeToSWMessage,
        getSWState,
        supportsSW,
    } = await import('@wf/actors/pwa.actor')

    if (!supportsSW()) {
        // TODO: Show error message
        // TODO: Consider client-side rendering
        logger('SW not supported')
        return
    }

    const registration = await registerSW()
    if (registration?.err){
        logger('ServiceWorker registration failed: ', registration.err)
        return
    }

    const forceReload = document.body.matches('.force-reload')
    logger(`forceReload: ${forceReload}`)

    const swState = registration?.active?.state
    logger(`SW State: ${swState}`)
    
    if (!swState){
        logger('No SW installed')
        return
    }

    if (forceReload){
        // await delay(3000)
        logger('Forcing reload')
        location.reload()
        return
    }

    const {
        registerApp,
        registerNetworkDB,
        registerOfflineDB,
        registerAuthenticator,
        wf
    } = await import('@wf/lib.worker')

    const { CREDENTIALS } = await import('@helpers/database.helper')
    const { default: networkDB } = await import('@wf/services/firebase.firestore.service')
    const { default: offlineDB } = await import('@wf/services/indexedDb.service')

    registerApp(app)
    await registerNetworkDB(networkDB, CREDENTIALS)
    await registerOfflineDB(offlineDB, app.code, app.models)

    const { default: authenticator } = await import('@wf/services/firebase.auth.service')
    await registerAuthenticator(authenticator, CREDENTIALS)

    const actions = {
        '/login': ModLogin.action,
        '/admin/orders': ModAdminOrders.action,
        '/admin/flights': ModAdminFlights.action,
    }

    const { pathname } = location
    if (actions[pathname]) {
        if (app.routes[pathname]?.withAuth) {
            // TODO: Enable logout
            const { default: ModAdminAuth } = await import('@modules/admin/auth.module')
            ModAdminAuth.configSignOut(wf)
        }

        await actions[pathname](wf)
    }

    // TODO: Refactor this logic in a module
    await delay(1000)
    document.body.classList.add('is-loaded')
}