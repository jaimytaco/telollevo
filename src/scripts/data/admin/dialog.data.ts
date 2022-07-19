import { EProductCategory } from '@data/admin/productCategory.data'
import { EOrderShippers, EOrderShippingDestination, EOrderShoppers } from '@types/order.type'
import { capitalizeString } from '@helpers/util.helper'

export const createOrder_dialog = `
    <nav id="create-order_dialog" class="n-dialog n-d-multistep">
        <form id="create-order-step-1_form">
            <header>
                <button type="button" class="btn btn-xs-inline btn-xs-block" data-close-dialog_btn="create-order_dialog">
                    <picture>
                        <img src="/img/icon/close.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Quieres registrar un pedido?</h3>
                    <p>Indícanos los datos de tu artículo.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <label for="product-link">Link del producto</label>
                    <input type="text" placeholder="Ingresa el link del producto" id="product-link">
                </fieldset>
                <fieldset>
                    <label for="product-name">Nombre del producto</label>
                    <input type="text" placeholder="Ingresa el nombre del producto" id="product-name">
                </fieldset>
                <fieldset>
                    <label for="">Categoría</label>
                    <input list="product-category" placeholder="Selecciona una categoría">
                    <datalist id="product-category">
                        ${
                            Object.values(EProductCategory)
                                .map((value) => `<option value="${value}"></option>`)
                                .join('')
                        }
                    </datalist>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="product-pu">Valor unitario</label>
                    <input type="number" placeholder="0.00" id="product-pu">
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="product-qty">Cantidad</label>
                    <input type="number" placeholder="0" id="product-qty">
                </fieldset>
                <fieldset>
                    <legend>¿Necesitas la caja del producto?</legend>
                    <input type="radio" name="product-need-box" value="yes" id="product-need-box_yes">
                    <label for="product-need-box_yes" class="btn">Sí</label>

                    <input type="radio" name="product-need-box" value="no" id="product-need-box_no" checked>
                    <label for="product-need-box_no" class="btn">No</label>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-order-step-2_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-order-step-2_form" data-previous-step_btn="create-order-step-1_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>Ahora que ya sabemos que deseas traer</h3>
                    <p>Indícanos las características de tu artículo.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <legend>¿Tu artículo pesa más de 5 kilos?</legend>
                    <input type="radio" name="product-weight-more-5kg" value="yes" id="product-weight-more-5kg_yes">
                    <label for="product-weight-more-5kg_yes" class="btn">Sí</label>

                    <input type="radio" name="product-weight-more-5kg" value="no" id="product-weight-more-5kg_no" checked>
                    <label for="product-weight-more-5kg_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>
                        ¿Tu artículo mide más de 50 cm?
                        <br>
                        <small>(de alguno de sus lados)</small>
                    </legend>
                    <input type="radio" name="product-is-taller-50cm" value="yes" id="product-is-taller-50cm_yes">
                    <label for="product-is-taller-50cm_yes" class="btn">Sí</label>

                    <input type="radio" name="product-is-taller-50cm" value="no" id="product-is-taller-50cm_no" checked>
                    <label for="product-is-taller-50cm_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>
                        ¿Alguno de los links contiene más de una unidad? <br>
                        <small>Por ejemplo packs, cajas o bolsas con varias unidades adentro.</small>
                    </legend>
                    <input type="radio" name="product-has-more-units" value="yes" id="product-has-more-units_yes">
                    <label for="product-has-more-units_yes" class="btn">Sí</label>

                    <input type="radio" name="product-has-more-units" value="no" id="product-has-more-units_no" checked>
                    <label for="product-has-more-units_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>¿Quién enviará tus compras al alojamiento del viajero?</legend>
                    <input type="radio" name="order-shipper" value="${EOrderShippers.Relative}" id="order-shipper_relative">
                    <label for="order-shipper_relative" class="btn">${capitalizeString(EOrderShippers.Relative)}</label>

                    <input type="radio" name="order-shipper" value="${EOrderShippers.Store}" id="order-shipper_store" checked>
                    <label for="order-shipper_store" class="btn">${capitalizeString(EOrderShippers.Store)}</label>
                </fieldset>
                <fieldset>
                    <label for="order-extra-comment">Si deseas, puedes dejarle un comentario al viajero</label>
                    <textarea id="order-extra-comment" placeholder="Ingresa un comentario para el viajero"></textarea>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-order-step-3_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-order-step-3_form" data-previous-step_btn="create-order-step-2_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Cómo prefieres la entrega?</h3>
                    <p>Una vez el artículo llegue a tu país destino.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <input type="radio" name="order-shipping-address" value="${EOrderShippingDestination.Inplace}" id="order-shipping-address_inplace" checked>
                    <label for="order-shipping-address_inplace" class="btn btn-f-width">${capitalizeString(EOrderShippingDestination.Inplace)}</label>

                    <input type="radio" name="order-shipping-address" value="${EOrderShippingDestination.Town}" id="order-shipping-address_town">
                    <label for="order-shipping-address_town" class="btn btn-f-width">Envio ${EOrderShippingDestination.Town}</label>

                    <input type="radio" name="order-shipping-address" value="${EOrderShippingDestination.Province}" id="order-shipping-address_province">
                    <label for="order-shipping-address_province" class="btn btn-f-width">Envio ${EOrderShippingDestination.Province}</label>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-order-step-4_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-order-step-4_form" data-previous-step_btn="create-order-step-3_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Quién deseas que compre tu artículo?</h3>
                    <p>Escoge a una de las opciones.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <input type="radio" name="order-shopper" value="${EOrderShoppers.Myself}" id="order-shopper_myself">
                    <label for="order-shopper_myself" class="btn btn-f-width">${capitalizeString(EOrderShoppers.Myself)}</label>

                    <input type="radio" name="order-shopper" value="${EOrderShoppers.Business}" id="order-shopper_business" checked>
                    <label for="order-shopper_business" class="btn btn-f-width">${capitalizeString(EOrderShoppers.Business)}</label>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-order-confirmation-step-5_form">
            <main>
                <div class="card-3">
                    <picture>
                        <img src="/img/illustrations/buyer-confirmation.svg" width="158">
                    </picture>
                    <div class="h-heading">
                        <h3>Pedido<br>creado con éxito.</h3>
                    </div>
                </div>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Listo</button>
            </footer>
        </form>
    </nav>
`