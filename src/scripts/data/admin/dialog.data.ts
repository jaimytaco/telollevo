import { EProductCategory } from '@types/product.type'
import { EOrderShippers, EOrderShoppers, EOrderFields } from '@types/order.type'
import { EShippingDestination, ECountry, ECoin, EOrderProductQty } from '@types/util.type'

import { capitalizeString } from '@helpers/util.helper'

import { EHousingType } from '@types/flight.type'


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
                    <label for="${EOrderFields.ProductUrl}">Link del producto</label>
                    <input type="text" placeholder="Ingresa el link del producto" id="${EOrderFields.ProductUrl}" required>
                </fieldset>
                <fieldset>
                    <label for="${EOrderFields.ProductName}">Nombre del producto</label>
                    <input type="text" placeholder="Ingresa el nombre del producto" id="${EOrderFields.ProductName}" required>
                </fieldset>
                <fieldset>
                    <label for="${EOrderFields.ProductCategory}">Categoría</label>
                    <input list="${EOrderFields.ProductCategory}" placeholder="Selecciona una categoría" required>
                    <datalist id="${EOrderFields.ProductCategory}">
                        ${
                            Object.values(EProductCategory)
                                .map((value) => `<option value="${value}"></option>`)
                                .join('')
                        }
                    </datalist>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="${EOrderFields.ProductPrice}">
                        Valor unitario
                        <br>
                        <small>(en ${ECoin.USD.code})</small>
                    </label>
                    <input type="number" placeholder="0.00" id="${EOrderFields.ProductPrice}" required>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="product-qty">
                        Cantidad
                        <br>
                        <small>(mínimo ${EOrderProductQty.Min} unidad)</small>
                    </label>
                    <input type="number" placeholder="0" id="product-qty" min=${EOrderProductQty.Min} required>
                </fieldset>
                <fieldset>
                    <legend>¿Necesitas la caja del producto?</legend>
                    <input type="radio" name="${EOrderFields.ProductIsBoxIncluded}" value="yes" id="${EOrderFields.ProductIsBoxIncluded}_yes" required>
                    <label for="${EOrderFields.ProductIsBoxIncluded}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductIsBoxIncluded}" value="no" id="${EOrderFields.ProductIsBoxIncluded}_no" checked required>
                    <label for="${EOrderFields.ProductIsBoxIncluded}_no" class="btn">No</label>
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
                    <input type="radio" name="${EOrderFields.ProductWeightMore5kg}" value="yes" id="${EOrderFields.ProductWeightMore5kg}_yes" required>
                    <label for="${EOrderFields.ProductWeightMore5kg}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductWeightMore5kg}" value="no" id="${EOrderFields.ProductWeightMore5kg}_no" checked required>
                    <label for="${EOrderFields.ProductWeightMore5kg}_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>
                        ¿Tu artículo mide más de 50 cm?
                        <br>
                        <small>(de alguno de sus lados)</small>
                    </legend>
                    <input type="radio" name="${EOrderFields.ProductIsTaller50cm}" value="yes" id="${EOrderFields.ProductIsTaller50cm}_yes" required>
                    <label for="${EOrderFields.ProductIsTaller50cm}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductIsTaller50cm}" value="no" id="${EOrderFields.ProductIsTaller50cm}_no" checked required>
                    <label for="${EOrderFields.ProductIsTaller50cm}_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>
                        ¿Alguno de los links contiene más de una unidad? <br>
                        <small>Por ejemplo packs, cajas o bolsas con varias unidades adentro.</small>
                    </legend>
                    <input type="radio" name="${EOrderFields.ProductIsOneUnitPerProduct}" value="yes" id="${EOrderFields.ProductIsOneUnitPerProduct}_yes" required>
                    <label for="${EOrderFields.ProductIsOneUnitPerProduct}_yes" class="btn">Sí</label>

                    <input type="radio" name="${EOrderFields.ProductIsOneUnitPerProduct}" value="no" id="${EOrderFields.ProductIsOneUnitPerProduct}_no" checked required>
                    <label for="${EOrderFields.ProductIsOneUnitPerProduct}_no" class="btn">No</label>
                </fieldset>
                <fieldset>
                    <legend>¿Quién enviará tus compras al alojamiento del viajero?</legend>
                    <input type="radio" name="${EOrderFields.Shipper}" value="${EOrderShippers.Relative}" id="${EOrderFields.Shipper}_relative" required>
                    <label for="${EOrderFields.Shipper}_relative" class="btn">${capitalizeString(EOrderShippers.Relative)}</label>

                    <input type="radio" name="${EOrderFields.Shipper}" value="${EOrderShippers.Store}" id="${EOrderFields.Shipper}_store" checked required>
                    <label for="${EOrderFields.Shipper}_store" class="btn">${capitalizeString(EOrderShippers.Store)}</label>
                </fieldset>
                <fieldset>
                    <label for="${EOrderFields.Comments}">Si deseas, puedes dejarle un comentario al viajero</label>
                    <textarea id="${EOrderFields.Comments}" placeholder="Ingresa un comentario para el viajero"></textarea>
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
                    <input type="radio" name="${EOrderFields.ShippingDestination}" value="${EShippingDestination.Inplace_Miraflores}" id="${EOrderFields.ShippingDestination}_inplace-miraflores" checked required>
                    <label for="${EOrderFields.ShippingDestination}_inplace-miraflores" class="btn btn-f-width">${capitalizeString(EShippingDestination.Inplace_Miraflores)}</label>

                    <input type="radio" name="${EOrderFields.ShippingDestination}" value="${EShippingDestination.Town}" id="${EOrderFields.ShippingDestination}_town" required>
                    <label for="${EOrderFields.ShippingDestination}_town" class="btn btn-f-width">Envio ${EShippingDestination.Town}</label>

                    <input type="radio" name="${EOrderFields.ShippingDestination}" value="${EShippingDestination.Province}" id="${EOrderFields.ShippingDestination}_province" required>
                    <label for="${EOrderFields.ShippingDestination}_province" class="btn btn-f-width">Envio ${EShippingDestination.Province}</label>
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
                    <input type="radio" name="${EOrderFields.Shopper}" value="${EOrderShoppers.Myself}" id="${EOrderFields.Shopper}_myself">
                    <label for="${EOrderFields.Shopper}_myself" class="btn btn-f-width">${capitalizeString(EOrderShoppers.Myself)}</label>

                    <input type="radio" name="${EOrderFields.Shopper}" value="${EOrderShoppers.Business}" id="${EOrderFields.Shopper}_business" checked>
                    <label for="${EOrderFields.Shopper}_business" class="btn btn-f-width">${capitalizeString(EOrderShoppers.Business)}</label>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <!-- TODO: Shopper authentication/register forms -->

        <form id="create-order-confirmation-step-5_form">
            <main>
                <div class="card-3">
                    <picture>
                        <img src="/img/illustrations/buyer-confirmation.svg" width="158">
                    </picture>
                    <div class="h-heading">
                        <h3>Pedido<br>registrado con éxito.</h3>
                    </div>
                </div>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Listo</button>
            </footer>
        </form>
    </nav>
`

export const createFlight_dialog = `
    <nav id="create-flight_dialog" class="n-dialog n-d-multistep">
        <form id="create-flight-step-1_form">
            <header>
                <button type="button" class="btn btn-xs-inline btn-xs-block" data-close-dialog_btn="create-flight_dialog">
                    <picture>
                        <img src="/img/icon/close.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Quieres registrar un vuelo?</h3>
                    <p>Primero indícanos las fechas de recepción de los productos para que el comprador lo tenga en cuenta al momento de elegirte.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <label for="receive-orders-since">¿Desde cuando puedes recibir productos?</label>
                    <input type="date" placeholder="DD/MM/AAAA" id="receive-orders-since">
                </fieldset>
                <fieldset>
                    <label for="receive-orders-until">¿Hasta cuando puedes recibir los productos?</label>
                    <input type="date" placeholder="DD/MM/AAAA" id="receive-orders-until">
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-flight-step-2_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-flight-step-2_form" data-previous-step_btn="create-flight-step-1_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>Ahora que ya conocemos tus fechas de recepción</h3>
                    <p>Indícanos las características de tu alojamiento para que el comprador sepa a donde enviar los productos.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <legend>Tipo de alojamiento</legend>
                    <input type="radio" name="housing-type" value="RentedApartment" id="housing-type_rented-apartment">
                    <label for="housing-type_rented-apartment" class="btn btn-h-width">${capitalizeString(EHousingType.RentedApartment)}</label>

                    <input type="radio" name="housing-type" value="Hotel" id="housing-type_hotel">
                    <label for="housing-type_hotel" class="btn btn-h-width">${capitalizeString(EHousingType.Hotel)}</label>

                    <input type="radio" name="housing-type" value="FriendsApartment" id="housing-type_friends-apartment">
                    <label for="housing-type_friends-apartment" class="btn btn-h-width">${capitalizeString(EHousingType.FriendsApartment)}</label>

                    <input type="radio" name="housing-type" value="Store" id="housing-type_store">
                    <label for="housing-type_store" class="btn btn-h-width">${capitalizeString(EHousingType.Store)}</label>

                    <input type="radio" name="housing-type" value="Home" id="housing-type_home">
                    <label for="housing-type_home" class="btn btn-h-width">${capitalizeString(EHousingType.Home)}</label>
                </fieldset>
                <fieldset>
                    <label for="address">Dirección</label>
                    <input type="text" id="address" placeholder="Ingresa una dirección">
                </fieldset>
                <fieldset>
                    <label for="address-more">
                        Departamento/piso/suite/edificio
                        <br>
                        <small>(opcional)</small>
                    </label>
                    <input type="text" id="address-more" placeholder="Ingresa un departamento/piso/suite/edificio">
                </fieldset>
                <fieldset>
                    <label for="district">Consuma/distrito/barrio/pueblo</label>
                    <input type="text" id="district" placeholder="Ingresa una consuma/distrito/barrio/pueblo">
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="country">País</label>
                    <input list="country" placeholder="Selecciona un país">
                    <datalist id="country">
                        ${
                            Object.values(ECountry)
                                .map((value) => `<option value="${value}"></option>`)
                                .join('')
                        }
                    </datalist>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="state">Estado/región</label>
                    <input list="state" placeholder="Selecciona un estado/región">
                    <datalist id="state">
                        <option value="Estado #1"></option>
                        <option value="Estado #2"></option>
                        <option value="Estado #3"></option>
                    </datalist>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="city">Ciudad</label>
                    <input list="city" placeholder="Selecciona una ciudad">
                    <datalist id="city">
                        <option value="Ciudad #1">Ciudad #1</option>
                        <option value="Ciudad #2">Ciudad #2</option>
                        <option value="Ciudad #3">Ciudad #3</option>
                    </datalist>
                </fieldset>
                <fieldset class="fs-sm">
                    <label for="zipcode">Código postal</label>
                    <input type="text" id="zipcode" placeholder="Ingresa un código postal">
                </fieldset>
                <fieldset>
                    <input type="checkbox" id="is-responsible-for">
                    <label for="is-responsible-for">
                        Yo soy responsable por los productos, por ende
                        cualquier inconveniente ocasionado por un error
                        en mis fechas, dirección y/o cambios o 
                        cancelaciones en mi itinerario son mi 
                        responsabilidad.
                    </label>
                </fieldset>
                <fieldset>
                    <input type="checkbox" id="are-receive-order-dates-ok">
                    <label for="are-receive-order-dates-ok">
                        Me comprometo a revisar muy bien las fechas     
                        que coloqué en el formulario, ya que cualquier 
                        error le generará problemas al comprador.
                    </label>
                </fieldset>

                <!-- TODO: add traveler's chores alert -->
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-flight-step-3_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-flight-step-3_form" data-previous-step_btn="create-flight-step-2_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Quién recibirá los productos en tu alojamiento?</h3>
                    <p>Indícanos sus datos.</p>
                </div>
            </header>
            <main>
                <fieldset>
                    <label for="receiver-name">Nombre de quién recibe los productos</label>
                    <input type="text" id="receiver-name" placeholder="Ingresa un nombre completo">
                </fieldset>
                <fieldset>
                    <label for="receiver-phone">Teléfono de quién recibe los productos</label>
                    <input type="text" id="receiver-phone" placeholder="Ingresa un teléfono">
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-flight-step-4_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-flight-step-4_form" data-previous-step_btn="create-flight-step-3_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>¿Cómo será la entrega?</h3>
                    <p>Una vez que llegues con los productos al país destino.</p>
                </div>
            </header>  
            <main>   
                <fieldset>
                    <label for="shipping-destination">¿En cuál de nuestros locales entregarás los productos?</label>
                    <input list="shipping-destination" placeholder="Selecciona un local">
                    <datalist id="shipping-destination">
                        <option value="${capitalizeString(EShippingDestination.Inplace_Miraflores)}"></option>
                    </datalist>
                </fieldset>
                <fieldset>
                    <label for="deliver-order-at">¿Qué día entregarás los productos al equipo de Te lo Llevo?</label>
                    <input type="date" placeholder="DD/MM/AAAA" id="deliver-order-at">
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <form id="create-flight-step-5_form">
            <header>
                <button class="btn btn-xs-inline btn-xs-block" type="button" data-current-step="create-flight-step-5_form" data-previous-step_btn="create-flight-step-4_form">
                    <picture>
                        <img src="/img/icon/arrow-left.svg" width="20" height="20">
                    </picture>
                </button>
                <div class="h-heading">
                    <h3>Información del viaje</h3>
                    <p>Ahora indícanos los datos de tu vuelo.</p>
                </div>
            </header>  
            <main>
                <fieldset>
                    <label for="code">Código de reserva del vuelo</label>
                    <input type="text" id="code" placeholder="Ingresa su código de reserva">
                </fieldset>
                <fieldset>
                    <label for="airline">Aerolínea</label>
                    <input type="text" id="airline" placeholder="Ingresa la aerolínea encargada de su vuelo">
                </fieldset>
                <fieldset>
                    <label for="from">País origen</label>
                    <input list="from" placeholder="Selecciona un país">
                    <datalist id="from">
                        ${
                            Object.values(ECountry)
                                .map((value) => `<option value="${value}"></option>`)
                                .join('')
                        }
                    </datalist>
                </fieldset>
                <fieldset>
                    <label for="to">País destino</label>
                    <input list="to" placeholder="Selecciona un país">
                    <datalist id="to">
                        ${
                            Object.values(ECountry)
                                .map((value) => `<option value="${value}"></option>`)
                                .join('')
                        }
                    </datalist>
                </fieldset>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Continuar</button>
            </footer>
        </form>

        <!-- TODO: Traveler authentication/register forms -->

        <form id="create-flight-confirmation-step-6_form">
            <main>
                <div class="card-3">
                    <picture>
                        <img src="/img/illustrations/buyer-confirmation.svg" width="158">
                    </picture>
                    <div class="h-heading">
                        <h3>Vuelo<br>registrado con éxito.</h3>
                    </div>
                </div>
            </main>
            <footer>
                <button class="btn btn-primary btn-submit" type="submit">Listo</button>
            </footer>
        </form>
    </nav>
`