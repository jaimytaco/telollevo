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
    updatedAt: Date,
    
    shopperId: string,
    travelerId: string,

    flight?: IFlight,
    priceStr?: string
}
