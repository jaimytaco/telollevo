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

export const AUI = {
    getUIBuilder,
    getViewContent,
}