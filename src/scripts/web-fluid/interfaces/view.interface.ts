import { IError } from '../interfaces/error.interface'

export interface IViewContentHead {
    title: string,
    meta: string
}

export interface IViewContent {
    head: IViewContentHead,
    body: string
}

export interface IView extends IError {
    content: IViewContent
}

export interface IViewFns {
    'public-blank': IViewContent
    'public-index': IViewContent
}