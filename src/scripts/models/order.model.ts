import {
    capitalizeString,
    isValidHttpUrl,
    isNumeric,
    isBoolean,
    isValidString,
    hasParameter,
} from '@helpers/util.helper'

import {
    IOrder,
    IProduct,
    EOrderStatus,
    EOrderSorters,
    EOrderFields,
    ESanitizeOrderErrors,
    EOrderShippers,
    EOrderShoppers,
} from '@types/order.type'

import {
    EFormat,
    ECoin,
    EShippingDestination,
} from '@types/util.type'

import { IQuotation, EQuotationStatus } from '@types/quotation.type'
import { EProductCategory } from '@types/product.type'
import MQuotation from '@models/quotation.model'

import { IUser, EUserType } from '@types/user.type'
import MUser from '@models/user.model'

import { IFlight, EFlightStatus } from '@types/flight.type'
import MFlight from '@models/flight.model'

import { logger } from '@wf/helpers/browser.helper'
import { removeOfflineTimestamp } from '@wf/lib.worker'


const toProductDetails = (order: IOrder) => {
    return `
        <div class="card-8 card-7-group" data-heading="Más detalles">
            <div class="card-7">
                <picture>
                    <img src="/img/icon/package.svg" width="18" height="18">
                </picture>
                <p>El pedido incluye ${order.product.units} producto${order.product.units > 1 ? 's' : ''}</p>
            </div>
        ${order.product.isBoxIncluded ? `
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>El pedido se entregará con caja</p>
                </div>
            ` : ''
        }
        ${order.product.weightMore5kg ? `
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>El pedido pesa +5kg</p>
                </div>
            ` : ''
        }
        ${order.product.isTaller50cm ? `
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>El pedido pesa mide +50cm</p>
                </div>
            ` : ''
        }
        ${order.product.isOneUnitPerProduct ? `
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>En un producto viene muchas unidades</p>
                </div>
            ` : ''
        }
        <div class="card-7">
            <picture>
                <img src="/img/icon/package.svg" width="18" height="18">
            </picture>
            <p>El envío lo hace ${order.shipper}</p>
        </div>
        <div class="card-7">
            <picture>
                <img src="/img/icon/package.svg" width="18" height="18">
            </picture>
            <p>La entrega será en ${order.shippingDestination}</p>
        </div>
        ${order.comments.length ? `
                <!--
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>Comentarios: ${order.comments}</p>
                </div>
                -->
            ` : ''
        }
        <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-open" data-c-8_btn>Ver más detalles</button>
        <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-close" data-c-8_btn>Ocultar más detalles</button>
    </div>
    `
}

const toRowExtra_RegisteredOrder = (order: IOrder) => {
    return `
        <div id="te-${order.id}" class="t-r-extra">
            <div class="card-4">
                <div class="card-5 c-5-bordered">
                    <picture>
                        <img src="/img/icon/alert-secondary.svg" widtht="20" height="20">
                    </picture>
                    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
                <div class="card-6">
                    <h6>Detalles del artículo</h6>
                    <div class="card-7-group">
                        <div class="card-7">
                            <p>
                                Link del artículo:
                                <br>
                                <span>Revisa <a href="${order.product.url}" target="_blank">aquí</a> el artículo.</span>
                            </p>
                        </div>
                        <div class="card-7">
                            <p>
                                Valor del artículo:
                                <br>
                                <span>El artículo tiene un precio de ${order.product.price} ${order.product.coin}.</span>
                            </p>
                        </div>
                    </div>
                    ${order.comments.length ? `
                        <div class="card-5">
                            <p>
                                <strong>Mensaje del comprador:</strong>
                                <br>
                                ${order.comments}
                            </p>
                        </div>
                    ` : ''
        }
                </div>
                ${toProductDetails(order)}
            </div>
        </div>
    `
}

const toRowExtra_QuotedOrder = (order: IOrder) => {
    return `
        <div id="te-${order.id}" class="t-r-extra">
            <div class="card-4">
                <div class="card-5 c-5-bordered">
                    <picture>
                        <img src="/img/icon/alert-secondary.svg" widtht="20" height="20">
                    </picture>
                    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
                <div class="card-14-group">
                    ${order.quotations.map((quotation: IQuotation) => `
                        <div class="card-14">
                            <div class="card-7 c-7-p">
                                <p>
                                    <strong>${MUser.getFullName(quotation.traveler)}</strong>
                                    <!--
                                    <strong>Detalle del Viajero</strong>
                                    -->
                                    <br>
                                    <span>${quotation.flight.from} <span class="c-tertiary">→</span> ${quotation.flight.to}</span>
                                </p>
                            </div>
                            <button class="btn btn-primary" data-pick-and-pay-quotation_btn data-quotation_id="${quotation.id}">Elegir por ${quotation.computed.priceStr}</button>
                            <div class="card-15">
                                <p>
                                    <span>Recibe pedido  ·  ${quotation.flight.receiveOrdersSince} al ${quotation.flight.receiveOrdersUntil}</span>
                                    <span>Entrega pedido  ·  ${quotation.flight.deliverOrderAt}</span>
                                </p>
                            </div>
                            <div class="card-8 c-8-visible card-7-group" data-heading="Dirección de envío">
                                <div class="card-7 c-7-p">
                                    <p class="c-7-close">
                                        <span>
                                            ${quotation.flight.housing.address}, ${quotation.flight.housing.place.district}<br>
                                            ${quotation.flight.housing.place.city}, ${quotation.flight.housing.place.state}, ${quotation.flight.housing.place.country}<br>
                                            ${quotation.flight.housing.place.zipcode}
                                        </span>
                                    </p>
                                </div>
                                <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-open" data-c-8_btn>Ver dirección de envío</button>
                                <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-close" data-c-8_btn>Ocultar dirección de envío</button>
                            </div>
                        </div>
                    `)
        }
                </div>
            </div>
        </div>
    `
}

const toRowExtra_PaidOrder = (user: IUser, order: IOrder) => {
    return `
        <div id="te-${order.id}" class="t-r-extra">
            <div class="card-4">
                <div class="card-5 c-5-bordered">
                    <picture>
                        <img src="/img/icon/alert-secondary.svg" widtht="20" height="20">
                    </picture>
                    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
                <div class="card-6">
                    <h6>Detalles del envío</h6>
                    <div class="card-7-group">
                        <div class="card-7">
                            <p>
                                ${
                                    user.type === EUserType.Admin ? 
                                        `${MUser.getFullName(order.computed.shopper)}  ·  <span>Comprador</span>
                                        <br>` : ''
                                }
                                ${MUser.getFullName(order.computed.pickedTraveler)}  ·  <span>Viajero asignado</span>
                            </p>
                        </div>
                        <div class="card-15">
                            <p>
                                <span>Recibe pedido  ·  ${order.computed.pickedFlight.receiveOrdersSince} al ${order.computed.pickedFlight.receiveOrdersUntil}</span>
                                <span>Entrega pedido  ·  ${order.computed.pickedFlight.deliverOrderAt}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="card-8 card-7-group" data-heading="Más detalles">
                    <div class="card-7">
                        <picture>
                            <img src="/img/icon/package.svg" width="18" height="18">
                        </picture>
                        <p>El alojamiento es un ${order.computed.pickedFlight.shippingDestination} con dirección ${order.computed.pickedFlight.housing.address}, ${order.computed.pickedFlight.housing.place.district}, ${order.computed.pickedFlight.housing.place.city}, ${order.computed.pickedFlight.housing.place.state} - ${order.computed.pickedFlight.housing.place.country} ${order.computed.pickedFlight.housing.place.zipcode}</p>
                    </div>
                    <div class="card-7">
                        <picture>
                            <img src="/img/icon/package.svg" width="18" height="18">
                        </picture>
                        <p>El pedido será recepcionado por ${order.computed.pickedFlight.receiver.name} - ${order.computed.pickedFlight.receiver.phone}</p>
                    </div>
                    <div class="card-7">
                        <picture>
                            <img src="/img/icon/package.svg" width="18" height="18">
                        </picture>
                        <p>La entrega será en ${order.computed.pickedFlight.shippingDestination}</p>
                        </div>
                    <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-open" data-c-8_btn="">Ver más detalles</button>
                    <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-close" data-c-8_btn="">Ocultar más detalles</button>
                </div>
            </div>
        </div>
    `
}

const toRowExtra = (user: IUser, order: IOrder) => {
    switch (order.computed.status) {
        case EOrderStatus.Registered:
            return toRowExtra_RegisteredOrder(order)
        case EOrderStatus.Quoted:
            if (user.type === EUserType.Shopper) 
                return toRowExtra_QuotedOrder(order)
            return toRowExtra_RegisteredOrder(order)
        case EOrderStatus.Paid:
            return toRowExtra_PaidOrder(user, order)
        default:
            return ''
    }
}

const toRowActions_RegisteredOrder = (order: IOrder) => {
    return `
        <div class="t-r-actions t-r-actions-desktop">
            ${order.computed.isQuotableByTraveler ?
                `<button class="btn btn-primary" data-quote-order_btn data-quote-order_id="${order.id}">
                    <span>Cotizar pedido</span>
                </button>` : ''
            }
            <button class="btn btn-round btn-spin" data-show-table-extra_id="te-${order.id}">
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
                            <button class="btn" data-show-table-extra_id="te-${order.id}" data-show-table-extra_id-close="Ocultar pedido" data-show-table-extra_id-open="Ver pedido">Ver pedido</button>
                        </li>
                        ${
                            order.computed.isQuotableByTraveler ?
                                `<li>
                                    <button class="btn" data-quote-order_btn data-quote-order_id="${order.id}">Cotizar pedido</button>
                                </li>` : ''
                        }
                    </ul>
                </span>
            </div>
        </div>
    `
}

const toRowActions_QuotedOrder = (user: IUser, order: IOrder) => {
    return `
        <div class="t-r-actions t-r-actions-desktop">
            ${
                user.type === EUserType.Shopper ?
                `
                    <button class="btn btn-primary" data-show-table-extra_id="te-${order.id}">
                        <span>Elegir viajero</span>
                    </button>
                ` : ''
            }
            <button class="btn btn-round btn-spin" data-show-table-extra_id="te-${order.id}">
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
                            <button class="btn" data-show-table-extra_id="te-${order.id}" data-show-table-extra_id-close="Ocultar pedido" data-show-table-extra_id-open="Ver pedido">Ver pedido</button>
                        </li>
                        ${
                            user.type === EUserType.Shopper ?
                            `
                            <li>
                                <button class="btn" data-show-table-extra_id="te-${order.id}">Elegir viajero</button>
                            </li>
                            ` : ''
                        }
                    </ul>
                </span>
            </div>
        </div>
    `
}

const toRowActions = (user: IUser, order: IOrder) => {
    switch (order.computed.status) {
        case EOrderStatus.Registered:
            return toRowActions_RegisteredOrder(order)
        case EOrderStatus.Quoted:
            return toRowActions_QuotedOrder(user, order)
        case EOrderStatus.Paid:
            return toRowActions_RegisteredOrder(order)
        default:
            return ''
    }
}

const toRowTags = (user: IUser, order: IOrder) => {
    const status = order.computed.status
    if (status === EOrderStatus.Quoted && user.type === EUserType.Traveler){
        const hasTravelerQuoted = getAllTravelerIdsWhoQuoted(order).includes(user.id)
        const tags = hasTravelerQuoted ? [EOrderStatus.TravelerQuoted] : [EOrderStatus.Registered]
        return tags.map(capitalizeString)
    }
    return [status].map(capitalizeString)
}

const toRow = (user: IUser, order: IOrder) => {
    return {
        id: order.id,
        tags: toRowTags(user, order),
        heading: order.product.name,
        details: [{
            description: order.product.category
        }],
        icon: 'order.svg',
        actions: toRowActions(user, order),
        extra: toRowExtra(user, order),
    }
}

// const toPaid = async (wf, payedQuotation: IQuotation) => {
//     const order = await get(wf, wf.mode.Network, payedQuotation.orderId, EFormat.Raw)
//     order.updatedAt = new Date()
//     order.status = EOrderStatus.Paid
//     order.pickedFlightId = payedQuotation.flightId
//     order.pickedTravelerId = payedQuotation.travelerId
//     order.pickedQuotationId = payedQuotation.id

//     await Promise.all([
//         update(wf, wf.mode.Network, order),
//         update(wf, wf.mode.Offline, order)
//     ])
// }

const compute = async (wf, mode, user, order: IOrder) => {
    const status = await computeStatus(wf, mode, user, order)
    const quotations = await Promise.all(
        (order.quotations as IQuotation[]).map((quotation) => MQuotation.compute(wf, mode, quotation))
    )

    const pickedFlight = status === EOrderStatus.Paid ? 
        await MFlight.get(wf, mode, order.pickedFlightId, EFormat.Pretty) : null
    
    const pickedTraveler = status === EOrderStatus.Paid ? 
        await MUser.get(wf, mode, order.pickedTravelerId, EFormat.Pretty) : null
    
    const shopper = status === EOrderStatus.Paid ? 
        await MUser.get(wf, mode, order.shopperId, EFormat.Pretty) : null

    const isOrderQuotableByTraveler = await isQuotableByTraveler(wf, mode, user, order)

    return {
        ...order,
        quotations,
        computed: {
            status,
            pickedFlight,
            pickedTraveler,
            shopper,
            isQuotableByTraveler: isOrderQuotableByTraveler,
        }
    }
}

const computeStatus = async (wf, mode, user: IUser, order: IOrder) => {
    if (order.status !== EOrderStatus.Registered) return order.status

    if (user.type === EUserType.Shopper) {
        const canShopperSelectFlightForOrder = await canShopperSelectFlight(wf, mode, order)
        if (canShopperSelectFlightForOrder) return EOrderStatus.Quoted
        return EOrderStatus.Registered
    }

    if (user.type === EUserType.Traveler) {
        const isOrderQuotableByTraveler = await isQuotableByTraveler(wf, mode, user, order)
        if (!isOrderQuotableByTraveler) return EOrderStatus.Quoted
        return EOrderStatus.Registered
    }

    if (user.type === EUserType.Admin) {
        const quotations = await MQuotation.getAllByOrderId(wf, mode, EFormat.Raw, order.id) as IQuotation[]
        if (quotations.length) return EOrderStatus.Quoted
        return EOrderStatus.Registered
    }
}

const getAllTravelerIdsWhoQuoted = (order: IOrder) => order.quotations.map((quotation) => quotation.travelerId)

const getMinSelectedFlightsToSelectFlight = () => 1

const canShopperSelectFlight = async (wf, mode, order: IOrder) => {
    if (order.status === EOrderStatus.Paid) return false
    const quotations = await MQuotation.getAllByOrderId(wf, mode, EFormat.Raw, order.id) as IQuotation[]
    const flightIds = quotations.map((quotation) => quotation.flightId)
    const flights = await Promise.all(flightIds.map((flightId) => MFlight.get(wf, mode, flightId, EFormat.Raw))) as IFlight[]
    const selectedFlights = flights.filter((flight) => flight.status === EFlightStatus.Visible)

    return getMinSelectedFlightsToSelectFlight() <= selectedFlights.length
}

const isQuotableByTraveler = async (wf, mode, user: IUser, order: IOrder) => {
    if (user.type !== EUserType.Traveler) return false
    const quotations = await MQuotation.getAllByTravelerIdAndOrderId(wf, mode, EFormat.Raw, user.id, order.id) as IQuotation[]
    return !quotations.length
}

const getAllByUserAuthenticated = async (wf, mode, isFormatted: EFormat, user: IUser, date?) => {
    if (user.type === EUserType.Traveler){        
        const registeredOrders = await getAllByStatus(wf, mode, isFormatted, EOrderStatus.Registered, date)
        const paidOrders = await getAllPaidWithTravelerPicked(wf, mode, isFormatted, user.id, date)
        return [...registeredOrders, ...paidOrders]
    }

    if (user.type === EUserType.Admin)
        return getAll(wf, mode, isFormatted)

    if (user.type === EUserType.Shopper)
        return getAllByShopperId(wf, mode, isFormatted, user.id, date)
}

const getAllPaidWithTravelerPicked = (wf, mode, isFormatted: EFormat, travelerId, date?) => {
    const byStatus = {
        field: 'status',
        operator: wf.operator.EqualTo,
        value: EOrderStatus.Paid
    }

    const byTraveler = {
        field: 'pickedTravelerId',
        operator: wf.operator.EqualTo,
        value: travelerId
    }

    const byRecent = {
        field: 'updatedAt',
        operator: wf.operator.GreaterThanOrEqualTo,
        value: date
    }

    const filters = date ?
        [byStatus, byTraveler, byRecent] :
        [byStatus, byTraveler]

    return getAll(wf, mode, isFormatted, filters)
}

const getAllByStatus = (wf, mode, isFormatted: EFormat, status: EOrderStatus, date?) => {
    const byStatus = {
        field: 'status',
        operator: wf.operator.EqualTo,
        value: status
    }

    const byRecent = {
        field: 'updatedAt',
        operator: wf.operator.GreaterThanOrEqualTo,
        value: date
    }

    const filters = date ?
        [byStatus, byRecent] :
        [byStatus]

    return getAll(wf, mode, isFormatted, filters)
}

const getAllByShopperId = (wf, mode, isFormatted: EFormat, shopperId, date?) => {
    const byShopper = {
        field: 'shopperId',
        operator: wf.operator.EqualTo,
        value: shopperId
    }

    const byRecent = {
        field: 'updatedAt',
        operator: wf.operator.GreaterThanOrEqualTo,
        value: date
    }

    const filters = date ?
        [byShopper, byRecent] :
        [byShopper]

    return getAll(wf, mode, isFormatted, filters)
}

const getAllByIds = async (wf, mode, ids: string[], isFormatted: EFormat) => {
    return Promise.all(
        ids.map((id) => get(wf, mode, id, isFormatted))
    )
}

const uninstall = async (wf) => {
    const orders = await getAll(wf, wf.mode.Offline, EFormat.Raw)
    const orderIds = orders.map((order: IOrder) => order.id)
    await Promise.all([
        orderIds.map((id) => remove(wf, wf.mode.Offline, id)),
        removeOfflineTimestamp('orders')
    ])

    logger(`Orders uninstalled successfully`)
}

const remove = async (wf, mode, id) => {
    const { database: db } = wf
    const response = await db.remove(mode, 'orders', id)
    if (response?.err) {
        const { err } = response
        logger(err)
        return { err }
    }
}

const update = async (wf, mode, order) => wf.database.update(mode, 'orders', order)

const add = (wf, mode, order: IOrder) => {
    const { database: db } = wf
    return db.add(mode, 'orders', order)
}

const getAll = async (wf, mode, isFormatted: EFormat, filters?) => {
    const { database: db } = wf
    const responseOrders = await db.getAll(mode, 'orders', filters)
    if (responseOrders?.err) {
        const { err } = responseOrders
        logger(err)
        return { err }
    }

    const orders = responseOrders.data as IOrder[]
    if (isFormatted === EFormat.Raw) return orders

    const quotationsByOrders = await Promise.all(
        orders.map((order) => MQuotation.getAllByOrderId(wf, mode, isFormatted, order.id) as IQuotation[])
    )

    const ordersWithQuotation = orders.map((order, index) => {
        order.quotations = quotationsByOrders[index]
        return order
    })

    return isFormatted === EFormat.Related ?
        ordersWithQuotation :
        ordersWithQuotation.map(prettify)
}

const get = async (wf, mode, id, isFormatted: EFormat) => {
    const { database: db } = wf
    const responseOrder = await db.get(mode, 'orders', id)
    if (responseOrder?.err) {
        const { err } = responseOrder
        logger(err)
        return { err }
    }

    const order = responseOrder.data as IOrder
    if (isFormatted === EFormat.Raw) return order

    const quotations = await MQuotation.getAllByOrderId(wf, mode, isFormatted, order.id)
    const orderWithQuotations = {
        ...order,
        quotations
    }

    return isFormatted === EFormat.Related ?
        orderWithQuotations :
        prettify(orderWithQuotations)
}

// TODO: try-catch use-case?
// const relate = async (wf, mode, order: IOrder) => {
//     const quotations = await MQuotation.getAllByOrderId(wf, mode, EFormat.Related, order.id)
//     if (quotations?.err) {
//         const { err } = quotations
//         logger(err)
//         return { err }
//     }
    
//     return {
//         ...order,
//         quotations,
//     }
// }

const prettify = (order: IOrder) => ({
    ...order,
    quotations: order.quotations.map(MQuotation.prettify)
})

const sanitize = (order: IOrder) => {
    // Sanitize for step-1
    if (hasParameter(order?.product, 'name') && !isValidString(order.product.name))
        return {
            err: {
                field: EOrderFields.ProductName,
                desc: ESanitizeOrderErrors.ProductName
            }
        }

    if (hasParameter(order?.product, 'category') && !Object.values(EProductCategory).includes(order.product.category))
        return {
            err: {
                field: EOrderFields.ProductCategory,
                desc: ESanitizeOrderErrors.ProductCategory
            }
        }

    if (hasParameter(order?.product, 'url') && !isValidHttpUrl(order.product.url))
        return {
            err: {
                field: EOrderFields.ProductUrl,
                desc: ESanitizeOrderErrors.ProductUrl
            }
        }

    if (hasParameter(order?.product, 'price') && !isNumeric(order.product.price) || parseFloat(order.product.price) <= 0)
        return {
            err: {
                field: EOrderFields.ProductPrice,
                desc: ESanitizeOrderErrors.ProductPrice
            }
        }

    if (hasParameter(order?.product, 'units') && !isNumeric(order.product.units) || parseInt(order.product.units) <= 0)
        return {
            err: {
                field: EOrderFields.ProductUnits,
                desc: ESanitizeOrderErrors.ProductUnits
            }
        }

    if (hasParameter(order?.product, 'isBoxIncluded') && !isBoolean(order.product.isBoxIncluded))
        return {
            err: {
                field: EOrderFields.ProductIsBoxIncluded,
                desc: ESanitizeOrderErrors.ProductIsBoxIncluded
            }
        }

    if (hasParameter(order?.product, 'coin') && !ECoin[order.product.coin])
        return {
            err: {
                desc: ESanitizeOrderErrors.ProductCoin
            }
        }

    // Sanitize for step-2
    if (hasParameter(order?.product, 'weightMore5kg') && !isBoolean(order.product.weightMore5kg))
        return {
            err: {
                field: EOrderFields.ProductWeightMore5kg,
                desc: ESanitizeOrderErrors.ProductWeightMore5kg
            }
        }

    if (hasParameter(order?.product, 'isTaller50cm') && !isBoolean(order.product.isTaller50cm))
        return {
            err: {
                field: EOrderFields.ProductIsTaller50cm,
                desc: ESanitizeOrderErrors.ProductIsTaller50cm
            }
        }

    if (hasParameter(order?.product, 'isOneUnitPerProduct') && !isBoolean(order.product.isOneUnitPerProduct))
        return {
            err: {
                field: EOrderFields.ProductIsOneUnitPerProduct,
                desc: ESanitizeOrderErrors.ProductIsOneUnitPerProduct
            }
        }

    // Sanitize for step-1
    if (hasParameter(order, 'status') && !Object.values(EOrderStatus).includes(order.status))
        return {
            err: {
                desc: ESanitizeOrderErrors.Status
            }
        }

    if (hasParameter(order, 'shopperId') && !isValidString(order.shopperId))
        return {
            err: {
                desc: ESanitizeOrderErrors.ShopperId
            }
        }

    // Sanitize for step-2
    if (hasParameter(order, 'shipper') && !Object.values(EOrderShippers).includes(order.shipper))
        return {
            err: {
                field: EOrderFields.Shipper,
                desc: ESanitizeOrderErrors.Shipper
            }
        }

    // Sanitize for step-3
    if (hasParameter(order, 'shippingDestination') && !Object.values(EShippingDestination).includes(order.shippingDestination))
        return {
            err: {
                field: EOrderFields.ShippingDestination,
                desc: ESanitizeOrderErrors.ShippingDestination
            }
        }

    // Sanitize for step-4
    if (hasParameter(order, 'shopper') && !Object.values(EOrderShoppers).includes(order.shopper))
        return {
            err: {
                field: EOrderFields.Shopper,
                desc: ESanitizeOrderErrors.Shopper
            }
        }
}

const toQuoted = async (wf, orderId) => {
    const order = await get(wf, wf.mode.Offline, orderId, EFormat.Raw)
    if (order.status !== EOrderStatus.Registered) return

    order.updatedAt = new Date()
    order.status = EOrderStatus.Quoted

    await update(wf, wf.mode.Network, order)
    await update(wf, wf.mode.Offline, order)
}

export default {
    collection: 'orders',
    toRow,
    EOrderStatus,
    EOrderSorters,

    prettify,
    get,
    getAll,
    add,
    update,
    remove,

    getAllByIds,
    getAllByShopperId,
    getAllByUserAuthenticated,

    sanitize,
    uninstall,
    compute,
    toQuoted,
    // toPaid,
}