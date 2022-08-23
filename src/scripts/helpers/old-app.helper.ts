import {
    fonts,
    images,
    scripts,
    styles,
    routes,
} from '@helpers/sw.helper'

import ModAdminOrders from '@modules/admin/orders.module'
import ModAdminFlights from '@modules/admin/flights.module'

// import MOrder from '@models/order.model'
// import MFlight from '@models/flight.model'
// import MQuotation from '@models/quotation.model'
// import MUser from '@models/user.model'

// const x = {
//     name: '',
//     code: '',
//     version: 1,
//     routes: {
//         static: [
//             ...fonts,
//             ...images,
//             ...scripts,
//             ...styles,
//             ...routes,
//         ],
//         '/admin/orders': {
//             code: 'admin-orders',
//             pattern: '/admin/orders{/}?',
//             builder: ModAdminOrders.builder,
//             loader: ModAdminOrders.loader,
//             withAuth: true,
//         }
//     },
//     models: [
//         MOrder.collection,
//         MFlight.collection,
//         MQuotation.collection,
//         MUser.collection,
//     ]
// }

export const app = {
    name: 'Te lo llevo',
    code: 'telollevo',
    ui: {
        'admin-orders': {
            pathname: '/admin/orders',
            builder: ModAdminOrders.builder,
            pattern: '/admin/orders{/}?',
            withAuth: true,
            loader: ModAdminOrders.loader,
        },
        // 'admin-flights': {
        //     pathname: '/admin/flights',
        //     builder: ModAdminFlights.builder,
        //     pattern: '/admin/flights{/}?',
        //     withAuth: true,
        // },
    },
    loaders: {
        'orders': () => {},
        'quotations': () => {},
        'users': () => {},
        'flights': () => {},
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

    const { SW_VERSION } = await import('@scripts/workers/sw.worker') // Hack to generate sw.worker.js file
    const { registerSW } = await import('@wf/actors/pwa.actor')

    registerSW()

    const { 
        configCreateOrderDialog,

        configCreateFlightDialog,
        configFlightToVisible,
        configSelectQuotationInQuotedOrder,

        configLogin
    } = await import('@helpers/util.helper')

    const { 
        registerApp,
        registerNetworkDB,
        registerOfflineDB,
        registerAuthenticator,
        updateOfflineDB,
        wf
    } = await import('@wf/lib.worker')

    const { CREDENTIALS } = await import('@helpers/database.helper')
    const { default: networkDB } = await import('@wf/services/firebase.firestore.service')
    const { default: offlineDB } = await import('@wf/services/indexedDb.service')

    registerApp(app)
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
            configFlightToVisible(wf)
            configCreateFlightDialog(wf, 'create-flight_dialog')
        },
        'public-login': () => {
            configLogin(wf)
        }
    }

    if (actions[getBodyPage()]) actions[getBodyPage()]()
}