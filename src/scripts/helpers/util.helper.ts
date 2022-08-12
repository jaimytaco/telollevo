export const delay = (ms) => new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
})

export const formatLocaleDate = (date) => date.toLocaleDateString ? date.toLocaleDateString('es-PE') : date

export const capitalizeString = (str) => {
    if (!str) return ''
    const [first, ...rest] = str
    return first || rest ? `${first.toUpperCase()}${rest.join('')}` : ''
}

export const getBodyPage = () => document.body.getAttribute('data-page')

export const getDOMElement = (parent, query, mode: 'all' | undefined) => { 
    const el = parent[`querySelector${mode ? 'All' : ''}`](query)
    if (!el) throw `'${query}' query not found in '${parent.id || parent.className}' parent element` 
    return mode ? [...el] : el
}

export const configCreateOrderDialog = async (wf, dialogId) => {
    const dialog = getDOMElement(document, `#${dialogId}`)
    const step1Form = getDOMElement(dialog, '#create-order-step-1_form')
    const step2Form = getDOMElement(dialog, '#create-order-step-2_form')
    const step3Form = getDOMElement(dialog, '#create-order-step-3_form')
    const step4Form = getDOMElement(dialog, '#create-order-step-4_form')
    const step5Form = getDOMElement(dialog, '#create-order-confirmation-step-5_form')
    
    const createOrderBtns = getDOMElement(document, '[data-create-order-dialog_btn]', 'all')
    const { default: CDialog } = await import('@components/dialog.component')

    createOrderBtns?.forEach((createOrderBtn) => createOrderBtn.onclick = () => {
        CDialog.handle('create-order_dialog', 'add')
        step1Form.classList.add('active')
    })

    const { ECoin, EShippingDestination } = await import('@types/util.type')
    const { EOrderStatus, EOrderShoppers } = await import('@types/order.type')

    // TODO: use order local object
    const order = {}

    step1Form.onsubmit = (e) => {
        e.preventDefault()

        const name = (getDOMElement(step1Form, '#product-name')).value
        const category = (getDOMElement(step1Form, '[list="product-category"]')).value
        const url = (getDOMElement(step1Form, '#product-link')).value
        const price = parseFloat((getDOMElement(step1Form, '#product-pu')).value)
        const units = parseInt((getDOMElement(step1Form, '#product-qty')).value)
        const isBoxIncluded = (getDOMElement(step1Form, '[name="product-need-box"]:checked')).value === 'yes'
        const coin = ECoin.PEN.code
        const status = EOrderStatus.Registered

        // TODO: validate product info in step-1
        
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

export const configCreateFlightDialog = async (wf, dialogId) => {
    const dialog = getDOMElement(document, `#${dialogId}`)
    const step1Form = getDOMElement(dialog, '#create-flight-step-1_form')
    const step2Form = getDOMElement(dialog, '#create-flight-step-2_form')
    const step3Form = getDOMElement(dialog, '#create-flight-step-3_form')
    const step4Form = getDOMElement(dialog, '#create-flight-step-4_form')
    const step5Form = getDOMElement(dialog, '#create-flight-step-5_form')
    const step6Form = getDOMElement(dialog, '#create-flight-confirmation-step-6_form')
    
    const createFlightBtns = getDOMElement(document, '[data-create-flight-dialog_btn]', 'all')
    const { default: CDialog } = await import('@components/dialog.component')

    createFlightBtns?.forEach((createFlightBtn) => createFlightBtn.onclick = () => {
        CDialog.handle('create-flight_dialog', 'add')
        step1Form.classList.add('active')
    })

    const { ECountry, EShippingDestination } = await import('@types/util.type')
    const { EFlightStatus, EHousingType } = await import('@types/flight.type')

    // TODO: use flight local object
    const flight = {}

    step1Form.onsubmit = (e) => {
        e.preventDefault()

        const status = EFlightStatus.Registered
        const receiveOrdersSince = (getDOMElement(step1Form, '#receive-orders-since')).value
        const receiveOrdersUntil = (getDOMElement(step1Form, '#receive-orders-until')).value

        // TODO: validate flight info step-1

        flight.status = status
        flight.receiveOrdersSince = new Date(`${receiveOrdersSince} 00:00:00`)
        flight.receiveOrdersUntil = new Date(`${receiveOrdersUntil} 00:00:00`)

        console.log('--- step 1 - flight =', flight)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }

    step2Form.onsubmit = (e) => {
        e.preventDefault()

        const type = (getDOMElement(step2Form, '[name="housing-type"]:checked'))?.value
        const address = (getDOMElement(step2Form, '#address')).value
        const addressMore = (getDOMElement(step2Form, '#address-more')).value
        const district = (getDOMElement(step2Form, '#district')).value
        const country = (getDOMElement(step2Form, '[list="country"]')).value
        const state = (getDOMElement(step2Form, '[list="state"]')).value
        const city = (getDOMElement(step2Form, '[list="city"]')).value
        const zipcode = (getDOMElement(step2Form, '#zipcode')).value
        const isResponsibleFor = (getDOMElement(step2Form, '#is-responsible-for')).checked
        const areReceiveOrderDatesOk = (getDOMElement(step2Form, '#are-receive-order-dates-ok')).checked

        // TODO: validate flight info step-2

        const place = {
            district,
            country: ECountry[country],
            state,
            city,
            zipcode
        }

        const housing = {
            type: EHousingType[type],
            address,
            addressMore,
            place
        }

        flight.housing = housing
        flight.isResponsibleFor = isResponsibleFor
        flight.areReceiveOrderDatesOk = areReceiveOrderDatesOk
        
        // TODO: validate flight info step-2

        console.log('--- step 2 - flight =', flight)

        step2Form.classList.remove('active')
        step3Form.classList.add('active')
    }

    step3Form.onsubmit = (e) => {
        e.preventDefault()

        const name = (getDOMElement(step3Form, '#receiver-name')).value
        const phone = (getDOMElement(step3Form, '#receiver-phone')).value

        const receiver = { name, phone }

        flight.receiver = receiver

        // TODO: validate flight info step-3

        console.log('--- step 3 - flight =', flight)

        step3Form.classList.remove('active')
        step4Form.classList.add('active')
    }

    step4Form.onsubmit = (e) => {
        e.preventDefault()

        const shippingDestination = (getDOMElement(step4Form, '[list="shipping-destination"]')).value
        const deliverOrderAt = (getDOMElement(step4Form, '#deliver-order-at')).value

        flight.shippingDestination = shippingDestination
        flight.deliverOrderAt = new Date(`${deliverOrderAt} 00:00:00`)

        // TODO: validate flight info step-4

        console.log('--- step 4 - flight =', flight)

        step4Form.classList.remove('active')
        step5Form.classList.add('active')
    }

    step5Form.onsubmit = async (e) => {
        e.preventDefault()

        const code = (getDOMElement(step5Form, '#code')).value
        const airline = (getDOMElement(step5Form, '#airline')).value
        const from = (getDOMElement(step5Form, '[list="from"]')).value
        const to = (getDOMElement(step5Form, '[list="to"]')).value

        flight.code = code
        flight.airline = airline
        flight.from = from
        flight.to = to

        // TODO: validate flight info step-5

        const x = await wf.database.add(wf.mode.Network, 'flights', flight)
        console.log('--- x =', x)

        console.log('--- step 5 - flight =', flight)

        step5Form.classList.remove('active')
        step6Form.classList.add('active')
    }

    step6Form.onsubmit = async (e) => {
        e.preventDefault()
        step6Form.classList.remove('active')
        CDialog.handle('create-flight_dialog', 'remove')

        // TODO: reload
        await delay(1500)
        location.reload()
    }
}

export const configApproveFlight = async (wf) => {
    const visibleFlightBtns = getDOMElement(document, '[data-visible-flight_btn]', 'all')
    visibleFlightBtns?.forEach((visibleFlightBtn) => visibleFlightBtn.onclick = async () => {
        // TODO: visible flight logic
        const { EFlightStatus } = await import('@types/flight.type')
        const id = visibleFlightBtn.getAttribute('data-visible-flight_btn')
        const { data: flight, err } = await wf.database.get(wf.mode.Network, 'flights', id)
        if (err) return

        // TODO: check if flight has quotations
        flight.status = flight.status === EFlightStatus.Registered ? EFlightStatus.Visible : EFlightStatus.Registered
        await wf.database.update(wf.mode.Network, 'flights', flight)

        // TODO: reload
        location.reload() 
    })
}

export const configSelectQuotationInQuotedOrder = async (wf) => {
    const selectQuotationBtns = getDOMElement(document, '[data-select-quotation_btn]', 'all')
    selectQuotationBtns?.forEach((selectQuotationBtn) => selectQuotationBtn.onclick = async () => {
        console.log('--- selectQuotationBtn =', selectQuotationBtn)
    })
}

export const configLogin = async (wf) => {
    const loginForm = getDOMElement(document, '#login-form')
    loginForm.onsubmit = async (e) => {
        e.preventDefault()
        const email = (getDOMElement(loginForm, '#login-email')).value
        const password = (getDOMElement(loginForm, '#login-password')).value
        
        const userCredential = await wf.auth.signInWithEmailAndPassword(email, password)
        
        // TODO: UI animations according to userCredential
    }  
}