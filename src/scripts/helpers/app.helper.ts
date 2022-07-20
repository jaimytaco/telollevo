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

export const app = {
    name: 'Te lo llevo',
    code: 'telollevo',
    ui: {
        'admin-orders': {
            pathname: '/admin/orders',
            builder: adminOrders,
            pattern: '/admin/orders{/}?'
        },
        'admin-flights': {
            pathname: '/admin/flights',
            builder: adminFlights,
            pattern: '/admin/flights{/}?'
        }
    },
    loaders: {

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
        ]
    }
}

export const initApp = async () => {
    const { getBodyPage } = await import('@helpers/util.helper')
    const { default: CDialog } = await import('@components/dialog.component')
    const { default: CTable } = await import('@components/table.component')
    const { default: CCard8 } = await import('@components/card8.component')
    const { getDOMElement } = await import('@helpers/util.helper')
    const { 
        configCreateOrderDialog,

        configCreateFlightDialog,
        configApproveFlight
    } = await import('@helpers/util.helper')

    const { 
        registerNetworkDB,
        registerOfflineDB,
        updateOfflineDB,
        wf
    } = await import('@wf/lib.worker')

    const { DB_CREDENTIALS } = await import('@helpers/database.helper')
    const { default: networkDB } = await import('@wf/services/firebase.firestore.service')
    const { default: offlineDB } = await import('@wf/services/indexedDb.service')

    await registerNetworkDB(networkDB, DB_CREDENTIALS)
    await registerOfflineDB(offlineDB, app.code, app.loaders)

    const extraRows = getDOMElement(document, '.t-r-extra', 'all')
    const extraRowIds = extraRows.map((extraRow) => extraRow.id)
    extraRowIds.forEach((extraRowId) => CTable.handleRowExtra(extraRowId))
    
    switch (getBodyPage()) {
        case 'admin-orders':
            CCard8.handleAll()
            CDialog.init('create-order_dialog')
            configCreateOrderDialog(wf, 'create-order_dialog')
            break
        case 'admin-flights':
            CCard8.handleAll()
            CDialog.init('create-flight_dialog')
            configApproveFlight(wf)
            configCreateFlightDialog(wf, 'create-flight_dialog')
            break
    }
}