import {
    adminOrders,
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
    const { default: CTable } = await import('@components/table.component')
    const { default: CCard8 } = await import('@components/card8.component')
    const { getDOMElement } = await import('@helpers/util.helper')

    console.log('--- getBodyPage =', getBodyPage())

    switch (getBodyPage()) {
        case 'admin-orders':
            const extraRows = getDOMElement(document, '.t-r-extra', 'all')
            const extraRowIds = extraRows.map((extraRow) => extraRow.id)
            extraRowIds.forEach((extraRowId) => CTable.handleRowExtra(extraRowId))

            CCard8.handleAll()
            
            break
    }
}