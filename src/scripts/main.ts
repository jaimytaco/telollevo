import '../styles/global.css'

const init = async () => {
    const {
        models,
        loaders
    } = await import('./utils')

    const {
        registerSW
    } = await import('./wf/actors/pwa.actor')

    const {
        wf,
        registerNetworkDB,
        registerOfflineDB,
        updateOfflineDB,
        registerModels,
        getHTML,
        isDynamicPathname,
        isViewUpdatable // TODO
    } = await import('./wf/lib.ts')

    const networkDB = (await import('./wf/services/firebase.service')).default
    const offlineDB = (await import('./wf/services/indexedDb.service')).default

    await registerNetworkDB(networkDB)    
    await registerOfflineDB(networkDB, offlineDB)

    await updateOfflineDB(models, loaders)

    registerSW()
    registerModels(models)

    const { pathname } = location

    // // TODO: rewrite body only
    // if (isDynamicPathname(pathname)) {
    //     const { html, lastUpdate, err } = await getHTML({ pathname })
    //     if (!err) isViewUpdatable(lastUpdate) ? document.body.innerHTML = html : null
    // }

    const productsOnline = await wf.database.getAll('products', 'online')
    console.log('productsOnline =', productsOnline)

    const productsLocal = await wf.database.getAll('products', 'local')
    console.log('productsLocal =', productsLocal)
}

init()
