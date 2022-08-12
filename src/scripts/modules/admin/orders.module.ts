import MUser from '@models/user.model'
import MFlight from '@models/flight.model'
import MOrder from '@models/order.model'
import MQuotation from '@models/quotation.model'

import { IOrder } from '@types/order.type'
import { EFormat } from '@types/util.type'
import { IQuotation } from '@types/quotation.type'
import {
    logger,
    isNode
} from '@wf/helpers/browser.helper'
import {
    getOfflineTimestamp,
    updateOfflineTimestamp
} from '@wf/lib.worker'

import { createOrder_dialog } from '@data/admin/dialog.data'
import { capitalizeString } from '@helpers/util.helper'
import CTable from '@components/table.component'
import { adminHeader } from '@helpers/ui.helper'


const loader = async (wf) => {
    const { mode, auth } = wf
    const lastUpdate = await getOfflineTimestamp('orders')
    const { uid: userId } = await auth.getCurrentUser()
    const done = 1

    const orders = await MOrder.getAllByShopperId(wf, mode.Network, EFormat.Raw, userId, lastUpdate) as IOrder[]

    if (orders?.err) {
        const { err } = orders
        logger(err)
        return { err }
    }

    if (!orders.length) {
        logger('There is no orders to cache offline for admin-orders')
        return { done }
    }

    logger(`Orders to cache offline for admin-orders: `, orders)

    await Promise.all(
        orders.map((order) => MOrder.add(wf, mode.Offline, order))
    )

    logger('All orders cached offline succesfully')

    await updateOfflineTimestamp('orders', new Date())

    const quotationsByOrder = await Promise.all(
        orders.map((order) => MQuotation.getAllByOrderId(wf, mode.Network, EFormat.Raw, order.id))
    )

    for (const quotations of quotationsByOrder) {
        if (quotations?.err) {
            const { err } = quotations
            logger(err)
            return { err }
        }
    }

    const allQuotations = quotationsByOrder.flat(1) as IQuotation[]

    logger(`All quotations to cache offline for admin-orders: `, allQuotations)

    await Promise.all(
        allQuotations
            .map((quotation) => MQuotation.add(wf, mode.Offline, quotation))
    )

    logger('All quotations cached offline succesfully')

    await updateOfflineTimestamp('quotations', new Date())

    const flightIds = [...new Set(allQuotations.map((quotation) => quotation.flightId))]
    const flights = await MFlight.getAllByIds(wf, mode.Network, flightIds, EFormat.Raw) as IFlight[]
    
    logger(`All flights to cache offline for admin-orders: `, flights)

    await Promise.all(
        flights.map((flight) => MFlight.add(wf, mode.Offline, flight))
    )

    logger('All flights cached offline succesfully')

    await updateOfflineTimestamp('flights', new Date())

    return { done }
}

const builder = async (wf) => {
    const emptyContent = {
        head: {
            title: '',
            meta: ''
        },
        body: `${createOrder_dialog}`
    }

    if (isNode())
        return emptyContent

    const userCredential = await wf.auth.getCurrentUser()
    if (!userCredential) {
        logger('Builder for admin-orders needs user authentication')
        return emptyContent
    }

    const user = await MUser.get(wf, wf.mode.Offline, userCredential.uid, EFormat.Raw)

    const orders = await MOrder.getAll(wf, wf.mode.Offline, EFormat.Pretty)
    if (orders?.err) {
        logger(orders.err)
        return { err: orders.err }
    }

    const rows = orders.map(MOrder.toRow)

    const allStatus = Object.values(MOrder.EOrderStatus).map((status) => capitalizeString(status))
    const filters = [...allStatus]

    const allSorters = Object.values(MOrder.EOrderSorters)
    const sorters = [...allSorters]

    const tableHTML = CTable.render('Pedidos', rows, filters, sorters)

    const title = `${wf.app.name} | Pedidos`

    // TODO: Define meta tags for admin-orders
    const meta = `
        <meta name="description" content="DESCRIPTION">
        <meta property="og:url" content="OG_URL">
        <meta property="og:type" content="OG_TYPE">
    `

    const body = `
        ${adminHeader(
        user,
        `
            <div class="n-t-actions-2">
                <button class="btn btn-secondary btn-sm" data-create-order-dialog_btn>
                    <picture>
                        <img src="/img/icon/plus-light.svg" width="14" height="14">
                    </picture>
                    <span>Registrar pedido</span>
                </button>
            </div>
            `, 'orders', 'órdenes')
        }
        <main>
            ${tableHTML}
        </main>
        ${createOrder_dialog}
    `

    return {
        head: { title, meta },
        body
    }
}

export default {
    loader,
    builder
}