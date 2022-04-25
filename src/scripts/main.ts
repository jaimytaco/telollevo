import '../styles/global.css'

import { WebFluid } from '../scripts/web-fluid/webfluid'

import { publicBlank, publicIndex } from '../scripts/renders'
import { MProduct } from '../scripts/models'
import { EDatabaseMode } from '../scripts/web-fluid/enums/database.enum'


const init = async () => {
    const models = {
        products: MProduct
    }

    const loaders = ['products']

    const renders = {
        '/': publicIndex,
        '/blank': publicBlank
    }
    
    await WebFluid.init(models, loaders, renders)

    console.log(globalThis.webfluid.models['products'].getAll)
    
    const productsOnline = await globalThis.webfluid.models['products'].getAll('products', EDatabaseMode.Online)
    console.log('productsOnline =', productsOnline)

    // const productsLocal = await globalThis.webfluid.models['products'].getAll(EDatabaseMode.Local)
    // console.log('productsLocal =', productsLocal)
}

init()