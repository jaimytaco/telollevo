import { capitalizeString } from '@helpers/util.helper'
import { IOrder, EOrderStatus, EOrderSorters } from '@types/order.type'


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
                <div class="card-7">
                    <picture>
                        <img src="/img/icon/package.svg" width="18" height="18">
                    </picture>
                    <p>Comentarios: ${order.comments}</p>
                </div>
            ` : ''
        }
        <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-open" data-c-8_btn>Ver más detalles</button>
                <button class="btn btn-underline btn-xs-inline btn-xs-block c-8-close" data-c-8_btn>Ocultar más detalles</button>
    </div>
    `
}

const formatRowExtra = (order: IOrder) => {
    return `
        <div id="${order.id}" class="t-r-extra">
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
                            <!--
                            <picture>
                                <img src="/img/icon/link.svg" width="16" height="16">
                            </picture>
                            -->
                            <p>
                                Link del artículo:
                                <br>
                                <span>Revisa <a href="${order.product.url}" target="_blank">aquí</a> el artículo.</span>
                            </p>
                        </div>
                        <div class="card-7">
                            <!--
                            <picture>
                                <img src="/img/icon/coin.svg" width="16" height="16">
                            </picture>
                            -->
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
}

const formatRowActions = (order: IOrder) => {
    switch(order.status){
        case EOrderStatus.Registered:
            return `
                <button class="btn btn-primary" data-show-table-extra_id="id-quoted-listing">
                    <span>Aprobar pedido</span>
                </button>
            `
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
        actions: {},
        extra: formatRowExtra(order),
    }
}

export default{
    collection: 'orders',
    toRow,
    EOrderStatus,
    EOrderSorters,
}