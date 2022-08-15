import { logger } from '@wf/helpers/browser.helper'

export const isValidString = (s) => s && typeof s === 'string' && s.length > 0

export const isBoolean = (boolean) => typeof boolean === 'boolean'

// Taken from https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
export const isNumeric = (num) => (typeof(num) === 'number' || typeof(num) === 'string' && num.trim() !== '') && !isNaN(num as number)

// Taken from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
export const isValidHttpUrl = (string) => {
    let url

    try {
        url = new URL(string)
    } catch (_) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
}

export const formatLocaleDate = (date) => date.toLocaleDateString ? date.toLocaleDateString('es-PE') : date

export const capitalizeString = (str) => {
    if (!str) return ''
    const [first, ...rest] = str
    return first || rest ? `${first.toUpperCase()}${rest.join('')}` : ''
}

export const getBodyPage = () => document.body.getAttribute('data-page')

export const getDOMElement = (parent, query, mode: 'all' | undefined) => { 
    const el = parent[`querySelector${mode ? 'All' : ''}`](query)
    // if (!el) throw `'${query}' query not found in '${parent.id || parent.className}' parent element` 
    if (!el){
        logger(`'${query}' query not found in '${parent.id || parent.className}' parent element`)
        return
    }
    
    return mode ? [...el] : el
}

export const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))



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