import { ECountry, EShippingDestination } from '@types/util.type'
import { IQuotation } from '@types/quotation.type'

export enum EHousingType{
    RentedApartment = 'departamento o casa arrendada',
    Hotel = 'hotel',
    FriendsApartment = 'departamento o casa de un amigo',
    Store = 'bodega',
    Home = 'departamento o casa donde vivo'
}

export enum EHousingFields{
    Type = 'housing-type',
    Address = 'address',
    AddressMore = 'address-more',
}

export enum ESanitizeHousingErrors{
    Type = 'Debe indicar un tipo de alojamiento válido',
    Address = 'Debe indicar una dirección',
}

export enum EPlaceFields{
    District = 'district',
    Country = 'country',
    State = 'state',
    City = 'city',
    Zipcode = 'zipcode'
}

export enum ESanitizePlaceErrors{
    District = 'Debe indicar un distrito',
    Country = 'Debe indicar un país válido',
    State = 'Debe indicar un estado/región válido',
    City = 'Debe indicar una ciudad válida',
    Zipcode = 'Debe indicar un zipcode',
}

export interface IPlace{
    district: string,
    country: ECountry,
    state: string,
    city: string,
    zipcode: string
}

export interface IHousing{
    type: EHousingType,
    address: string,
    addressMore: string,
    place: IPlace,
    // hotelName?: string
}

export enum EReceiverFields{
    Name = 'receiver-name',
    Phone = 'receiver-phone'
}

export enum ESanitizeReceiverErrors{
    Name = 'Debe indicar el nombre del receptor',
    Phone = 'Debe indicar el teléfono del receptor'
}

export interface IReceiver{
    name: string,
    phone: string
}

export enum EFlightFields{
    ReceiveOrdersSince = 'receive-orders-since',
    ReceiveOrdersUntil = 'receive-orders-until',
    IsResponsibleFor = 'is-responsible-for',
    AreReceiveOrderDatesOk = 'are-receive-order-dates-ok',
    ShippingDestination = 'shipping-destination',
    DeliverOrderAt = 'deliver-order-at',
    ConfirmDeliverOrder48h = 'confirm-deliver-order-48h',
    Code = 'code',
    Airline = 'airline',
    From = 'from',
    To = 'to',
}

export enum ESanitizeFlightErrors{
    TravelerId = 'Usuario no autenticado',
    ReceiveOrdersSince = 'Debe indicar una fecha válida',
    ReceiveOrdersUntil = 'Debe indicar una fecha válida',
    ReceiveOrdersUntilLower = 'La fecha debe ser mayor a la anterior',
    IsResponsibleFor = 'Debe indicar que el viajero se hace responsable de los productos',
    AreReceiveOrderDatesOk = 'Debe indicar que el viajero se compromete a revisar bien las fechas registradas',
    ShippingDestination = 'Debe indicar un punto de entrega válido',
    DeliverOrderAt = 'Debe indicar una fecha válida',
    ConfirmDeliverOrder48h = 'Debe confirmar si el pedido será entregado, como máximo, 48 horas después de llegar al destino',
    Code = 'Debe indicar el código de vuelo',
    Airline = 'Debe indicar la aerolínea de vuelo',
    From = 'Debe indicar un país origen válido',
    To = 'Debe indicar un país destino válido',
}

export enum EFlightStatus{
    Registered = 'registrado',
    Visible = 'visible',
}

export interface IFlight{
    id: string,
    status: EFlightStatus,
    receiveOrdersSince: Date,
    receiveOrdersUntil: Date,
    housing: IHousing,
    isResponsibleFor: boolean,
    areReceiveOrderDatesOk: boolean,
    receiver: IReceiver,
    shippingDestination: EShippingDestination,
    deliverOrderAt: Date,
    confirmDeliverOrder48h: boolean,
    code: string,
    airline: string,
    from: ECountry,
    to: ECountry,
    travelerId: string,
    createdAt: Date,
    updatedAt: Date,

    quotations?: IQuotation[],
    orderIds?: string[],
}