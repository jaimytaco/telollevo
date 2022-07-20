import { IFlight } from '@types/flight.type'

export enum EQuotationStatus{
    Registered = 'registrado',
    Selected = 'seleccionado'
}

export interface IQuotation{
    id: string,
    orderId: string,
    flightId: string,
    price: number,
    coin: string,
    status: EQuotationStatus,  
    createdAt: Date,

    flight?: IFlight,
    priceStr?: string
}
