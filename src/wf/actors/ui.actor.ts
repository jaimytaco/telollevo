const getUIBuilder = (builders: T, viewId: string) => builders[viewId]?.builder

const getViewContent = async (lib: T, builders: T, viewId: string) => {
    const uiBuilderFn = getUIBuilder(builders, viewId)
    const content = uiBuilderFn ? await uiBuilderFn(lib) : null
    const err = !content ? 'view not found' : null
    return {
        content,
        err
    }
}

const getViewIdByPathname = (builders: T, pathname: string) => {
    const keys = Object.keys(builders)
    for (const key of keys) if (builders[key].pathname === pathname) return key
    return null
}

const getDynamicContent = ({ lib, builders, pathname, viewId }) => {
    if (!viewId) viewId = getViewIdByPathname(builders, pathname)
    return getViewContent(lib, builders, viewId)
    // try{
    //     return getViewContent(lib, builders, viewId)
    // }catch(err){
    //     return { err }
    // }
}

export const AUI = {
    getUIBuilder,
    getViewContent,
    getViewIdByPathname,
    getDynamicContent
}