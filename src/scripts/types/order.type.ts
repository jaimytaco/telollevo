import { EShippingDestination } from '@types/util.type'
import { IQuotation } from '@types/quotation.type'

export enum EOrderStatus{
    Registered = 'registrado',
    Quoted = 'cotizado',
    Payed = 'pagado',
    WithPurchaseOrder = 'con orden de compra',
    WithTrackingCode = 'con código de seguimiento',
    ReadyToDeliver = 'listo para entrega',
    Delivered = 'entregado'
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
    buyerId: string,
    flightIds: string[],

    quotations?: IQuotation[],
}