import '../styles/global.css'
import { wf, registerWF } from './wf/lib'
// import { getConfig, publicHome } from './utils'

const init = async () => {
    console.time('online-db')
    console.time('local-db')

    const services = await Promise.all([
        import('./wf/services/firebase.service'),
        import('./wf/services/indexedDb.service')
    ])

    const OnlineDB = services[0].default
    const LocalDB = services[1].default

    const { APWA } = await import('./wf/actors/pwa.actor')
    
    const { getConfig, publicHome } = await import('./utils')

    const config = await getConfig(OnlineDB, LocalDB, APWA)
    await registerWF(config)

    const productsOnline = await wf.database.getAll('products', 'online')
    console.log('productsOnline =', productsOnline)

    const productsLocal = await wf.database.getAll('products', 'local')
    console.log('productsLocal =', productsLocal)
}

init()