import { 
    IFlight, 
    EFlightStatus,
    EHousingType,

    EFlightFields,
    ESanitizeFlightErrors,

    EPlaceFields,
    ESanitizePlaceErrors,

    EHousingFields,
    ESanitizeHousingErrors,

    EReceiverFields,
    ESanitizeReceiverErrors,

    MAX_DELIVERY_HOURS_AFTER_FLIGHT,
} from '@types/flight.type'

import { 
    IUser,
    EUserType, 
} from '@types/user.type'
import MUser from '@models/user.model'

import { 
    IQuotation,
    EQuotationStatus,
} from '@types/quotation.type'
import MQuotation from '@models/quotation.model'

import { 
    EFormat,
    ECountry, 
    EShippingDestination  
} from '@types/util.type'

import { 
    capitalizeString, 
    formatLocaleDate,
    isNumeric,
    isBoolean,
    isValidString,
    isValidDate,
    hasParameter,
} from '@helpers/util.helper'

import { logger } from '@wf/helpers/browser.helper'
import { removeOfflineTimestamp } from '@wf/lib.worker'

const getAlert = (user: IUser, flight: IFlight) => {
    // if (user.type === EUserType.Admin && flight.status === EFlightStatus.Registered)
    //     return 'Este vuelo cuenta con al menos una cotización, valídalo para que sea visible para el comprador.'
    // return ''
    return 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
}

const toRowExtra = (user: IUser, flight: IFlight) => {
    return `
        <div id="te-${flight.id}" class="t-r-extra">
            <div class="card-4">
                <div class="card-5 c-5-bordered">
                    <picture>
                        <img src="/img/icon/alert-secondary.svg" widtht="20" height="20">
                    </picture>
                    <p>${getAlert(user, flight)}</p>
                </div>
                <div class="card-6">
                    <h6>Detalles del vuelo</h6>
                    <div class="card-7-group">
                        ${
                            1 || user.type === EUserType.Admin ? 
                                `<div class="card-7">
                                    <p>Trayecto:<br>
                                        <span>El vuelo sale el ${flight.since} y llega el ${flight.until}</span>
                                    </p>
                                </div>` : ''
                        }
                        <div class="card-7">
                            <p>Recepción:<br>
                                <span>El pedido será recepcionado del ${flight.receiveOrdersSince} al ${flight.receiveOrdersUntil}.</span>
                            </p>
                        </div>
                        <div class="card-7">
                            <p>Entrega:<br>
                                <span>El pedido será entregado el ${flight.deliverOrderAt}.</span>
                            </p>
                        </div>
                    </div>  
                </div>
                <div class="card-8 card-7-group" data-heading="Más detalles">
                    <div class="card-7">
                        <picture>
                            <img src="/img/icon/package.svg" width="18" height="18">
                        </picture>
                        <p>El alojamiento es un ${flight.shippingDestination} con dirección ${flight.housing.address}, ${flight.housing.place.district}, ${flight.housing.place.city}, ${flight.housing.place.state} - ${flight.housing.place.country} ${flight.housing.place.zipcode}</p>
                    </div>
                    <div class="card-7">
                        <picture>
                            <img src="/img/icon/package.svg" width="18" height="18">
                        </picture>
                        <p>El pedido será recepcionado por ${flight.receiver.name} - ${flight.receiver.phone}</p>
                    </div>
                    <div class="card-7">
                        <picture>
                            <img src="/img/icon/package.svg" width="18" height="18">
                        </picture>
                        <p>La entrega será en ${flight.shippingDestination}</p>
                    </div>
                    <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-open" data-c-8_btn="">Ver más detalles</button>
                    <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-close" data-c-8_btn="">Ocultar más detalles</button>
                </div>
            </div>
        </div>
    `
}

const toRowActions_RegisteredFlight = (user: IUser, flight: IFlight) => {
    return `
        <div class="t-r-actions t-r-actions-desktop">
            ${
                user.type === EUserType.Admin ?
                    `
                    <button class="btn btn-primary" data-tovisible-flight_btn data-flight_id="${flight.id}">
                        <span>Aprobar vuelo</span>
                    </button>
                    ` : ''
            }
            <button class="btn btn-round btn-spin" data-show-table-extra_id="te-${flight.id}">
                <picture>
                    <img src="/img/icon/chevron-down-sm.svg" width="14" height="14">
                </picture>
            </button>
        </div>
        <div class="t-r-actions t-r-actions-mobile">
            <div class="split-btn">
                <span class="sp-popup-trigger btn" tabindex="-1">
                    <picture>
                        <img src="/img/icon/more-vertical.svg" width="14" height="14">
                    </picture>
                    <ul class="sp-popup">
                        <li>
                            <button class="btn" data-show-table-extra_id="te-${flight.id}" data-show-table-extra_id-close="Ocultar vuelo" data-show-table-extra_id-open="Ver vuelo">Ver vuelo</button>
                        </li> 
                        ${
                            user.type === EUserType.Admin ?
                                `
                                <li>
                                    <button class="btn" data-tovisible-flight_btn data-flight_id="${flight.id}">Aprobar vuelo</button>
                                </li> 
                                ` : ''
                        }
                        
                    </ul>
                </span>
            </div>
        </div>
    `
}

const toRowActions_VisibleFlight = (user: IUser, flight: IFlight) => {
    return `
        <div class="t-r-actions t-r-actions-desktop">
            ${
                user.type === EUserType.Admin ?
                `<button class="btn btn-primary" data-toregistered-flight_btn data-flight_id="${flight.id}">
                    <span>Desaprobar vuelo</span>
                </button>
                ` : ''
            }
            
            <button class="btn btn-round btn-spin" data-show-table-extra_id="te-${flight.id}">
                <picture>
                    <img src="/img/icon/chevron-down-sm.svg" width="14" height="14">
                </picture>
            </button>
        </div>
        <div class="t-r-actions t-r-actions-mobile">
            <div class="split-btn">
                <span class="sp-popup-trigger btn" tabindex="-1">
                    <picture>
                        <img src="/img/icon/more-vertical.svg" width="14" height="14">
                    </picture>
                    <ul class="sp-popup">
                        <li>
                            <button class="btn" data-show-table-extra_id="te-${flight.id}" data-show-table-extra_id-close="Ocultar vuelo" data-show-table-extra_id-open="Ver vuelo">Ver vuelo</button>
                        </li> 
                        ${
                            user.type === EUserType.Admin ?
                            ` <li>
                                <button class="btn" data-toregistered-flight_btn data-flight_id="${flight.id}">Desaprobar vuelo</button>
                            </li> ` : ''
                        }
                    
                    </ul>
                </span>
            </div>
        </div>
    `
}

const toRowActions = (user: IUser, flight: IFlight) => {
    switch(flight.status){
        case EFlightStatus.Registered:
            return toRowActions_RegisteredFlight(user, flight)
        case EFlightStatus.Visible:
            return toRowActions_VisibleFlight(user, flight)
        default:
            return ''
    }
}

const toRowTags = (flight: IFlight) => {
    return [capitalizeString(flight.status)]
}

const toRow = (user: IUser, flight: IFlight) => {
    return {
        id: flight.id,
        tags: toRowTags(flight),
        heading: `${flight.airline} - ${flight.code}`,
        details: [{
            description: `${MUser.getFullName(user)}<br>${flight.from} <span class="c-tertiary">→</span> ${flight.to}`
        }],
        icon: 'flight.svg',
        actions: toRowActions(user, flight),
        extra: toRowExtra(user, flight),
    }
}

const getAllByUserAuthenticated = (wf, mode, isFormatted: EFormat, user: IUser, date?) => {
    if (user.type === EUserType.Admin)
        return getAllWithQuotations(wf, mode, isFormatted, date)

    if (user.type === EUserType.Traveler)
        return getAllByTravelerId(wf, mode, isFormatted, user.id, date)

    if (user.type === EUserType.Shopper)
        return []
}

const getAllWithQuotations = async (wf, mode, isFormatted: EFormat, date?) => {
    const byRecent = {
        field: 'updatedAt',
        operator: wf.operator.GreaterThanOrEqualTo,
        value: date
    }
    const filters = date ? [byRecent] : []
    const quotations = await MQuotation.getAll(wf, mode, isFormatted, filters) as IQuotation[]
    const flightIds = quotations.map((quotation) => quotation.flightId)
    
    return getAllByIds(wf, mode, flightIds, isFormatted)
}

const getAllByTravelerId = (wf, mode, isFormatted: EFormat, travelerId, date?) => {
    const { operator } = wf

    const byTraveler = {
        field: 'travelerId',
        operator: operator.EqualTo,
        value: travelerId
    }

    const byRecent = {
        field: 'updatedAt',
        operator: operator.GreaterThanOrEqualTo,
        value: date
    }

    const filters = date ?
        [byTraveler, byRecent] :
        [byTraveler]

    return getAll(wf, mode, isFormatted, filters)
}

const uninstall = async (wf) => {
    const flights = await getAll(wf, wf.mode.Offline, EFormat.Raw)
    const flightIds = flights.map((flight: IFlight) => flight.id)
    await Promise.all([
        flightIds.map((id) => remove(wf, wf.mode.Offline, id)),
        removeOfflineTimestamp('flights')
    ])

    logger(`Flights uninstalled successfully`)
}

const remove = async (wf, mode, id) => {
    const { database: db } = wf
    const response = await db.remove(mode, 'flights', id)
    if (response?.err) {
        const { err } = response
        logger(err)
        return { err }
    }
}

const getAllByIds = async (wf, mode, ids: string[], isFormatted: EFormat) => {
    return Promise.all(
        ids.map((id) => get(wf, mode, id, isFormatted))
    )
}

const get = async (wf, mode, id, isFormatted: EFormat) => {
    const { database: db } = wf
    const responseFlight = await db.get(mode, 'flights', id)
    if (responseFlight?.err) {
        const { err } = responseFlight
        logger(err)
        return { err }
    }

    const flight = responseFlight.data as IFlight
    if (isFormatted === EFormat.Raw) return flight
    
    return isFormatted === EFormat.Related ?
        flight :
        prettify(flight)
}

const update = async (wf, mode, flight) => wf.database.update(mode, 'flights', flight)

const add = (wf, mode, flight: IFlight) => {
    const { database: db } = wf
    return db.add(mode, 'flights', flight)
}

const getAll = async (wf, mode, isFormatted: EFormat, filters?) => {
    const { database: db } = wf
    const responseFlight = await db.getAll(mode, 'flights', filters)
    if (responseFlight?.err) {
        const { err } = responseFlight
        logger(err)
        return { err }
    }

    const flights = responseFlight.data as IFlight[]

    if (isFormatted === EFormat.Raw) return flights

    return isFormatted === EFormat.Related ?
        flights :
        flights.map(prettify)
}

const prettify = (flight: IFlight) => {
    flight.since = formatLocaleDate(flight.since)
    flight.until = formatLocaleDate(flight.until)
    flight.receiveOrdersSince = formatLocaleDate(flight.receiveOrdersSince)
    flight.receiveOrdersUntil = formatLocaleDate(flight.receiveOrdersUntil)
    flight.deliverOrderAt = formatLocaleDate(flight.deliverOrderAt)
    return flight
}

const sanitize_travelerId = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'travelerId') && !isValidString(flight.travelerId)
    if (hasError) return { 
        err: {
            desc: ESanitizeFlightErrors.TravelerId
        } 
    }
}

const sanitize_status = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'status') && !Object.values(EFlightStatus).includes(flight.status)
    if (hasError) return {
        err: {
            desc: ESanitizeFlightErrors.Status
        }
    } 
}

const sanitize_since = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'since') && !isValidDate(flight.since)
    if (hasError) return {
        err: {
            field: EFlightFields.Since,
            desc: ESanitizeFlightErrors.Since
        }
    }
}

const sanitize_until = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'until') && !isValidDate(flight.until)
    if (hasError) return {
        err: {
            field: EFlightFields.Until,
            desc: ESanitizeFlightErrors.Until
        }
    }

    const untilLower_error = flight.since >= flight.until
    if (untilLower_error) return {
        err: {
            field: EFlightFields.Until,
            desc: `${ESanitizeFlightErrors.UntilLower}: ${formatLocaleDate(flight.since)}`
        }
    }
}

const sanitize_receiveOrdersSince = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'receiveOrdersSince') && !isValidDate(flight.receiveOrdersSince)
    if (hasError) return {
        err: {
            field: EFlightFields.ReceiveOrdersSince,
            desc: ESanitizeFlightErrors.ReceiveOrdersSince
        }
    }

    const receiveOrdersSinceLower_error = flight.since >= flight.receiveOrdersSince
    if (receiveOrdersSinceLower_error) return {
        err: {
            field: EFlightFields.ReceiveOrdersSince,
            desc: `${ESanitizeFlightErrors.ReceiveOrdersSinceLower}: ${formatLocaleDate(flight.since)}`
        }
    }

    const receiveOrdersSinceHigher_error = flight.until <= flight.receiveOrdersSince
    if (receiveOrdersSinceHigher_error) return {
        err: {
            field: EFlightFields.ReceiveOrdersSince,
            desc: `${ESanitizeFlightErrors.ReceiveOrdersSinceHigher}: ${formatLocaleDate(flight.until)}`
        }
    }
}

const sanitize_receiveOrdersUntil = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'receiveOrdersUntil') && !isValidDate(flight.receiveOrdersUntil)
    if (hasError) return {
        err: {
            field: EFlightFields.ReceiveOrdersUntil,
            desc: ESanitizeFlightErrors.ReceiveOrdersUntil
        }
    }

    const receiveOrderUntilLower_error = flight.receiveOrdersSince >= flight.receiveOrdersUntil
    if (receiveOrderUntilLower_error) return {
        err: {
            field: EFlightFields.ReceiveOrdersUntil,
            desc: `${ESanitizeFlightErrors.ReceiveOrdersUntilLower}: ${formatLocaleDate(flight.receiveOrdersSince)}`
        }
    }

    const receiveOrdersUntilHigher_error = flight.receiveOrdersUntil >= flight.until
    if (receiveOrdersUntilHigher_error) return {
        err: {
            field: EFlightFields.ReceiveOrdersUntil,
            desc: `${ESanitizeFlightErrors.ReceiveOrdersUntilHigher}: ${formatLocaleDate(flight.until)}`
        }
    }
}

const sanitize_shippingDestination = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'shippingDestination') && !Object.values(EShippingDestination).map((sd) => capitalizeString(sd)).includes(flight.shippingDestination)
    if (hasError) return {
        err: {
            field: EFlightFields.ShippingDestination,
            desc: ESanitizeFlightErrors.ShippingDestination
        }
    }
}

const sanitize_deliverOrderAt = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'deliverOrderAt') && !isValidDate(flight.deliverOrderAt)
    if (hasError) return {
        err: {
            field: EFlightFields.DeliverOrderAt,
            desc: ESanitizeFlightErrors.DeliverOrderAt
        }
    }

    const diff = flight.deliverOrderAt - flight.until
    const hours = diff / (1000 * 60 * 60)
    console.log('--- hours =', hours)

    const deliverOrderAtHigher_error = !(hours > 0 && hours <= MAX_DELIVERY_HOURS_AFTER_FLIGHT)
    if (deliverOrderAtHigher_error) return {
        err: {
            field: EFlightFields.DeliverOrderAt,
            desc: `${ESanitizeFlightErrors.DeliverOrderAtHigher}: ${formatLocaleDate(flight.until)}`
        }
    }
}

const sanitize_confirmDeliverOrder48h = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'confirmDeliverOrder48h') && !isBoolean(flight.confirmDeliverOrder48h)
    if (hasError) return {
        err: {
            field: EFlightFields.ConfirmDeliverOrder48h,
            desc: ESanitizeFlightErrors.ConfirmDeliverOrder48h
        }
    }
}


const sanitize = (flight: IFlight) => {
    // Sanitize for step-1
    const travelerId_error = sanitize_travelerId(flight)
    if (travelerId_error) return travelerId_error

    const status_error = sanitize_status(flight)
    if (status_error) return status_error

    const since_error = sanitize_since(flight)
    if (since_error) return since_error

    const until_error = sanitize_until(flight)
    if (!since_error && until_error) return until_error

    const receiveOrdersSince_error = sanitize_receiveOrdersSince(flight)
    if (!since_error && receiveOrdersSince_error) return receiveOrdersSince_error

    const receiveOrdersUntil_error = sanitize_receiveOrdersUntil(flight)
    if (!receiveOrdersSince_error && receiveOrdersUntil_error) return receiveOrdersUntil_error


    // Sanitize for step-2_1
    const shippingDestination_error = sanitize_shippingDestination(flight)
    if (shippingDestination_error) return shippingDestination_error

    const deliverOrderAt_error = sanitize_deliverOrderAt(flight)
    if (deliverOrderAt_error) return deliverOrderAt_error

    const confirmDeliverOrder48h_error = sanitize_confirmDeliverOrder48h(flight)
    if (confirmDeliverOrder48h_error) return confirmDeliverOrder48h_error

    
    // Sanitize for step-2
    if (hasParameter(flight?.housing?.place, 'district') && !isValidString(flight.housing.place.district))
        return {
            err: {
                field: EPlaceFields.District,
                desc: ESanitizePlaceErrors.District,
            }
        }
    
    if (hasParameter(flight?.housing?.place, 'country') && !Object.values(ECountry).includes(flight.housing.place.country))
        return {
            err: {
                field: EPlaceFields.Country,
                desc: ESanitizePlaceErrors.Country,
            }
        }

    if (hasParameter(flight?.housing?.place, 'state') && !isValidString(flight.housing.place.state))
        return {
            err: {
                field: EPlaceFields.State,
                desc: ESanitizePlaceErrors.State,
            }
        }

    if (hasParameter(flight?.housing?.place, 'city') && !isValidString(flight.housing.place.city))
        return {
            err: {
                field: EPlaceFields.City,
                desc: ESanitizePlaceErrors.City,
            }
        }

    if (hasParameter(flight?.housing?.place, 'zipcode') && !isValidString(flight.housing.place.zipcode))
        return {
            err: {
                field: EPlaceFields.Zipcode,
                desc: ESanitizePlaceErrors.Zipcode,
            }
        }

    if (hasParameter(flight?.housing, 'type') && !Object.values(EHousingType).includes(flight.housing.type))
        return {
            err: {
                field: EHousingFields.Type,
                desc: ESanitizeHousingErrors.Type
            }
        }

    if (hasParameter(flight?.housing, 'address') && !isValidString(flight.housing.address))
        return {
            err: {
                field: EHousingFields.Address,
                desc: ESanitizeHousingErrors.Address
            }
        }

    if (hasParameter(flight, 'isResponsibleFor') && !isBoolean(flight.isResponsibleFor))
        return {
            err: {
                field: EFlightFields.IsResponsibleFor,
                desc: ESanitizeFlightErrors.IsResponsibleFor
            }
        }

    if (hasParameter(flight, 'areReceiveOrderDatesOk') && !isBoolean(flight.areReceiveOrderDatesOk))
        return {
            err: {
                field: EFlightFields.AreReceiveOrderDatesOk,
                desc: ESanitizeFlightErrors.AreReceiveOrderDatesOk
            }
        }

    // Sanitize for step-3
    if (hasParameter(flight?.receiver, 'name') && !isValidString(flight.receiver.name))
        return {
            err: {
                field: EReceiverFields.Name,
                desc: ESanitizeReceiverErrors.Name
            }
        }

    if (hasParameter(flight?.receiver, 'phone') && !isValidString(flight.receiver.phone))
        return {
            err: {
                field: EReceiverFields.Phone,
                desc: ESanitizeReceiverErrors.Phone
            }
        }

    // Sanitize for step-5
    if (hasParameter(flight, 'code') && !isValidString(flight.code))
        return {
            err: {
                field: EFlightFields.Code,
                desc: ESanitizeFlightErrors.Code
            }
        }

    if (hasParameter(flight, 'airline') && !isValidString(flight.airline))
        return {
            err: {
                field: EFlightFields.Airline,
                desc: ESanitizeFlightErrors.Airline
            }
        }

    // if (hasParameter(flight, 'from') && !Object.values(ECountry).includes(flight.from))
    //     return {
    //         err: {
    //             field: EFlightFields.From,
    //             desc: ESanitizeFlightErrors.From
    //         }
    //     }

    // if (hasParameter(flight, 'to') && flight.from !== flight.to)
    //     return {
    //         err: {
    //             field: EFlightFields.To,
    //             desc: ESanitizeFlightErrors.To
    //         }
    //     }

    const from_error = sanitize_from(flight)
    if (from_error) return from_error

    const to_error = sanitize_to(flight)
    if (!from_error && to_error) return to_error
}

const sanitize_from = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'from') && !Object.values(ECountry).includes(flight.from)
    if (hasError) return {
        err: {
            field: EPlaceFields.Country,
            desc: ESanitizeFlightErrors.From
        }
    }
}

const sanitize_to = (flight: IFlight) => {
    const hasError = hasParameter(flight, 'to') && !Object.values(ECountry).includes(flight.to)
    if (hasError) return {
        err: {
            field: EFlightFields.To,
            desc: ESanitizeFlightErrors.To
        }
    }

    const toEqualsFrom_error = flight.from === flight.to
    if (toEqualsFrom_error) return {
        err: {
            field: EFlightFields.To,
            desc: ESanitizeFlightErrors.ToEqualsFrom
        }
    }
}

const toVisible = async (wf, id) => {
    const flight = await get(wf, wf.mode.Offline, id, EFormat.Raw)
    flight.status = EFlightStatus.Visible
    flight.updatedAt = new Date()

    const transactionData = {
        flight: {
            collectionName: 'flights',
            datas: [flight]
        },
        fns: {
            formatDocForDB: (visibleFlightToFormat) => {
                const { id, ...data } = visibleFlightToFormat
                return wf.database.formatDocForDB(data)
            }
        }
    }

    const onTransaction = async (transaction, transactionData) => {
        const flightRef = transactionData.flight.docRefs[0]
        const flightDoc = await transaction.get(flightRef)
        const flight = flightDoc.data()

        if (!flightDoc.exists())
            return Promise.reject({
                desc: `El vuelo con ${flightRef.id} no existe`
            })

        if (flight.status === EFlightStatus.Visible)
            return Promise.reject({
                desc: `El vuelo ya tiene el estado ${EFlightStatus.Visible}`
            })
        
        const data = transactionData.flight.datas[0]
        const formattedData = transactionData.fns.formatDocForDB(data)
        transaction.update(flightRef, formattedData)

        return {
            id: flightRef.id,
            ...formattedData
        }
    }

    return wf.database.runWithTransaction(transactionData, onTransaction)
}

const toRegistered = async (wf, id) => {
    const flight = await get(wf, wf.mode.Offline, id, EFormat.Raw)
    flight.status = EFlightStatus.Registered
    flight.updatedAt = new Date()

    const quotations = await MQuotation.getAllByFlightId(wf, wf.mode.Network, EFormat.Raw, id)

    const transactionData = {
        flight: {
            collectionName: 'flights',
            datas: [flight]
        },
        quotation: {
            collectionName: 'quotations',
            datas: quotations
        }
    }

    const onTransaction = async (transaction, transactionData) => {
        const quotationRefs = transactionData.quotation.docRefs
        const quotationDocs = await Promise.all(
            quotationRefs.map((quotationRef) => transaction.get(quotationRef))
        )
        
        const invalidQuotationDocs = quotationDocs.filter((quotationDoc) => !quotationDoc.exists())
        if (invalidQuotationDocs.length)
            return Promise.reject({
                desc: `Algunas cotizaciones no existen. De preferencia cierre e inicie sesión`
            })

        const quotations = quotationDocs.map((quotationDoc) => quotationDoc.data())
        
        const selectedQuotations = quotations.filter((quotation) => quotation.status === EQuotationStatus.Selected)
        if (selectedQuotations.length)
            return Promise.reject({
                desc: 'Este vuelo ya ha sido elegido por un comprador, no se puede reestablecer'
            })

        const payedQuotations = quotations.filter((quotation) => quotation.status === EQuotationStatus.Paid)
        if (payedQuotations.length)
            return Promise.reject({
                desc: 'Este vuelo ya ha sido pagado por un comprador, no se puede reestablecer'
            })

        const flightRef = transactionData.flight.docRefs[0]
        const flightDoc = await transaction.get(flightRef)
        const flight = flightDoc.data()

        if (!flightDoc.exists())
            return Promise.reject({
                desc: `El vuelo con ${flightRef.id} no existe`
            })

        if (flight.status !== EFlightStatus.Visible)
            return Promise.reject({
                desc: `El vuelo ya se encuentra como no ${EFlightStatus.Visible}`
            })
        
        const data = transactionData.flight.datas[0]
        transaction.update(flightRef, data)

        return {
            id: flightRef.id,
            ...data
        }
    }

    return wf.database.runWithTransaction(transactionData, onTransaction)
}

export default{
    collection: 'flights',
    toRow,

    prettify,
    get,
    getAll,
    update,
    add,
    remove,

    getAllByIds,
    uninstall,
    getAllByTravelerId,
    getAllByUserAuthenticated,
    getAllWithQuotations,

    sanitize,
    toVisible,
    toRegistered,
}