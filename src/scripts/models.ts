export interface IMProduct {
    id: string
    code: string
    slug: string
}

export class MProduct implements IMProduct{
    collection = 'products'
    id: string
    code: string
    slug: string
}