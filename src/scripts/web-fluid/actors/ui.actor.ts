import { IViewFns, IViewContent } from '../interfaces/view.interface'
// import {
//     publicBlank,
//     publicIndex
// } from '../helpers/view.helper'

export class AUI{
    static getUIBuilder = (viewId: string): IViewContent | Promise<IViewContent> | undefined => {
        // return ({
        //     'public-blank': publicBlank,
        //     'public-index': publicIndex,
        // } as IViewFns)[viewId]
        return (globalThis.webfluid.renders as IViewFns)[viewId]
    }

    static getViewContent = async (viewId: string): IView => {
        const uiBuilderFn = this.getUIBuilder(viewId)
        const content = uiBuilderFn ? await uiBuilderFn() : null
        const err = !content ? 'view not found' : null

        return {
            content,
            err
        }
    }

    static getDynamicContent = ({ pathname, viewId }) => {
        if (!viewId) viewId = this.getViewIdByPathname(pathname)
        return this.getViewContent(viewId)
    }

    static getViewIdByPathname = (pathname: string): string | undefined => {
        return {
            '/blank': 'public-blank',
            '/': 'public-index',
        }[pathname]
    }
}