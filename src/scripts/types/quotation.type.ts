import { IFlight } from '@types/flight.type'
import { IUser } from '@types/user.type'

export enum EQuotationComissionPercentage{
    Myself = 0,
    Business = .1,
}

export enum EQuotationStatus{
    Registered = 'registrado',
    // Selected = 'seleccionado', // TODO: If it is neccesary
    Paid = 'pagado',
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
    traveler?: IUser,
    // priceStr?: string

    payment?: T
}
