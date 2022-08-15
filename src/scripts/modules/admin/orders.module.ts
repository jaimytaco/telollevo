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


const configCreateOrderDialog = async (wf, dialogId) => {
    const { getDOMElement } = await import('@helpers/util.helper')
    const { default: CForm } = await import('@components/form.component')

    const dialog = getDOMElement(document, `#${dialogId}`)

    const step1Form = getDOMElement(dialog, '#create-order-step-1_form')
    const btnSubmitStep1 = getDOMElement(step1Form, 'button[type="submit"]')
    CForm.init(step1Form.id)

    const step2Form = getDOMElement(dialog, '#create-order-step-2_form')
    CForm.init(step2Form.id)
    
    const step3Form = getDOMElement(dialog, '#create-order-step-3_form')
    CForm.init(step3Form.id)

    const step4Form = getDOMElement(dialog, '#create-order-step-4_form')
    CForm.init(step4Form.id)

    const step5Form = getDOMElement(dialog, '#create-order-confirmation-step-5_form')
    CForm.init(step5Form.id)
    
    const createOrderBtns = getDOMElement(document, '[data-create-order-dialog_btn]', 'all')
    const { default: CDialog } = await import('@components/dialog.component')

    createOrderBtns?.forEach((createOrderBtn) => createOrderBtn.onclick = () => {
        CDialog.handle('create-order_dialog', 'add')
        step1Form.classList.add('active')
    })

    const { ECoin, EShippingDestination } = await import('@types/util.type')
    const { EOrderStatus, EOrderShoppers, EOrderFields } = await import('@types/order.type')
    const { logger } = await import('@wf/helpers/browser.helper')

    // TODO: use order local object
    const order = {}

    btnSubmitStep1.onclick = (e) => {
        e.preventDefault()
        CForm.resetInvalid(step1Form.id)
        const isFormValid = step1Form.checkValidity()
        if (!isFormValid){
            logger(`Form ${step1Form.id} is not HTML valid`)
            const invalidFieldset = getDOMElement(step1Form, 'fieldset.fs-invalid')
            if (invalidFieldset) invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            return
        }
        step1Form.requestSubmit()
    }

    step1Form.onsubmit = (e) => {
        e.preventDefault()

        const name = (getDOMElement(step1Form,`#${EOrderFields.ProductName}`)).value
        const category = (getDOMElement(step1Form, `[list="${EOrderFields.ProductCategory}"]`)).value
        const url = (getDOMElement(step1Form, `#${EOrderFields.ProductUrl}`)).value
        const price = parseFloat((getDOMElement(step1Form, `#${EOrderFields.ProductPrice}`)).value)
        const units = parseInt((getDOMElement(step1Form, `#${EOrderFields.ProductUnits}`)).value)
        const isBoxIncluded = (getDOMElement(step1Form, `[name="${EOrderFields.ProductIsBoxIncluded}"]:checked`)).value === 'yes'
        const coin = ECoin.USD.code
        const status = EOrderStatus.Registered
        
        order.product = {
            name,
            category,
            url,
            price,
            units,
            isBoxIncluded,
            coin
        }

        order.status = status

        const sanitizeStatus = MOrder.sanitize(order)
        if (sanitizeStatus?.err){
            const { field, desc } = sanitizeStatus.err
            if (!field){
                logger(`Sanitize error: ${desc} for order`, order)
                return
            }

            const invalidFieldset = getDOMElement(step1Form,`#${field}`).parentNode 
            CForm.handleInvalid('add', desc, invalidFieldset)
            if (invalidFieldset) invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            logger(`Sanitize error: ${desc}${field ? ` in field ${field} ` : ''}for order`, order)
            return
        }

        console.log('--- step 1 - order =', order)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }

    step2Form.onsubmit = (e) => {
        e.preventDefault()

        const weightMore5kg = (getDOMElement(step2Form, '[name="product-weight-more-5kg"]:checked')).value === 'yes'
        const isTaller50cm = (getDOMElement(step2Form, '[name="product-is-taller-50cm"]:checked')).value === 'yes'
        const isOneUnitPerProduct = (getDOMElement(step2Form, '[name="product-has-more-units"]:checked')).value === 'yes'
        const shipper = (getDOMElement(step2Form, '[name="order-shipper"]')).value
        const comments = (getDOMElement(step2Form, '#order-extra-comment')).value

        // TODO: validate product info in step-2

        order.product = {
            ...order.product,
            weightMore5kg,
            isTaller50cm,
            isOneUnitPerProduct
        }

        order.comments = comments
        order.shipper = shipper

        console.log('--- step 2 - order =', order)

        step2Form.classList.remove('active')
        step3Form.classList.add('active')
    }

    step3Form.onsubmit = (e) => {
        e.preventDefault()

        const shippingDestinationKey = (getDOMElement(step3Form, '[name="order-shipping-address"]:checked')).value
        // TODO: validate order info in step-3
        order.shippingDestination = EShippingDestination[shippingDestinationKey]

        console.log('--- step 3 - order =', order)

        step3Form.classList.remove('active')
        step4Form.classList.add('active')
    }

    step4Form.onsubmit = async (e) => {
        e.preventDefault()

        const shopperKey = (getDOMElement(step4Form, '[name="order-shopper"]')).value
        // TODO: validate order info in step-4
        order.shopper = EOrderShoppers[shopperKey]

        console.log('--- step 4 - order =', order)

        await wf.database.add(wf.mode.Network, 'orders', order)

        step4Form.classList.remove('active')
        step5Form.classList.add('active')
    }

    step5Form.onsubmit = (e) => {
        e.preventDefault()
        step5Form.classList.remove('active')
        CDialog.handle('create-order_dialog', 'remove')
    }
}

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
            ${CTable.render('Pedidos', rows, filters, sorters)}
        </main>
        ${createOrder_dialog}
    `

    return {
        head: { 
            title: `${wf.app.name} | Pedidos`, 
            meta: '' 
        },
        body
    }
}

const action = async (wf) => {
    const { default: CDialog } = await import('@components/dialog.component')
    const { default: CTable } = await import('@components/table.component')
    const { default: CCard8 } = await import('@components/card8.component')
    const { getDOMElement } = await import('@helpers/util.helper')

    const {
        configSelectQuotationInQuotedOrder,
    } = await import('@helpers/util.helper')

    // TODO: make component of table-extra-row
    const extraRows = getDOMElement(document, '.t-r-extra', 'all')
    const extraRowIds = extraRows.map((extraRow) => extraRow.id)
    extraRowIds.forEach((extraRowId) => CTable.handleRowExtra(extraRowId))

    CCard8.handleAll()

    CDialog.init('create-order_dialog')
    configCreateOrderDialog(wf, 'create-order_dialog')
    configSelectQuotationInQuotedOrder(wf)
}

export default {
    loader,
    builder,
    action
}