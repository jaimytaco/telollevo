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
} from '@types/flight.type'

import { 
    IUser,
    EUserType, 
} from '@types/user.type'

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
    if (user.type === EUserType.Admin && flight.status === EFlightStatus.Registered)
        return 'Este vuelo cuenta con al menos una cotización, valídalo para que sea visible para el comprador.'
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

const toRowActions = (user: IUser, flight: IFlight) => {
    switch(flight.status){
        case EFlightStatus.Registered:
            return `
                <div class="t-r-actions t-r-actions-desktop">
                    ${
                        user.type === EUserType.Admin ?
                            `
                            <button class="btn btn-primary" data-visible-flight_btn="${flight.id}">
                                <span>Aprobar vuelo</span>
                            </button>
                            <button class="btn btn-round btn-spin" data-show-table-extra_id="te-${flight.id}">
                                <picture>
                                    <img src="/img/icon/chevron-down-sm.svg" width="14" height="14">
                                </picture>
                            </button>
                            ` : ''
                    }
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
                                            <button class="btn  data-visible-flight_btn="${flight.id}">Aprobar vuelo</button>
                                        </li> 
                                        ` : ''
                                }
                                
                            </ul>
                        </span>
                    </div>
                </div>
            `
        case EFlightStatus.Visible:
            return `
                <div class="t-r-actions t-r-actions-desktop">
                    <button class="btn btn-primary" data-visible-flight_btn="${flight.id}">
                        <span>Desaprobar vuelo</span>
                    </button>
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
                                <li>
                                    <button class="btn data-visible-flight_btn="${flight.id}">Desaprobar vuelo</button>
                                </li> 
                            </ul>
                        </span>
                    </div>
                </div>
            `
        default:
            return ''
    }
}

const toRow = (user: IUser, flight: IFlight) => {
    return {
        id: flight.id,
        tags: [capitalizeString(flight.status)],
        heading: `${flight.airline} - ${flight.code}`,
        details: [{
            description: `Fabián Delgado<br>DNI 88223302`
        }],
        icon: 'flight.svg',
        actions: toRowActions(user, flight),
        extra: toRowExtra(user, flight),
    }
}

const getAllByUserAuthenticated = async (wf, mode, isFormatted: EFormat, user: IUser, date?) => {
    if ([EUserType.Multiple, EUserType.Admin].includes(user.type))
        return getAll(wf, mode, isFormatted)

    if (user.type === EUserType.Traveler)
        return getAllByTravelerId(wf, mode, isFormatted, user.id, date)

    if (user.type === EUserType.Shopper)
        return []
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
        format(flight)
}

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
        flights.map(format)
}

const format = (flight: IFlight) => {
    flight.receiveOrdersSince = formatLocaleDate(flight.receiveOrdersSince)
    flight.receiveOrdersUntil = formatLocaleDate(flight.receiveOrdersUntil)
    flight.deliverOrderAt = formatLocaleDate(flight.deliverOrderAt)
    return flight
}

const sanitize = (flight: IFlight) => {
    // Sanitize for step-1
    if (hasParameter(flight, 'travelerId') && !isValidString(flight.travelerId))
        return {
            err: {
                desc: ESanitizeFlightErrors.TravelerId
            }
        }

    if (hasParameter(flight, 'status') && !Object.values(EFlightStatus).includes(flight.status))
        return {
            err: {
                desc: ESanitizeFlightErrors.Status
            }
        }
    
    if (hasParameter(flight, 'receiveOrdersSince') && !isValidDate(flight.receiveOrdersSince))
        return {
            err: {
                field: EFlightFields.ReceiveOrdersSince,
                desc: ESanitizeFlightErrors.ReceiveOrdersSince
            }
        }

    if (hasParameter(flight, 'receiveOrdersUntil') && !isValidDate(flight.receiveOrdersUntil))
        return {
            err: {
                field: EFlightFields.ReceiveOrdersUntil,
                desc: ESanitizeFlightErrors.ReceiveOrdersUntil
            }
        }

    if (hasParameter(flight, 'receiveOrdersSince') && hasParameter(flight, 'receiveOrdersUntil') && flight.receiveOrdersSince >= flight.receiveOrdersUntil)
        return {
            err: {
                field: EFlightFields.ReceiveOrdersUntil,
                desc: ESanitizeFlightErrors.ReceiveOrdersUntilLower
            }
        }
    
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

    // Sanitize for step-4
    if (hasParameter(flight, 'shippingDestination') && !Object.values(EShippingDestination).map((sd) => capitalizeString(sd)).includes(flight.shippingDestination))
        return {
            err: {
                field: EFlightFields.ShippingDestination,
                desc: ESanitizeFlightErrors.ShippingDestination
            }
        }

    if (hasParameter(flight, 'deliverOrderAt') && !isValidDate(flight.deliverOrderAt))
        return {
            err: {
                field: EFlightFields.DeliverOrderAt,
                desc: ESanitizeFlightErrors.DeliverOrderAt
            }
        }

    if (hasParameter(flight, 'confirmDeliverOrder48h') && !isBoolean(flight.confirmDeliverOrder48h))
        return {
            err: {
                field: EFlightFields.ConfirmDeliverOrder48h,
                desc: ESanitizeFlightErrors.ConfirmDeliverOrder48h
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

    if (hasParameter(flight, 'from') && !Object.values(ECountry).filter((value) => value !== ECountry.Peru).includes(flight.from))
        return {
            err: {
                field: EFlightFields.From,
                desc: ESanitizeFlightErrors.From
            }
        }

    if (hasParameter(flight, 'to') && ECountry.Peru !== flight.to)
        return {
            err: {
                field: EFlightFields.To,
                desc: ESanitizeFlightErrors.To
            }
        }
}

export default{
    collection: 'flights',
    toRow,

    format,
    get,
    getAll,
    add,
    remove,

    getAllByIds,
    uninstall,
    getAllByTravelerId,
    getAllByUserAuthenticated,

    sanitize,
}