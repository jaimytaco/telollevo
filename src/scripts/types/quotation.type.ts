import { ECoin } from '@types/util.type'


export enum EQuotationStatus{
    Registered = 'registrado',
    Selected = 'seleccionado'
}

export interface IQuotation{
    id: string,
    price: number,
    coin: ECoin,
    status: EQuotationStatus,  
    createdAt: Date 
}
