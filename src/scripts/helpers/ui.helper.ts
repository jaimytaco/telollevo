import { app } from '@helpers/app.helper'
import { capitalizeString } from '@helpers/util.helper'

import { createOrder_dialog, createFlight_dialog } from '@data/admin/dialog.data'

import paths from '@data/admin/path.data.json' // TODO: Check if this is necessary

import MUser from '@models/user.model'
import MOrder from '@models/order.model'
import MFlight from '@models/flight.model'
 
import CTable from '@components/table.component'

import { 
    isNode,
    logger
} from '@wf/helpers/browser.helper'

export const adminHeader = (user, actions, currentPage, currentNamePlural) => {
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
                            <span>${MUser.getAcronym(user)}</span>
                            <!--
                            <picture>
                                <img src="/img/icon/user.svg" width="20" height="20">
                            </picture>
                            -->
                            <!-- <span>
                                ${MUser.getFullName(user)}
                                <br>
                                <small>${MUser.getType(user)}</small>
                            </span> -->
                            <ul class="sp-popup">
                                <li>
                                    <button class="btn" data-sign-out_btn>
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