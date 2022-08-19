import MFlight from '@models/flight.model'

import { 
    IOrder,
    EOrderStatus, 
    EOrderShoppers, 
    EOrderFields 
} from '@types/order.type'
import MOrder from '@models/order.model'

import { 
    EFormat,
    ECoin, 
    EShippingDestination 
} from '@types/util.type'

import { IQuotation } from '@types/quotation.type'
import MQuotation from '@models/quotation.model'

import { EUserType } from '@types/user.type'
import MUser from '@models/user.model'

import {
    logger,
    isNode
} from '@wf/helpers/browser.helper'

import {
    getOfflineTimestamp,
    updateOfflineTimestamp
} from '@wf/lib.worker'

import { createOrder_dialog } from '@data/admin/dialog.data'
import { 
    capitalizeString,
    getDOMElement, 
    delay, 
} from '@helpers/util.helper'
import CTable from '@components/table.component'
import { adminHeader } from '@helpers/ui.helper'

// const configSelectQuotationInQuotedOrder = async (wf) => {
//     const selectQuotationBtns = getDOMElement(document, '[data-select-quotation_btn]', 'all')
//     selectQuotationBtns?.forEach((selectQuotationBtn) => selectQuotationBtn.onclick = async () => {
//         console.log('--- selectQuotationBtn =', selectQuotationBtn)
//     })
// }

const configCreateOrderDialog = async (wf, dialogId) => {
    const { default: CForm } = await import('@components/form.component')

    const dialog = getDOMElement(document, `#${dialogId}`)
    if (!dialog) return

    // STEP-1
    const step1Form = getDOMElement(dialog, '#create-order-step-1_form')
    if (!step1Form) return
    const btnSubmitStep1 = getDOMElement(step1Form, 'button[type="submit"]')
    if (!btnSubmitStep1) return
    CForm.init(step1Form.id)
    
    const createOrderBtns = getDOMElement(document, '[data-create-order-dialog_btn]', 'all')
    const { default: CDialog } = await import('@components/dialog.component')

    createOrderBtns?.forEach((createOrderBtn) => createOrderBtn.onclick = () => {
        CDialog.handle('create-order_dialog', 'add')
        step1Form.classList.add('active')
    })

    // TODO: use order local object?
    const order = {}

    btnSubmitStep1.onclick = (e) => {
        e.preventDefault()
        CForm.validateBeforeSubmit(step1Form)
    }

    step1Form.onsubmit = async (e) => {
        e.preventDefault()

        const nameInput = getDOMElement(step1Form,`#${EOrderFields.ProductName}`)
        if (!nameInput) return
        const name = nameInput.value
        
        const categoryInput = getDOMElement(step1Form, `[list="${EOrderFields.ProductCategory}"]`)
        if (!categoryInput) return
        const category = categoryInput.value

        const urlInput = getDOMElement(step1Form, `#${EOrderFields.ProductUrl}`)
        if (!urlInput) return
        const url = urlInput.value

        const priceInput = getDOMElement(step1Form, `#${EOrderFields.ProductPrice}`)
        if (!priceInput) return
        const price = parseFloat(priceInput.value)

        const unitsInput = getDOMElement(step1Form, `#${EOrderFields.ProductUnits}`)
        if (!unitsInput) return
        const units = parseInt(unitsInput.value)

        const isBoxIncludedInputChecked = getDOMElement(step1Form, `[name="${EOrderFields.ProductIsBoxIncluded}"]:checked`)
        const isBoxIncluded = isBoxIncludedInputChecked ? isBoxIncludedInputChecked.value === 'yes' : null
        
        // TODO: Define somewhere what is the current coin
        const coin = ECoin.USD.code
        const status = EOrderStatus.Registered

        const userCredentials = await wf.auth.getCurrentUser()
        const shopperId = userCredentials ? userCredentials.uid : null
        
        order.product = {
            name,
            category,
            url,
            price,
            units,
            isBoxIncluded,
            coin,
        }

        order.status = status
        order.shopperId = shopperId

        const validateStatus = CForm.validateOnSubmit(step1Form, MOrder.sanitize, order)
        if (validateStatus?.err) return

        logger('create-order-dialog step-1 with order:', order)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }


    // STEP-2
    const step2Form = getDOMElement(dialog, '#create-order-step-2_form')
    if (!step2Form) return
    const btnSubmitStep2 = getDOMElement(step2Form, 'button[type="submit"]')
    if (!btnSubmitStep2) return
    CForm.init(step2Form.id)

    btnSubmitStep2.onclick = (e) => {
        e.preventDefault()
        CForm.validateBeforeSubmit(step2Form)
    }

    step2Form.onsubmit = (e) => {
        e.preventDefault()

        const weightMore5kgInput = getDOMElement(step2Form, `[name="${EOrderFields.ProductWeightMore5kg}"]:checked`)
        if (!weightMore5kgInput) return
        const weightMore5kg = weightMore5kgInput.value === 'yes'

        const isTaller50cmInput = getDOMElement(step2Form, `[name="${EOrderFields.ProductIsTaller50cm}"]:checked`)
        if (!isTaller50cmInput) return
        const isTaller50cm = isTaller50cmInput.value === 'yes'

        const isOneUnitPerProductInput = getDOMElement(step2Form, `[name="${EOrderFields.ProductIsOneUnitPerProduct}"]:checked`)
        if (!isOneUnitPerProductInput) return
        const isOneUnitPerProduct = isOneUnitPerProductInput.value === 'yes'

        const shipperInput = getDOMElement(step2Form, `[name="${EOrderFields.Shipper}"]`)
        if (!shipperInput) return
        const shipper = shipperInput.value

        const commentsInput = getDOMElement(step2Form, `#${EOrderFields.Comments}`)
        if (!commentsInput) return
        const comments = commentsInput.value

        order.product = {
            ...order.product,
            weightMore5kg,
            isTaller50cm,
            isOneUnitPerProduct
        }

        order.comments = comments
        order.shipper = shipper
        
        const validateStatus = CForm.validateOnSubmit(step2Form, MOrder.sanitize, order)
        if (validateStatus?.err) return

        logger('create-order-dialog step-2 with order:', order)

        step2Form.classList.remove('active')
        step3Form.classList.add('active')
    }


    // STEP-3
    const step3Form = getDOMElement(dialog, '#create-order-step-3_form')
    if (!step3Form) return
    const btnSubmitStep3 = getDOMElement(step3Form, 'button[type="submit"]')
    if (!btnSubmitStep3) return
    CForm.init(step3Form.id)

    btnSubmitStep3.onclick = (e) => {
        e.preventDefault()
        CForm.validateBeforeSubmit(step3Form)
    }

    step3Form.onsubmit = (e) => {
        e.preventDefault()

        const shippingDestination = (getDOMElement(step3Form, `[name="${EOrderFields.ShippingDestination}"]:checked`)).value
        order.shippingDestination = shippingDestination

        // const sanitizeStatus = MOrder.sanitize(order)
        // if (sanitizeStatus?.err){
        //     const { field, desc } = sanitizeStatus.err
        //     if (!field){
        //         logger(`Sanitize error: ${desc} for order`, order)
        //         return
        //     }

        //     const invalidFieldset = getDOMElement(step3Form,`#${field}`)?.parentNode 
        //     if (invalidFieldset){
        //         CForm.handleInvalid('add', desc, invalidFieldset)
        //         invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        //         logger(`Sanitize error: ${desc}${field ? ` in field ${field} ` : ''}for order`, order)
        //         return
        //     }
        // }
        const validateStatus = CForm.validateOnSubmit(step3Form, MOrder.sanitize, order)
        if (validateStatus?.err) return

        logger('create-order-dialog step-3 with order:', order)

        step3Form.classList.remove('active')
        step4Form.classList.add('active')
    }


    // STEP-4
    const step4Form = getDOMElement(dialog, '#create-order-step-4_form')
    if (!step4Form) return
    const btnSubmitStep4 = getDOMElement(step4Form, 'button[type="submit"]')
    if (!btnSubmitStep4) return
    CForm.init(step4Form.id)

    btnSubmitStep4.onclick = (e) => {
        e.preventDefault()
        CForm.validateBeforeSubmit(step4Form)
    }

    step4Form.onsubmit = async (e) => {
        e.preventDefault()

        const shopper = (getDOMElement(step4Form, `[name="${EOrderFields.Shopper}"]`)).value
        order.shopper = shopper

        // const sanitizeStatus = MOrder.sanitize(order)
        // if (sanitizeStatus?.err){
        //     const { field, desc } = sanitizeStatus.err
        //     if (!field){
        //         logger(`Sanitize error: ${desc} for order`, order)
        //         return
        //     }

        //     const invalidFieldset = getDOMElement(step4Form,`#${field}`)?.parentNode 
        //     if (invalidFieldset){
        //         CForm.handleInvalid('add', desc, invalidFieldset)
        //         invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        //         logger(`Sanitize error: ${desc}${field ? ` in field ${field} ` : ''}for order`, order)
        //         return
        //     }
        // }
        const validateStatus = CForm.validateOnSubmit(step4Form, MOrder.sanitize, order)
        if (validateStatus?.err) return

        const now = new Date()
        order.createdAt = now
        order.updatedAt = now

        logger('create-order-dialog step-4 with order:', order)

        const { data, err } = await MOrder.add(wf, wf.mode.Network, order)
        await MOrder.add(wf, wf.mode.Offline, data)

        // TODO: Turn loading animation on dialog

        step4Form.classList.remove('active')
        step5Form.classList.add('active')
    }

    const step5Form = getDOMElement(dialog, '#create-order-confirmation-step-5_form')

    step5Form.onsubmit = async (e) => {
        e.preventDefault()
        // TODO: Improve animation after create-order
        step5Form.classList.remove('active')
        CDialog.handle('create-order_dialog', 'remove')
        await delay(1500)
        location.reload()
    }
}

const loader = async (wf) => {
    const { mode, auth } = wf
    const lastUpdate = await getOfflineTimestamp('orders')
    const { uid: userId } = await auth.getCurrentUser()
    const done = 1

    const user = await MUser.get(wf, mode.Offline, userId, EFormat.Raw)
    
    const orders = await MOrder.getAllByUserAuthenticated(wf, mode.Network, EFormat.Raw, user, lastUpdate) as IOrder[]

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
    // configSelectQuotationInQuotedOrder(wf)
}

export default {
    loader,
    builder,
    action
}