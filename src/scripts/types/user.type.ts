export enum EUserType{
    Shopper = 'comprador',
    Traveler = 'viajero',
    Admin = 'admin',
    Multiple = 'viajero / comprador',
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