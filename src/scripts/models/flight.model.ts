import {
    isNumeric,
    isBoolean,
    isValidString,
    isValidDate,
} from '@helpers/util.helper'

import { 
    IFlight, 
    EFlightStatus,
    EFlightFields,
    ESanitizeFlightErrors,
} from '@types/flight.type'

import { EFormat } from '@types/util.type'
import { capitalizeString, formatLocaleDate } from '@helpers/util.helper'

import { logger } from '@wf/helpers/browser.helper'
import { removeOfflineTimestamp } from '@wf/lib.worker'

import { EUserType } from '@types/user.type'


const formatRowExtra = (flight: IFlight) => {
    return `
        <div id="te-${flight.id}" class="t-r-extra">
            <div class="card-4">
                <div class="card-5 c-5-bordered">
                    <picture>
                        <img src="/img/icon/alert-secondary.svg" widtht="20" height="20">
                    </picture>
                    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
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

const formatRowActions = (flight: IFlight) => {
    switch(flight.status){
        case EFlightStatus.Registered:
            return `
                <div class="t-r-actions t-r-actions-desktop">
                    <button class="btn btn-primary" data-visible-flight_btn="${flight.id}">
                        <span>Aprobar vuelo</span>
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
                                    <button class="btn  data-visible-flight_btn="${flight.id}">Aprobar vuelo</button>
                                </li> 
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

const toRow = (flight: IFlight) => {
    return {
        id: flight.id,
        tags: [capitalizeString(flight.status)],
        heading: `${flight.airline} - ${flight.code}`,
        details: [{
            description: `Fabián Delgado<br>DNI 88223302`
        }],
        icon: 'flight.svg',
        actions: formatRowActions(flight),
        extra: formatRowExtra(flight),
    }
}

const getAllByUserAuthenticated = async (wf, mode, isFormatted: EFormat, user: IUser, date?) => {
    if (user.type === EUserType.Traveler){
        return getAllByTravelerId(wf, mode, isFormatted, user.id, date)
    }

    // TODO: query orders according to user-type
    if (user.type === EUserType.Shopper){
        return []
    }

    if (user.type === EUserType.Multiple){
        return []
    }

    if (user.type === EUserType.Admin){
        return []
    }
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

    logger(`Flights uninstalled successfully!`)
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
    if (flight.status && !Object.values(EFlightStatus).includes(flight.status))
        return {
            err: {
                desc: ESanitizeFlightErrors.Status
            }
        }
    
    if (flight.receiveOrdersSince && !isValidDate(flight.receiveOrdersSince))
        return {
            err: {
                field: EFlightFields.ReceiveOrdersSince,
                desc: ESanitizeFlightErrors.ReceiveOrdersSince
            }
        }

    if (flight.receiveOrdersUntil && !isValidDate(flight.receiveOrdersUntil))
        return {
            err: {
                field: EFlightFields.ReceiveOrdersUntil,
                desc: ESanitizeFlightErrors.ReceiveOrdersUntil
            }
        }

    if (flight.receiveOrdersSince >= flight.receiveOrdersUntil)
        return {
            err: {
                field: EFlightFields.ReceiveOrdersUntil,
                desc: ESanitizeFlightErrors.ReceiveOrdersUntilLower
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