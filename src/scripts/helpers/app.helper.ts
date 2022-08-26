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

    if (!supportsSW()){
        // TODO: Show error message
        // TODO: Consider client-side rendering
        return
    }

    const swState = getSWState()
    
    registerSW()

    subscribeToSWMessage(async (msg) => {
        if (!swState && msg === ESWStatus.ContentReady){
            // TODO: Consider animation pre-reload
            location.reload()
            return
        }

        if (swState && msg === ESWStatus.Claimed){
            await delay(1500) // TODO: Check a way to detect claimed after user-installing
            // TODO: Show pop-up for new version of SW
        }
    })

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
    if (actions[pathname]){
        if (app.routes[pathname]?.withAuth){
            // TODO: Enable logout
            const { default: ModAdminAuth } = await import('@modules/admin/auth.module')
            ModAdminAuth.configSignOut(wf)
        }
        
        await actions[pathname](wf)
    }
}