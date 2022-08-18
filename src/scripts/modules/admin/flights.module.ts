import { EFormat } from '@types/util.type'

import { IFlight } from '@types/flight.type'
import MFlight from '@models/flight.model'

import { IUser } from '@types/user.type'
import MUser from '@models/user.model'

import { IQuotation } from '@types/quotation.type'
import MQuotation from '@models/quotation.model'

import { IOrder } from '@types/order.type'
import MOrder from '@models/order.model'

import { createFlight_dialog } from '@data/admin/dialog.data'
import CTable from '@components/table.component'
import { adminHeader } from '@helpers/ui.helper'

import {
    getOfflineTimestamp,
    updateOfflineTimestamp
} from '@wf/lib.worker'

import { 
    logger,
    isNode
} from '@wf/helpers/browser.helper'


const configCreateFlightDialog = async (wf, dialogId) => {
    const { getDOMElement, delay } = await import('@helpers/util.helper')
    const { default: CForm } = await import('@components/form.component')
    const { EFlightFields, EPlaceFields, EHousingFields, EReceiverFields } = await import('@types/flight.type')
    
    const dialog = getDOMElement(document, `#${dialogId}`)
    if (!dialog) return

    // STEP-1
    const step1Form = getDOMElement(dialog, '#create-flight-step-1_form')
    if (!step1Form) return
    const btnSubmitStep1 = getDOMElement(step1Form, 'button[type="submit"]')
    if (!btnSubmitStep1) return
    CForm.init(step1Form.id)

    const createFlightBtns = getDOMElement(document, '[data-create-flight-dialog_btn]', 'all')
    const { default: CDialog } = await import('@components/dialog.component')

    createFlightBtns?.forEach((createFlightBtn) => createFlightBtn.onclick = () => {
        CDialog.handle('create-flight_dialog', 'add')
        step1Form.classList.add('active')
    })

    // TODO: use flight local object
    const flight = {}

    btnSubmitStep1.onclick = (e) => {
        e.preventDefault()
        CForm.validateBeforeSubmit(step1Form)
    }

    step1Form.onsubmit = (e) => {
        e.preventDefault()

        const status = EFlightStatus.Registered

        const receiveOrdersSinceInput = getDOMElement(step1Form, `#${EFlightFields.ReceiveOrdersSince}`)
        if (!receiveOrdersSinceInput) return
        const receiveOrdersSince = receiveOrdersSinceInput.value
        
        const receiveOrdersUntilInput = getDOMElement(step1Form, `#${EFlightFields.ReceiveOrdersUntil}`)
        if (!receiveOrdersUntilInput) return
        const receiveOrdersUntil = receiveOrdersUntilInput.value

        flight.status = status
        flight.receiveOrdersSince = new Date(`${receiveOrdersSince} 00:00:00`)
        flight.receiveOrdersUntil = new Date(`${receiveOrdersUntil} 00:00:00`)

        // const sanitizeStatus = MFlight.sanitize(flight)
        // if (sanitizeStatus?.err){
        //     const { field, desc } = sanitizeStatus.err
        //     if (!field){
        //         logger(`Sanitize error: ${desc} for flight`, flight)
        //         return
        //     }

        //     const invalidFieldset = getDOMElement(step1Form,`#${field}`)?.parentNode 
        //     if (invalidFieldset){
        //         CForm.handleInvalid('add', desc, invalidFieldset)
        //         invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        //         logger(`Sanitize error: ${desc}${field ? ` in field ${field} ` : ''}for flight`, flight)
        //         return
        //     }
        // }
        const validateStatus = CForm.validateOnSubmit(step1Form, MFlight.sanitize, flight)
        if (validateStatus?.err) return
        

        logger('create-flight-dialog step-1 with flight:', flight)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }


    // STEP-2
    const step2Form = getDOMElement(dialog, '#create-flight-step-2_form')
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

        const typeInput = getDOMElement(step2Form, `[name="${EHousingFields.Type}"]`)
        if (!typeInput) return
        const type = typeInput.checked

        const addressInput = getDOMElement(step2Form, `#${EHousingFields.Address}`)
        if (!addressInput) return
        const address = addressInput.value

        const addressMoreInput = getDOMElement(step2Form, `#${EHousingFields.AddressMore}`)
        if (!addressMoreInput) return 
        const addressMore = addressMoreInput.value

        const districtInput = getDOMElement(step2Form, `#${EPlaceFields.District}`)
        if (!districtInput) return
        const district = districtInput.value

        const countryInput = getDOMElement(step2Form, `[list="${EPlaceFields.Country}"]`)
        if (!countryInput) return
        const country = countryInput.value

        const stateInput = getDOMElement(step2Form, `#${EPlaceFields.State}`)
        if (!stateInput) return
        const state = stateInput.value

        const cityInput = getDOMElement(step2Form, `#${EPlaceFields.City}`)
        if (!cityInput) return
        const city = cityInput.value

        const zipcodeInput = getDOMElement(step2Form, `#${EPlaceFields.Zipcode}`)
        if (!zipcodeInput) return
        const zipcode = zipcodeInput.value

        const isResponsibleForInput = getDOMElement(step2Form, `#${EFlightFields.IsResponsibleFor}`)
        if (!isResponsibleForInput) return
        const isResponsibleFor = isResponsibleForInput.checked

        const areReceiveOrderDatesOkInput = getDOMElement(step2Form, `#${EFlightFields.AreReceiveOrderDatesOk}`)
        if (!areReceiveOrderDatesOkInput) return
        const areReceiveOrderDatesOk = areReceiveOrderDatesOkInput.checked

        const place = {
            district,
            country,
            state,
            city,
            zipcode
        }

        const housing = {
            type,
            address,
            addressMore,
            place
        }

        flight.housing = housing
        flight.isResponsibleFor = isResponsibleFor
        flight.areReceiveOrderDatesOk = areReceiveOrderDatesOk
        
        const validateStatus = CForm.validateOnSubmit(step2Form, MFlight.sanitize, flight)
        if (validateStatus?.err) return

        logger('create-flight-dialog step-2 with flight:', flight)

        step2Form.classList.remove('active')
        step3Form.classList.add('active')
    }


    // STEP-3
    const step3Form = getDOMElement(dialog, '#create-flight-step-3_form')
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

        const nameInput = getDOMElement(step3Form, `#${EReceiverFields.Name}`)
        if (!nameInput) return
        const name = nameInput.value

        const phoneInput = getDOMElement(step3Form, `#${EReceiverFields.Phone}`)
        if (!phoneInput) return
        const phone = phoneInput.value

        const receiver = { name, phone }

        flight.receiver = receiver

        const validateStatus = CForm.validateOnSubmit(step3Form, MFlight.sanitize, flight)
        if (validateStatus?.err) return

        logger('create-flight-dialog step-3 with flight:', flight)

        step3Form.classList.remove('active')
        step4Form.classList.add('active')
    }




    


    const step4Form = getDOMElement(dialog, '#create-flight-step-4_form')
    const step5Form = getDOMElement(dialog, '#create-flight-step-5_form')
    const step6Form = getDOMElement(dialog, '#create-flight-confirmation-step-6_form')
    
    

    const { ECountry, EShippingDestination } = await import('@types/util.type')
    const { EFlightStatus, EHousingType } = await import('@types/flight.type')

    



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

const loader = async (wf) => {
    const { mode, auth } = wf
    const lastUpdate = await getOfflineTimestamp('flights')
    const { uid: userId } = await auth.getCurrentUser()
    const done = 1

    const user = await MUser.get(wf, mode.Offline, userId, EFormat.Raw) as IUser

    const flights = await MFlight.getAllByUserAuthenticated(wf, mode.Network, EFormat.Raw, user, lastUpdate) as IFlight[]
    
    if (flights?.err) {
        const { err } = flights
        logger(err)
        return { err }
    }

    if (!flights.length) {
        logger('There is no flights to cache offline for admin-flights')
        return { done }
    }

    logger(`Flights to cache offline for admin-flights: `, flights)

    await Promise.all(
        flights.map((flight) => MFlight.add(wf, mode.Offline, flight))
    )

    logger('All flights cached offline succesfully')

    await updateOfflineTimestamp('flights', new Date())

    const quotationsByFlight = await Promise.all(
        flights.map((flight) => MQuotation.getAllByFlightId(wf, mode.Network, EFormat.Raw, flight.id))
    )

    for (const quotations of quotationsByFlight) {
        if (quotations?.err) {
            const { err } = quotations
            logger(err)
            return { err }
        }
    }

    const allQuotations = quotationsByFlight.flat(1) as IQuotation[]

    logger(`All quotations to cache offline for admin-flights: `, allQuotations)

    await Promise.all(
        allQuotations
            .map((quotation) => MQuotation.add(wf, mode.Offline, quotation))
    )

    logger('All quotations cached offline succesfully')

    await updateOfflineTimestamp('quotations', new Date())

    const orderIds = [...new Set(allQuotations.map((quotation) => quotation.orderId))]
    const orders = await MOrder.getAllByIds(wf, mode.Network, orderIds, EFormat.Raw) as IOrder[]
    
    logger(`All orders to cache offline for admin-flights: `, orders)

    await Promise.all(
        orders.map((order) => MOrder.add(wf, mode.Offline, order))
    )

    logger('All orders cached offline succesfully')

    await updateOfflineTimestamp('orders', new Date())

    return { done }
}

const builder = async (wf) => {
    const emptyContent = {
        head: {
            title: '',
            meta: ''
        },
        body: `${createFlight_dialog}`
    }

    if (isNode())
        return emptyContent

    const userCredential = await wf.auth.getCurrentUser()
    if (!userCredential) {
        logger('Builder for admin-flights needs user authentication')
        return emptyContent
    }

    const user = await MUser.get(wf, wf.mode.Offline, userCredential.uid, EFormat.Raw) as IUser

    const flights = await MFlight.getAll(wf, wf.mode.Offline, EFormat.Pretty)
    if (flights?.err) {
        logger(flights.err)
        return { err: flights.err }
    }

    const rows = flights.map(MFlight.toRow)

    // TODO
    const filters = []
    const sorters = []

    const body = `
        ${adminHeader(
            user,
            `
                <div class="n-t-actions-2">
                    <button class="btn btn-secondary btn-sm" data-create-flight-dialog_btn>
                        <picture>
                            <img src="/img/icon/plus-light.svg" width="14" height="14">
                        </picture>
                        <span>Registrar vuelo</span>
                    </button>
                </div>
            `, 'flights', 'vuelos')
        }
        <main>
            ${CTable.render('Vuelos', rows, filters, sorters)}
        </main>
        ${createFlight_dialog}
    `

    return {
        head: { 
            title: `${wf.app.name} | Vuelos`, 
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


    // TODO: make component of table-extra-row
    const extraRows = getDOMElement(document, '.t-r-extra', 'all')
    const extraRowIds = extraRows.map((extraRow) => extraRow.id)
    extraRowIds.forEach((extraRowId) => CTable.handleRowExtra(extraRowId))

    CCard8.handleAll()

    CDialog.init('create-flight_dialog')
    // configApproveFlight(wf)
    configCreateFlightDialog(wf, 'create-flight_dialog')
}

export default{
    builder,
    loader,
    action,
}