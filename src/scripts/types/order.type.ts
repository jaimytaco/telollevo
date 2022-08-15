import { EShippingDestination } from '@types/util.type'
import { IQuotation } from '@types/quotation.type'

export enum EOrderFields{
    ProductName = 'product-name',
    ProductCategory = 'product-category',
    ProductUrl = 'product-link',
    ProductPrice = 'product-pu',
    ProductUnits = 'product-qty',
    ProductIsBoxIncluded = 'product-need-box'
}

export enum ESanitizeOrderErrors{
    ProductName = 'Debe indicar un nombre de producto',
    ProductCategory = 'Debe seleccionar una categoría existente',
    ProductUrl = 'Debe ingresar un url válido',
    ProductPrice = 'Debe ingresar un valor válido',
    ProductUnits = 'Debe ingresar un valor válido',
    ProductIsBoxIncluded = 'Debe indicar si el producto necesita caja o no',
    ProductCoin = 'Debe usar una moneda válida',
    Status = 'Debe usar un estado de orden válido'
}

export enum EOrderStatus{
    Registered = 'registrado',
    Quoted = 'cotizado',
    Payed = 'pagado',
    Assigned = 'con viajero asignado',
    WithPurchaseOrder = 'con orden de compra',
    WithTrackingCode = 'con código de seguimiento',
    ReadyToDeliver = 'listo para entrega',
    Delivered = 'entregado',
    Canceled = 'cancelado'
}

export enum EOrderShippers{
    Relative = 'un amigo, familiar u otro',
    Store = 'una tienda'
}

export enum EOrderShoppers{
    Myself = 'yo deseo comprarlo',
    Business = 'deseo que Te lo llevo lo compre por una comisión adicional'
}

export enum EOrderSorters{
    ByCreatedAt = 'Por fecha de registro',
    ByProduct = 'Por producto',
    ByCategory = 'Por categoría'
}

export interface IProduct{
    name: string,
    category: string,
    url: string,
    price: number,
    coin: string,
    isBoxIncluded: boolean,
    weightMore5kg: boolean,
    isTaller50cm: boolean,
    units: number,
    isOneUnitPerProduct: boolean
}

export interface IOrder{
    id: string,
    status: EOrderStatus,
    product: IProduct,
    shipper: EOrderShippers,
    shippingDestination: EShippingDestination,
    shopper: EOrderShoppers,
    comments: string,
    shopperId: string,
    travelerId: string,
    createdAt: Date,
    updatedAt: Date,

    quotations?: IQuotation[],
}