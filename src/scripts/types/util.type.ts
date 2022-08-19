export enum EOrderProductQty{
    Min = 1,
}

export enum ECoin{
    PEN = {
        name: 'soles',
        symbol: 'S/',
        code: 'PEN',
    },
    USD = {
        name: 'dólares',
        symbol: '$',
        code: 'USD',
    }
}

export enum EShippingDestination{
    Inplace_Miraflores = 'en el local de Te lo llevo en Miraflores (Av. Aramburú 480, Piso 2 - Lima)',
    Town = 'dentro de Lima',
    Province = 'a provincia'
}

export enum ECountry{
    Peru = 'Peru',
    Ecuador = 'Ecuador',
    Colombia = 'Colombia',
}

export enum EFormat{
    Raw = 'raw',
    Related = 'related',
    Pretty = 'pretty'
}

export enum EMenu{
    Orders = {
        page: 'orders',
        icon: 'packages.svg',
        name: 'pedido',
    },
    Flights = {
        page: 'flights',
        icon: 'airplane.svg',
        name: 'vuelo',
    }
}