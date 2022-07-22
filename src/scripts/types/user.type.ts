export enum EUserType{
    Buyer = 'comprador',
    Traveler = 'viajero',
    Admin = 'admin'
}

export interface IUser{
    id: string,
    email: string,
    name: string,
    lastname: string,
    type: string
}

export interface IShopper extends IUser{
    orderIds: string[]
}

export interface ITraveler extends IUser{
    flightIds: string[]
}