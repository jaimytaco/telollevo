import '../styles/global.css'
import { wf, registerWF } from './wf/lib'

interface IMProduct {
    id: string
    code: string
    slug: string
}

class MProduct implements IMProduct {
    id: string
    code: string
    slug: string
}

const init = async () => {
    const OnlineDB = (await import('./wf/services/firebase.service')).default
    const LocalDB = (await import('./wf/services/indexedDb.service')).default

    await registerWF({
        products: MProduct
    }, ['products'], OnlineDB, LocalDB)

    const productsOnline = await wf.database.getAll('products', 'online')
    console.log('productsOnline =', productsOnline)

    const productsLocal = await wf.database.getAll('products', 'local')
    console.log('productsLocal =', productsLocal)
}

init()