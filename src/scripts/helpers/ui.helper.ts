import { app } from '@helpers/app.helper'
import { capitalizeString } from '@helpers/util.helper'
import { createOrder_dialog } from '@data/admin/dialog.data'
import paths from '@data/admin/path.data.json' // TODO: Check if this is necessary
// import orders from '@data/admin/order.data.json'
import MOrders from '@models/order.model'
import CTable from '@components/table.component'

const adminDialogs = (page) => {
    switch (page){
        case 'admin-orders':
            return `${createOrder_dialog}`
        default:
            return ''
    }
}

const adminHeader = (actions, currentPage, currentNamePlural) => {
    return `
        <header>
            <nav class="n-top-1">
                <button class="btn btn-logo">
                    <picture>
                        <img src="/img/icon/logotype.svg" height="40">
                    </picture>
                </button>
                <form>
                    <fieldset class="fs-search">
                        <picture>
                            <img src="/img/icon/search.svg" width="16" height="16">
                        </picture>
                        <input type="text" placeholder="Buscar ${currentNamePlural}">
                    </fieldset>
                </form>
                <div class="n-t-1-end">
                    <!--
                    <button id="cart_btn" class="btn btn-cart">
                        <picture>
                            <img src="/img/icon/cart.svg" width="20" height="20">
                        </picture>
                    </button>
                    -->
                    <div class="split-btn">
                        <span class="sp-popup-trigger btn btn-auth" tabindex="-1">
                            <span>FD</span>
                            <!--
                            <picture>
                                <img src="/img/icon/user.svg" width="20" height="20">
                            </picture>
                            -->
                            <!-- <span>
                                Fabián Delgado
                                <br>
                                <small>Técnico</small>
                            </span> -->
                            <ul class="sp-popup">
                                <li>
                                    <button class="btn">
                                        Cerrar sesión
                                    </button>
                                </li>
                            </ul>
                        </span>
                    </div>
                </div>
            </nav>
            <nav class="n-top-2">
                <menu class="m-nav">
                    ${
                        paths
                            .map((path) => `
                                <a href="/admin/${path.page}" class="btn btn-nav${path.page === currentPage ? ' active' : ''}">
                                    <picture>
                                        <img src="/img/icon/${path.icon}" width="22" height="22">
                                    </picture>
                                    <span>${path.namePlural}</span>
                                </a>
                            `)
                            .join('')
                    }
                </menu>
                ${actions}
            </nav>
        </header>
    `
}

export const adminOrders = async (wf) => {
    // TODO: get orders from local DB
    const { data: orders, err } = await wf.database.getAll(wf.mode.Network, 'orders')
    if (err) throw 'error in orders fetch'
    
    const rows = orders.map(MOrders.toRow)

    const allStatus = Object.values(MOrders.EOrderStatus).map((status) => capitalizeString(status)) 
    const filters = [...allStatus]

    const allSorters = Object.values(MOrders.EOrderSorters)
    const sorters = [...allSorters]

    const tableHTML = CTable.render('Pedidos', rows, filters, sorters)

    const title = `${app.name} | Pedidos`
    const meta = `
        <meta name="description" content="DESCRIPTION">
        <meta property="og:url" content="OG_URL">
        <meta property="og:type" content="OG_TYPE">
    `
    const body = `
        ${
            adminHeader(`
                <div class="n-t-actions-2">
                    <button class="btn btn-secondary btn-sm" data-create-order-dialog_btn>
                        <picture>
                            <img src="/img/icon/plus-light.svg" width="14" height="14">
                        </picture>
                        <span>Crear pedido</span>
                    </button>
                </div>
            `, 'orders', 'órdenes')
        }
        <main>
            ${tableHTML}
        </main>
        ${adminDialogs('admin-orders')}
    `

    return {
        head: { title, meta },
        body
    }
}