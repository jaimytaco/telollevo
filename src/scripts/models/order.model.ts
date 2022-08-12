import { capitalizeString } from '@helpers/util.helper'
import { IOrder, EOrderStatus, EOrderSorters } from '@types/order.type'
import { EFormat } from '@types/util.type'
import { IQuotation } from '@types/quotation.type'
import MQuotation from '@models/quotation.model'

import { logger } from '@wf/helpers/browser.helper'

const formatProductDetails = (order: IOrder) => {
    return `
        <div class="card-8 card-7-group" data-heading="Más detalles">
            <div class="card-7">
                <picture>
                    <img src="/img/icon/package.svg" width="18" height="18">
                </picture>
                <p>El pedido incluye ${order.product.units} producto${order.product.units > 1 ? 's' : ''}</p>
            </div>
        ${
            order.product.isBoxIncluded ? `
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>El pedido se entregará con caja</p>
                </div>
            ` : ''
        }
        ${
            order.product.weightMore5kg ? `
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>El pedido pesa +5kg</p>
                </div>
            ` : ''
        }
        ${
            order.product.isTaller50cm ? `
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>El pedido pesa mide +50cm</p>
                </div>
            ` : ''
        }
        ${
            order.product.isOneUnitPerProduct ? `
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
        ${
            order.comments.length ? `
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

const formatRowExtra = (order: IOrder) => {
    switch(order.status){
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
                            ${
                                order.comments.length ? `
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
                        ${formatProductDetails(order)}
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
                            ${
                                order.quotations
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

const formatRowActions = (order: IOrder) => {
    switch(order.status){
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
        actions: formatRowActions(order),
        extra: formatRowExtra(order),
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

    if (quotations?.err){
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

const format = (order: IOrder) => order

export default{
    collection: 'orders',
    toRow,
    EOrderStatus,
    EOrderSorters,

    format,
    getAll,
    add,

    getAllByShopperId,
}