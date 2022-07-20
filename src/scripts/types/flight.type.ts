import { ECountry, EShippingDestination } from '@types/util.type'

export enum EHousingType{
    RentedApartment = 'departamento o casa arrendada',
    Hotel = 'hotel',
    FriendsApartment = 'departamento o casa de un amigo',
    Store = 'bodega',
    Home = 'departamento/casa donde vivo'
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
    addressDetail: string,
    place: IPlace,
    hotelName?: string
}

export interface IReceiver{
    name: string,
    phone: string
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
    code: string,
    airline: string,
    orderIds: string[]
}