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

import { IQuotation } from '@types/quotation.type'
import { EProductCategory } from '@types/product.type'
import MQuotation from '@models/quotation.model'

import { IUser, EUserType } from '@types/user.type'

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

const toRowExtra = (order: IOrder) => {
    switch (order.status) {
        case EOrderStatus.Registered:
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
        case EOrderStatus.Quoted:
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
                            ${order.quotations
                    .map((quotation: IQuotation) => `
                                        <div class="card-14">
                                            <div class="card-7 c-7-p">
                                                <p>
                                                    <strong>Fabián Delgado</strong>
                                                    <br>
                                                    <span>${quotation.flight.from} <span class="c-tertiary">→</span> ${quotation.flight.to}</span>
                                                </p>
                                            </div>
                                            <button class="btn btn-primary" data-select-quotation_btn="q-${quotation.id}">Elegir por ${quotation.priceStr}</button>
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
}

const toRowActions = (order: IOrder) => {
    switch (order.status) {
        case EOrderStatus.Registered:
            return `
                <div class="t-r-actions t-r-actions-desktop">
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
                            </ul>
                        </span>
                    </div>
                </div>
            `
        case EOrderStatus.Quoted:
            return `
                <div class="t-r-actions t-r-actions-desktop">
                    <button class="btn btn-primary" data-show-table-extra_id="te-${order.id}">
                        <span>Elegir viajero</span>
                    </button>
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
                                <li>
                                    <button class="btn" data-show-table-extra_id="te-${order.id}">Elegir viajero</button>
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

const toRow = (order: IOrder) => {
    return {
        id: order.id,
        tags: [capitalizeString(order.status)],
        heading: order.product.name,
        details: [{
            description: order.product.category
        }],
        icon: 'order.svg',
        actions: toRowActions(order),
        extra: toRowExtra(order),
    }
}

const getAllByUserAuthenticated = async (wf, mode, isFormatted: EFormat, user: IUser, date?) => {
    if (user.type === EUserType.Shopper) {
        return getAllByShopperId(wf, mode, isFormatted, user.id, date)
    }

    // TODO: query orders according to user-type
    if (user.type === EUserType.Traveler) {
        return []
    }

    if (user.type === EUserType.Multiple) {
        return []
    }

    if (user.type === EUserType.Admin) {
        return []
    }
}

const getAllByShopperId = (wf, mode, isFormatted: EFormat, shopperId, date?) => {
    const { operator } = wf

    const byShopper = {
        field: 'shopperId',
        operator: operator.EqualTo,
        value: shopperId
    }

    const byRecent = {
        field: 'updatedAt',
        operator: operator.GreaterThanOrEqualTo,
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

    logger(`Orders uninstalled successfully!`)
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

    const quotations = await MQuotation.getAll(wf, mode, isFormatted)

    if (quotations?.err) {
        const { err } = quotations
        logger(err)
        return { err }
    }

    const ordersWithQuotation = orders.map((order) => {
        order.quotations = quotations
            .filter((quotation) => quotation.orderId === order.id)
        return order
    })

    return isFormatted === EFormat.Related ?
        ordersWithQuotation :
        ordersWithQuotation.map(format)
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

    return isFormatted === EFormat.Related ?
        order :
        format(order)
}

const format = (order: IOrder) => order

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

export default {
    collection: 'orders',
    toRow,
    EOrderStatus,
    EOrderSorters,

    format,
    getAll,
    add,
    remove,

    getAllByIds,
    getAllByShopperId,
    getAllByUserAuthenticated,

    sanitize,
    uninstall,
}