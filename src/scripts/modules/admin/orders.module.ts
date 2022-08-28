import {
    IFlight
} from '@types/flight.type'
import MFlight from '@models/flight.model'

import { 
    EProductCategory 
} from '@types/product.type'

import { 
    IOrder,
    EOrderStatus, 
    EOrderShoppers, 
    EOrderFields,
    EOrderShippers,
} from '@types/order.type'
import MOrder from '@models/order.model'

import { 
    EFormat,
    ECoin, 
    EShippingDestination,
    EOrderProductQty,
    EConnectionStatus,
} from '@types/util.type'

import { 
    IQuotation,
    EQuotationStatus,
} from '@types/quotation.type'
import MQuotation from '@models/quotation.model'

import { 
    IUser, 
    EUserType 
} from '@types/user.type'
import MUser from '@models/user.model'

import ModAuth from '@modules/admin/auth.module'

import {
    logger,
    isNode
} from '@wf/helpers/browser.helper'

import {
    getOfflineTimestamp,
    updateOfflineTimestamp
} from '@wf/lib.worker'

import { 
    capitalizeString,
    getDOMElement, 
    delay, 
    MAX_FORM_FREEZING_TIME,
} from '@helpers/util.helper'

import CTable from '@components/table.component'

import { adminHeader } from '@helpers/ui.helper'


const configPickAndPayQuotationDialog = async (wf, dialogId) => {
    const { default: CDialog } = await import('@components/dialog.component')
    const { default: CForm } = await import('@components/form.component')

    const dialog = getDOMElement(document, `#${dialogId}`)
    if (!dialog) return
    CDialog.init(dialogId)

    // STEP-1
    const step1Form = getDOMElement(dialog, '#pick-and-pay-quotation-step-1_form')
    if (!step1Form) return
    const btnSubmitStep1 = getDOMElement(step1Form, 'button[type="submit"]')
    if (!btnSubmitStep1) return
    CForm.init(step1Form.id)

    const pickAndPayQuotationBtns = getDOMElement(document, '[data-pick-and-pay-quotation_btn]', 'all')
    pickAndPayQuotationBtns.forEach((pickAndPayQuotationBtn) => {
        pickAndPayQuotationBtn.onclick = async (e) => {
            e.preventDefault()
            step1Form.reset()

            const quotationId = pickAndPayQuotationBtn.getAttribute('data-quotation_id')
            btnSubmitStep1.setAttribute('data-quotation_id', quotationId)

            const quotation = await MQuotation.get(wf, wf.mode.Offline, quotationId, EFormat.Raw)
            if (quotation?.err) return
            const computedQuotation = await MQuotation.compute(wf, wf.mode.Offline, quotation)
            
            const priceSpan = getDOMElement(step1Form, '#price')
            if (!priceSpan) return
            priceSpan.textContent = computedQuotation.computed.priceStr
            
            const commissionSpan = getDOMElement(step1Form, '#commission')
            if (!commissionSpan) return
            commissionSpan.textContent = computedQuotation.computed.commissionStr

            const taxSpan = getDOMElement(step1Form, '#tax')
            if (!taxSpan) return
            taxSpan.textContent = computedQuotation.computed.taxStr

            const totalSpans = getDOMElement(step1Form, '#total, #submit-total', 'all')
            totalSpans.forEach((totalSpan) => { totalSpan.textContent = computedQuotation.computed.totalStr })

            CDialog.handle(dialogId, 'add')
            step1Form.classList.add('active')
        }
    })

    btnSubmitStep1.onclick = (e) => {
        e.preventDefault()
        CForm.validateBeforeSubmit(step1Form)
    }

    step1Form.onsubmit = async (e) => {
        e.preventDefault()

        const quotationId = btnSubmitStep1.getAttribute('data-quotation_id')
        // TODO: Show loading in UI
        const payedQuotationResponse = await MQuotation.toPaid(wf, quotationId)
        if (payedQuotationResponse?.err){
            logger(payedQuotationResponse.err.desc)
            // TODO: Show error in UI
            return
        }

        const payedQuotation = MQuotation.uncompute(payedQuotationResponse.data)
        await MQuotation.update(wf, wf.mode.Offline, payedQuotation)

        await MOrder.toPaid(wf, payedQuotation)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }

    // STEP-2
    const step2Form = getDOMElement(dialog, '#pick-and-pay-quotation-confirmation-step-2_form')
    if (!step2Form) return
    const btnSubmitStep2 = getDOMElement(step2Form, 'button[type="submit"]')
    if (!btnSubmitStep2) return
    CForm.init(step2Form.id)

    step2Form.onsubmit = async (e) => {
        e.preventDefault()
        // TODO: Improve animation after quote-order
        step2Form.classList.remove('active')
        CDialog.handle(dialogId, 'remove')
        await delay(1500)
        location.reload()
    }
}

const configQuoteOrderDialog = async (wf, dialogId) => {
    const { default: CDialog } = await import('@components/dialog.component')
    const { default: CForm } = await import('@components/form.component')

    const dialog = getDOMElement(document, `#${dialogId}`)
    if (!dialog) return
    CDialog.init(dialogId)

    // STEP-1
    const step1Form = getDOMElement(dialog, '#quote-order-step-1_form')
    if (!step1Form) return
    const btnSubmitStep1 = getDOMElement(step1Form, 'button[type="submit"]')
    if (!btnSubmitStep1) return
    CForm.init(step1Form.id)

    const quoteOrderBtns = getDOMElement(document, '[data-quote-order_btn]', 'all')
    quoteOrderBtns.forEach((quoteOrderBtn) => quoteOrderBtn.onclick = () => {
        CDialog.handle(dialogId, 'add')
        step1Form.classList.add('active')
        const orderId = quoteOrderBtn.getAttribute('data-quote-order_id')
        const option = getDOMElement(step1Form, '[data-order_id]')
        if (!option) return
        const input = getDOMElement(step1Form, '[list="quote-order"]')  
        if (!input) return
        input.value = option.value
    })

    btnSubmitStep1.onclick = (e) => {
        e.preventDefault()
        CForm.validateBeforeSubmit(step1Form)
    }

    step1Form.onsubmit = async (e) => {
        e.preventDefault()
        
        const orderInput = getDOMElement(step1Form, '[list="quote-order"]')
        if (!orderInput) return
        const orderOption = getDOMElement(step1Form, `#quote-order [value="${orderInput.value}"]`)
        const orderId = orderOption ? orderOption.getAttribute('data-order_id') : null
        const shopperId = orderOption ? orderOption.getAttribute('data-shopper_id') : null

        const flightInput = getDOMElement(step1Form, '[list="quote-flight"]')
        if (!flightInput) return
        const flightOption = getDOMElement(step1Form, `#quote-flight [value="${flightInput.value}"]`)
        const flightId = flightOption ? flightOption.getAttribute('data-flight_id') : null
        const travelerId = flightOption ? flightOption.getAttribute('data-traveler_id') : null

        const priceInput = getDOMElement(step1Form, '#quote-price')
        if (!priceInput) return
        const price = parseFloat(priceInput.value)

        const now = new Date()

        // TODO: use order local object?
        const quotation = {
            orderId,
            shopperId,
            flightId,
            travelerId,
            price,
            createdAt: now,
            updatedAt: now,
            coin: ECoin.USD.code,
            status: EQuotationStatus.Registered
        }

        const validateStatus = await CForm.validateOnSubmit(step1Form, MQuotation.sanitize, quotation)
        if (validateStatus?.err) return

        const response = await MQuotation.doQuote(wf, quotation)
        if (response?.err){
            CForm.showInvalid(step1Form, response.err, quotation)
            return
        }

        await MQuotation.add(wf, wf.mode.Offline, response.data)
        // await MOrder.toQuoted(wf, orderId)

        logger('quote-order-dialog step-1 with quotation:', quotation)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }

    // STEP-2
    const step2Form = getDOMElement(dialog, '#quote-order-confirmation-step-2_form')
    if (!step2Form) return
    const btnSubmitStep2 = getDOMElement(step2Form, 'button[type="submit"]')
    if (!btnSubmitStep2) return
    CForm.init(step2Form.id)

    step2Form.onsubmit = async (e) => {
        e.preventDefault()
        // TODO: Improve animation after quote-order
        step2Form.classList.remove('active')
        CDialog.handle(dialogId, 'remove')
        await delay(1500)
        location.reload()
    }

}

const configCreateOrderDialog = async (wf, dialogId) => {
    const { default: CDialog } = await import('@components/dialog.component')
    const { default: CForm } = await import('@components/form.component')

    const dialog = getDOMElement(document, `#${dialogId}`)
    if (!dialog) return
    CDialog.init(dialogId)

    // STEP-1
    const step1Form = getDOMElement(dialog, '#create-order-step-1_form')
    if (!step1Form) return
    
    const createOrderBtns = getDOMElement(document, '[data-create-order-dialog_btn]', 'all')
    createOrderBtns.forEach((createOrderBtn) => createOrderBtn.onclick = () => {
        CDialog.handle('create-order_dialog', 'add')
        step1Form.classList.add('active')
    })

    CForm.init(step1Form.id)

    const order = {}

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

        const validateStatus = await CForm.validateOnSubmit(step1Form, MOrder.sanitize, order)
        if (validateStatus?.err) {
            CForm.showInvalid(step1Form, validateStatus.err, order)
            return
        }

        CForm.handleFreeze(step1Form)
        await delay(MAX_FORM_FREEZING_TIME)
        CForm.handleFreeze(step1Form, 'unfreeze')

        logger('create-order-dialog step-1 with order:', order)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }


    // STEP-2
    const step2Form = getDOMElement(dialog, '#create-order-step-2_form')
    if (!step2Form) return
    
    CForm.init(step2Form.id)

    step2Form.onsubmit = async (e) => {
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
        
        const validateStatus = await CForm.validateOnSubmit(step2Form, MOrder.sanitize, order)
        if (validateStatus?.err){
            CForm.showInvalid(step2Form, validateStatus.err, order)
            return
        }

        CForm.handleFreeze(step2Form)
        await delay(MAX_FORM_FREEZING_TIME)
        CForm.handleFreeze(step2Form, 'unfreeze')

        logger('create-order-dialog step-2 with order:', order)

        step2Form.classList.remove('active')
        step3Form.classList.add('active')
    }


    // STEP-3
    const step3Form = getDOMElement(dialog, '#create-order-step-3_form')
    if (!step3Form) return
    
    CForm.init(step3Form.id)

    step3Form.onsubmit = async (e) => {
        e.preventDefault()

        const shippingDestination = (getDOMElement(step3Form, `[name="${EOrderFields.ShippingDestination}"]:checked`)).value
        order.shippingDestination = shippingDestination
        
        const validateStatus = await CForm.validateOnSubmit(step3Form, MOrder.sanitize, order)
        if (validateStatus?.err){
            CForm.showInvalid(step3Form, validateStatus.err, order)
            return
        }

        CForm.handleFreeze(step3Form)
        await delay(MAX_FORM_FREEZING_TIME)
        CForm.handleFreeze(step3Form, 'unfreeze')

        logger('create-order-dialog step-3 with order:', order)

        step3Form.classList.remove('active')
        step4Form.classList.add('active')
    }


    // STEP-4
    const step4Form = getDOMElement(dialog, '#create-order-step-4_form')
    if (!step4Form) return

    CForm.init(step4Form.id)

    step4Form.onsubmit = async (e) => {
        e.preventDefault()

        const shopper = (getDOMElement(step4Form, `[name="${EOrderFields.Shopper}"]`)).value
        order.shopper = shopper
        
        const validateStatus = await CForm.validateOnSubmit(step4Form, MOrder.sanitize, order)
        if (validateStatus?.err){
            CForm.showInvalid(step4Form, validateStatus.err, order)
            return
        }

        const now = new Date()
        order.createdAt = now
        order.updatedAt = now

        CForm.handleFreeze(step4Form)

        const networkResponse = await MOrder.add(wf, wf.mode.Network, order)
        if (networkResponse?.err){
            await delay(MAX_FORM_FREEZING_TIME)
            CForm.showInvalid(step4Form, { inForm: true, desc: EConnectionStatus.NetworkError }, order)
            CForm.handleFreeze(step4Form, 'unfreeze')
            return
        }
        
        // TODO: Consider handling error for offline-db
        const offlineResponse = await MOrder.add(wf, wf.mode.Offline, networkResponse.data)
        // if (offlineResponse?.err){
        //     await delay(MAX_FORM_FREEZING_TIME)
        //     CForm.showInvalid(step4Form, { inForm: true, desc: offlineResponse.err }, networkResponse.data)
        //     CForm.handleFreeze(step4Form, 'unfreeze')
        //     return
        // }

        logger('create-order-dialog step-4 with order:', order)

        await delay(MAX_FORM_FREEZING_TIME)
        CForm.handleFreeze(step4Form, 'unfreeze')

        step4Form.classList.remove('active')
        step5Form.classList.add('active')
    }

    const step5Form = getDOMElement(dialog, '#create-order-confirmation-step-5_form')

    step5Form.onsubmit = async (e) => {
        e.preventDefault()

        CForm.handleFreeze(step5Form)
        await delay(MAX_FORM_FREEZING_TIME)
        
        location.reload()
    }
}

const getCreateOrderDialog = () => `
    <nav id="create-order_dialog" class="n-dialog n-d-multistep">
        <form id="create-order-step-1_form">
            <header>
                <button type="button" class="btn btn-xs-inline btn-xs-block" data-close-dialog_btn="create-order_dialog">
                    <picture>
                        <img src="/img/icon/close.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Quieres registrar un pedido?</h3>
                    <p>Indícanos los datos de tu artículo.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <label for="${EOrderFields.ProductUrl}">Link del producto</label>
                    <input type="text" placeholder="Ingresa el link del producto" id="${EOrderFields.ProductUrl}" required>
                </fieldset>
                <fieldset>
                    <label for="${EOrderFields.ProductName}">Nombre del producto</label>
                    <input type="text" placeholder="Ingresa el nombre del producto" id="${EOrderFields.ProductName}" required>
                </fieldset>
                <fieldset>
                    <label for="${EOrderFields.ProductCategory}">Categoría</label>
                    <input list="${EOrderFields.ProductCategory}" placeholder="Selecciona una categoría" required>
                    <datalist id="${EOrderFields.ProductCategory}">
                        ${
                            Object.values(EProductCategory)
                                .map((value) => `<option value="${value}"></option>`)
                                .join('')
                        }
                    </datalist>
                </fieldset>
                <fieldset>
                    <legend>¿Necesitas la caja del producto?</legend>
                    <input type="radio" name="${EOrderFields.ProductIsBoxIncluded}" value="yes" id="${EOrderFields.ProductIsBoxIncluded}_yes" required>
                    <label for="${EOrderFields.ProductIsBoxIncluded}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductIsBoxIncluded}" value="no" id="${EOrderFields.ProductIsBoxIncluded}_no" checked required>
                    <label for="${EOrderFields.ProductIsBoxIncluded}_no" class="btn">No</label>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="${EOrderFields.ProductPrice}">
                        Valor unitario
                        <br>
                        <small>(en ${ECoin.USD.code})</small>
                    </label>
                    <input type="number" placeholder="0.00" step="0.01" id="${EOrderFields.ProductPrice}" required>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="product-qty">
                        Cantidad
                        <br>
                        <small>(mínimo ${EOrderProductQty.Min} unidad)</small>
                    </label>
                    <input type="number" placeholder="0" id="product-qty" min=${EOrderProductQty.Min} required>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-order-step-2_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-order-step-2_form" data-previous-step_btn="create-order-step-1_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>Ahora que ya sabemos que deseas traer</h3>
                    <p>Indícanos las características de tu artículo.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <legend>¿Tu artículo pesa más de 5 kilos?</legend>
                    <input type="radio" name="${EOrderFields.ProductWeightMore5kg}" value="yes" id="${EOrderFields.ProductWeightMore5kg}_yes" required>
                    <label for="${EOrderFields.ProductWeightMore5kg}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductWeightMore5kg}" value="no" id="${EOrderFields.ProductWeightMore5kg}_no" checked required>
                    <label for="${EOrderFields.ProductWeightMore5kg}_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>
                        ¿Tu artículo mide más de 50 cm?
                        <br>
                        <small>(de alguno de sus lados)</small>
                    </legend>
                    <input type="radio" name="${EOrderFields.ProductIsTaller50cm}" value="yes" id="${EOrderFields.ProductIsTaller50cm}_yes" required>
                    <label for="${EOrderFields.ProductIsTaller50cm}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductIsTaller50cm}" value="no" id="${EOrderFields.ProductIsTaller50cm}_no" checked required>
                    <label for="${EOrderFields.ProductIsTaller50cm}_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>
                        ¿Alguno de los links contiene más de una unidad? <br>
                        <small>Por ejemplo packs, cajas o bolsas con varias unidades adentro.</small>
                    </legend>
                    <input type="radio" name="${EOrderFields.ProductIsOneUnitPerProduct}" value="yes" id="${EOrderFields.ProductIsOneUnitPerProduct}_yes" required>
                    <label for="${EOrderFields.ProductIsOneUnitPerProduct}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductIsOneUnitPerProduct}" value="no" id="${EOrderFields.ProductIsOneUnitPerProduct}_no" checked required>
                    <label for="${EOrderFields.ProductIsOneUnitPerProduct}_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>¿Quién enviará tus compras al alojamiento del viajero?</legend>
                    <input type="radio" name="${EOrderFields.Shipper}" value="${EOrderShippers.Relative}" id="${EOrderFields.Shipper}_relative" required>
                    <label for="${EOrderFields.Shipper}_relative" class="btn">${capitalizeString(EOrderShippers.Relative)}</label>

                    <input type="radio" name="${EOrderFields.Shipper}" value="${EOrderShippers.Store}" id="${EOrderFields.Shipper}_store" checked required>
                    <label for="${EOrderFields.Shipper}_store" class="btn">${capitalizeString(EOrderShippers.Store)}</label>
                </fieldset>
                <fieldset>
                    <label for="${EOrderFields.Comments}">Si deseas, puedes dejarle un comentario al viajero</label>
                    <textarea id="${EOrderFields.Comments}" placeholder="Ingresa un comentario para el viajero"></textarea>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-order-step-3_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-order-step-3_form" data-previous-step_btn="create-order-step-2_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Cómo prefieres la entrega?</h3>
                    <p>Una vez el artículo llegue a tu país destino.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <input type="radio" name="${EOrderFields.ShippingDestination}" value="${EShippingDestination.Inplace_Miraflores}" id="${EOrderFields.ShippingDestination}_inplace-miraflores" checked required>
                    <label for="${EOrderFields.ShippingDestination}_inplace-miraflores" class="btn btn-f-width">${capitalizeString(EShippingDestination.Inplace_Miraflores)}</label>

                    <input type="radio" name="${EOrderFields.ShippingDestination}" value="${EShippingDestination.Town}" id="${EOrderFields.ShippingDestination}_town" required>
                    <label for="${EOrderFields.ShippingDestination}_town" class="btn btn-f-width">Envio ${EShippingDestination.Town}</label>

                    <input type="radio" name="${EOrderFields.ShippingDestination}" value="${EShippingDestination.Province}" id="${EOrderFields.ShippingDestination}_province" required>
                    <label for="${EOrderFields.ShippingDestination}_province" class="btn btn-f-width">Envio ${EShippingDestination.Province}</label>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-order-step-4_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-order-step-4_form" data-previous-step_btn="create-order-step-3_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Quién deseas que compre tu artículo?</h3>
                    <p>Escoge a una de las opciones.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <input type="radio" name="${EOrderFields.Shopper}" value="${EOrderShoppers.Myself}" id="${EOrderFields.Shopper}_myself">
                    <label for="${EOrderFields.Shopper}_myself" class="btn btn-f-width">${capitalizeString(EOrderShoppers.Myself)}</label>

                    <input type="radio" name="${EOrderFields.Shopper}" value="${EOrderShoppers.Business}" id="${EOrderFields.Shopper}_business" checked>
                    <label for="${EOrderFields.Shopper}_business" class="btn btn-f-width">${capitalizeString(EOrderShoppers.Business)}</label>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <!-- TODO: Shopper authentication/register forms -->

        <form id="create-order-confirmation-step-5_form">
            <main>
                <div class="card-3">
                    <picture>
                        <img src="/img/illustrations/buyer-confirmation.svg" width="158">
                    </picture>
                    <div class="h-heading">
                        <h3>Pedido<br>registrado con éxito.</h3>
                    </div>
                </div>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Listo</button>
            </footer>
        </form>
    </nav>
`

const getQuoteOrderDialog = async (wf, user: IUser, computedOrders: IOrder[]) => {
    if (user.type !== EUserType.Traveler) return ''
    const quotableOrders = computedOrders.filter((computedOrder) => computedOrder.computed.isQuotableByTraveler)
    if (!quotableOrders.length) return ''
    const flights = await MFlight.getAllByTravelerId(wf, wf.mode.Offline, EFormat.Raw, user.id) as IFlight[]
    return `
        <nav id="quote-order_dialog" class="n-dialog n-d-multistep">
            <form id="quote-order-step-1_form">
                <header>
                    <button type="button" class="btn btn-xs-inline btn-xs-block" data-close-dialog_btn="quote-order_dialog">
                        <picture>
                            <img src="/img/icon/close.svg" width="20" height="20">
                        </picture>
                    </button>
                    <div class="h-heading">
                        <h3>¿Quieres cotizar un pedido?</h3>
                        <p>Indícanos en cual de tus vuelos podrías traer el pedido.</p>
                    </div>
                </header>
                <main>
                    <fieldset>
                        <label for="quote-order">Pedido a cotizar</label>
                        <input list="quote-order" placeholder="Selecciona un pedido" required>
                        <datalist id="quote-order">
                            ${
                                quotableOrders
                                    .map((quotableOrder) => `<option value="${quotableOrder.product.name}" data-order_id="${quotableOrder.id}" data-shopper_id="${quotableOrder.shopperId}">${quotableOrder.product.coin} ${quotableOrder.product.price}</option>`)
                                    .join('')
                            }
                        </datalist>
                    </fieldset>
                    <fieldset>
                        <label for="quote-flight">Vuelo a usar</label>
                        <input list="quote-flight" placeholder="Selecciona un vuelo" required>
                        <datalist id="quote-flight">
                            ${
                                flights
                                    .map((flight) => `<option value="${flight.from} a ${flight.to}" data-flight_id="${flight.id}" data-traveler_id="${user.id}">${flight.airline} - ${flight.code}</option>`)
                                    .join('')
                            }
                        </datalist>
                    </fieldset>
                    <fieldset>
                        <label for="quote-price">
                            Precio<small>(en ${ECoin.USD.code})</small>
                        </label>
                        <input type="number" placeholder="0.00" step="0.01" id="quote-price" required>
                    </fieldset>
                </main>
                <footer>
                    <button class="btn btn-primary btn-submit" type="submit">Cotizar</button>
                </footer>
            </form>
            <form id="quote-order-confirmation-step-2_form">
                <main>
                    <div class="card-3">
                        <picture>
                            <img src="/img/illustrations/buyer-confirmation.svg" width="158">
                        </picture>
                        <div class="h-heading">
                            <h3>Cotización<br>registrada con éxito.</h3>
                        </div>
                    </div>
                </main>
                <footer>
                    <button class="btn btn-primary btn-submit" type="submit">Listo</button>
                </footer>
            </form>
        </nav>
    `
}

const getPickAndPayQuotationDialog = () => {
    return `
        <nav id="pick-and-pay-quotation_dialog" class="n-dialog n-d-multistep">
            <form id="pick-and-pay-quotation-step-1_form">
                <header>
                    <button type="button" class="btn btn-xs-inline btn-xs-block" data-close-dialog_btn="pick-and-pay-quotation_dialog">
                        <picture>
                            <img src="/img/icon/close.svg" width="20" height="20">
                        </picture>
                    </button>
                    <div class="h-heading">
                        <h3>Es momento de pagar el envío</h3>
                        <p>Ingresa los datos de tu tarjeta.</p>
                    </div>
                </header>
                <main>
                    <div class="card-18">
                        <p>
                            <span>Costo de envío</span>
                            <span id="price"></span>
                        </p>
                        <p>
                            <span>Servicio de compra</span>
                            <span id="commission"></span>
                        </p>
                        <p>
                            <span>Impuestos</span>
                            <span id="tax"></span>
                        </p>
                        <hr>
                        <p>
                            <strong>TOTAL</strong>
                            <strong id="total"></strong>
                        </p>
                    </div>
                    <div class="card-5">
                        <picture>
                            <img src="/img/icon/lock-secondary.svg" widtht="20" height="20">
                        </picture>
                        <p>El pago es seguro. La información de tu tarjeta no se comparte con los viajeros.</p>
                    </div>
                    <fieldset>
                        <label for="cc-number">Número de tarjeta</label>
                        <input type="text" id="cc-number" placeholder="P. ej. 1234 5678 8765 4321" autocomplete="cc-number" required>
                    </fieldset>
                    <fieldset class="fs-sm">
                        <label for="cc-exp">Fecha de vencimiento</label>
                        <input type="text" id="cc-exp" placeholder="P. ej. 02 / 21" autocomplete="cc-exp" required>
                    </fieldset>
                    <fieldset class="fs-sm">
                        <label for="cc-csc">Código de seguridad <small>(CVV)</small></label>
                        <input type="text" id="cc-csc" placeholder="P. ej. 1234" autocomplete="cc-csc" required>
                    </fieldset>
                    <fieldset>
                        <label for="cc-name">Nombre que aparece en la tarjeta</label>
                        <input type="text" id="cc-name" placeholder="P. ej. Carlos Pérez" autocomplete="cc-name" required>
                    </fieldset>
                </main>
                <footer>
                    <button class="btn btn-primary btn-submit" type="submit">
                        Pagar <span id="submit-total"></span>
                    </button>
                </footer>
            </form>

            <form id="pick-and-pay-quotation-confirmation-step-2_form">
                <main>
                    <div class="card-3">
                        <picture>
                            <img src="/img/illustrations/buyer-confirmation.svg" width="158">
                        </picture>
                        <div class="h-heading">
                            <h3>Pago de envío<br>realizado con éxito.</h3>
                        </div>
                    </div>
                </main>
                <footer>
                    <button class="btn btn-primary btn-submit" type="submit">Listo</button>
                </footer>
            </form>
            
        </nav>
    `
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

    const allShoppers = await Promise.all(
        orders.map((order) => MUser.get(wf, mode.Network, order.shopperId, EFormat.Raw))
    ) as IUser[]
    
    const travelerIds = flights.map((flight) => flight.travelerId)
    const allTravelers = await Promise.all(
        travelerIds.map((travelerId) => MUser.get(wf, mode.Network, travelerId, EFormat.Raw))
    )

    const otherUsers = [...allShoppers, ...allTravelers]

    logger(`All shoppers/travelers to cache offline for admin-orders: `, otherUsers)
    
    await Promise.all(
        otherUsers
            .map((otherUser) => MUser.add(wf, mode.Offline, otherUser))
    )

    logger('All shoppers/travelers cached offline succesfully')

    await updateOfflineTimestamp('users', new Date())

    return { done }
}

const getHeaderAction = (user: IUser) => {
    return user.type === EUserType.Shopper ? `
        <div class="n-t-actions-2">
            <button class="btn btn-secondary btn-sm" data-create-order-dialog_btn>
                <picture>
                    <img src="/img/icon/plus-light.svg" width="14" height="14">
                </picture>
                <span>Registrar pedido</span>
            </button>
        </div>
    ` : ''
}

const builder = async (wf) => {
    const emptyContent = {
        head: {
            title: '',
            meta: ''
        },
        body: `${getCreateOrderDialog()}`
    }

    if (isNode())
        return emptyContent

    const user = await ModAuth.getUserAuthenticated(wf) as IUser
    if (!user) {
        logger('Builder for admin-orders needs user authentication')
        return emptyContent
    }
    
    // const orders = await MOrder.getAll(wf, wf.mode.Offline, EFormat.Pretty) as IOrder[]
    const orders = await MOrder.getAllByUserAuthenticated(wf, wf.mode.Offline, EFormat.Pretty, user)

    const computedOrders = await Promise.all(
        orders.map((order) => MOrder.compute(wf, wf.mode.Offline, user, order))
    )

    const rows = computedOrders.map((computedOrder) => MOrder.toRow(user, computedOrder))

    // const allStatus = Object.values(MOrder.EOrderStatus).map((status) => capitalizeString(status))
    // const filters = [...allStatus]
    // const allSorters = Object.values(MOrder.EOrderSorters)
    // const sorters = [...allSorters]
    const filters = []
    const sorters = []

    const body = `
        ${adminHeader(
        user, getHeaderAction(user), 'orders', 'pedidos')
        }
        <main>
            ${CTable.render('Pedidos', rows, filters, sorters)}
        </main>
        ${getCreateOrderDialog()}
        ${await getQuoteOrderDialog(wf, user, computedOrders)}
        ${getPickAndPayQuotationDialog()}
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

    configCreateOrderDialog(wf, 'create-order_dialog')
    configQuoteOrderDialog(wf, 'quote-order_dialog')
    configPickAndPayQuotationDialog(wf, 'pick-and-pay-quotation_dialog')

    // configSelectQuotationInQuotedOrder(wf)


}

export default {
    loader,
    builder,
    action
}