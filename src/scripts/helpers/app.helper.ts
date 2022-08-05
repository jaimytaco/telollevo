import {
    adminOrders,
    adminFlights,
} from '@helpers/ui.helper'

import {
    fonts,
    images,
    scripts,
    styles,
    routes,
} from '@helpers/sw.helper'

import ModAdminOrders from '@modules/adminOrders.module'


export const app = {
    name: 'Te lo llevo',
    code: 'telollevo',
    ui: {
        'admin-orders': {
            pathname: '/admin/orders',
            builder: adminOrders,
            // builder: ModAdminOrders.builder,
            pattern: '/admin/orders{/}?',
            withAuth: true,
            loader: ModAdminOrders.loader,
        },
        'admin-flights': {
            pathname: '/admin/flights',
            builder: adminFlights,
            pattern: '/admin/flights{/}?',
        }
    },
    loaders: {
        'orders': () => {},
        'quotations': () => {},
    },
    sw: {
        cache: {
            version: 1
        },
        static: [
            ...fonts,
            ...images,
            ...scripts,
            ...styles,
            ...routes,
        ],
    }
}

export const initApp = async () => {
    const { getBodyPage } = await import('@helpers/util.helper')
    const { default: CDialog } = await import('@components/dialog.component')
    const { default: CTable } = await import('@components/table.component')
    const { default: CCard8 } = await import('@components/card8.component')
    const { getDOMElement } = await import('@helpers/util.helper')

    const { SW_VERSION } = await import('@wf/workers/sw.worker') // Hack to generate sw.worker.js file
    const { registerSW } = await import('@wf/actors/pwa.actor')

    registerSW()

    const { 
        configCreateOrderDialog,

        configCreateFlightDialog,
        configApproveFlight,
        configSelectQuotationInQuotedOrder,

        configLogin
    } = await import('@helpers/util.helper')

    const { 
        registerNetworkDB,
        registerOfflineDB,
        registerAuthenticator,
        updateOfflineDB,
        wf
    } = await import('@wf/lib.worker')

    const { CREDENTIALS } = await import('@helpers/database.helper')
    const { default: networkDB } = await import('@wf/services/firebase.firestore.service')
    const { default: offlineDB } = await import('@wf/services/indexedDb.service')

    await registerNetworkDB(networkDB, CREDENTIALS)
    await registerOfflineDB(offlineDB, app.code, app.loaders)

    const { default: authenticator } = await import('@wf/services/firebase.auth.service')
    await registerAuthenticator(authenticator, CREDENTIALS)

    // TODO: make component of table-extra-row
    const extraRows = getDOMElement(document, '.t-r-extra', 'all')
    const extraRowIds = extraRows.map((extraRow) => extraRow.id)
    extraRowIds.forEach((extraRowId) => CTable.handleRowExtra(extraRowId))

    CCard8.handleAll()

    const actions = {
        'admin-orders': () => {
            CDialog.init('create-order_dialog')
            configCreateOrderDialog(wf, 'create-order_dialog')
            configSelectQuotationInQuotedOrder(wf)
        },
        'admin-flights': async () => {
            CDialog.init('create-flight_dialog')
            configApproveFlight(wf)
            configCreateFlightDialog(wf, 'create-flight_dialog')
        },
        'public-login': () => {
            configLogin(wf)
        }
    }

    if (actions[getBodyPage()]) actions[getBodyPage()]()
}