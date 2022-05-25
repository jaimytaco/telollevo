import '../styles/global.css'
import '../styles/button.css'
import '../styles/header.css'
import '../styles/main.css'
import '../styles/section.css'
import '../styles/footer.css'
import '../styles/card.css'



// const init = async () => {
//     console.log('-------------------------------\n\ninit()')
//     const {
//         models,
//         loaders,
//         ui,
//         getMainTag
//     } = await import('./config')

//     const {
//         // getCacheName ,
//         SW_VERSION
//     } = await import('./wf/workers/sw.worker')

//     const {
//         registerSW
//     } = await import('./wf/actors/pwa.actor')

//     // const {
//     //     wf,
//     //     registerNetworkDB,
//     //     registerOfflineDB,
//     //     updateOfflineDB,
//     //     registerModels,
//     //     isDynamicPathname,

//     //     cacheFromUI,
//     //     updateView
//     // } = await import('./wf/lib.ts')

//     // const networkDB = (await import('./wf/services/firebase.service')).default
//     // const offlineDB = (await import('./wf/services/indexedDb.service')).default

//     // await registerNetworkDB(networkDB)   
//     // await registerOfflineDB(networkDB, offlineDB)

//     // await updateOfflineDB(models, loaders)

//     // if (isDynamicPathname({ ui, url: location })) await updateView(getMainTag(), location.pathname)

//     // if (navigator.serviceWorker){
//     //     await cacheFromUI(ui, getCacheName())
//     // }

//     registerSW()

//     // registerModels(models)
//     // globalThis.wf = wf
//     // console.log('w.models =', wf.models)

//     // const productsOnline = await wf.database.getAll('products', 'online')
//     // console.log('productsOnline =', productsOnline)

//     // const productsLocal = await wf.database.getAll('products', 'local')
//     // console.log('productsLocal =', productsLocal)

//     const {
//         registerNetworkDB,
//         registerOfflineDB,
//         updateOfflineDB,
//         wf
//     } = await import('./wf/lib.worker')

//     const networkDB = (await import('./wf/services/firebase.service')).default
//     const offlineDB = (await import('./wf/services/indexedDb.service')).default

//     await registerNetworkDB(networkDB)
//     await registerOfflineDB(offlineDB)

//     // await updateOfflineDB(models, loaders)

//     console.log('wf =', wf)

//     const filters = [
//         // {
//         //     field: 'count',
//         //     operator: wf.operator.GreaterThan,
//         //     value: 1
//         // },
//         // {
//         //     field: 'count',
//         //     operator: wf.operator.GreaterThan,
//         //     value: 0
//         // },
//         // {
//         //     field: 'updatedAt',
//         //     operator: wf.operator.LessThan,
//         //     value: new Date()
//         // },
//         {
//             field: 'updatedAt',
//             operator: wf.operator.GreaterThanOrEqualTo,
//             value: new Date('2022-05-24T00:00:00')
//         }
//     ]

//     // const filters = null

//     const { data, err } = await wf.database.getAll(wf.mode.Network, 'products', filters)
//     console.log('data =', data)

//     // const docsLocal = await wf.database.getAll(wf.mode.Offline, 'products', filters)
//     // console.log('docsLocal =', docsLocal)

//     const btn = document.querySelector('.c-5-bg-1 .c-actions a')
//     if (btn) {
//         btn.onclick = async (e) => {
//             e.preventDefault()
            
//             // const date = new Date()
//             // const { data, err } = await wf.database.add(wf.mode.Network, 'products', {
//             //     updatedAt: date,
//             //     str: date.toISOString(),
//             //     value: 'data-added'
//             // })
//             // console.log('data =', data)
//             // console.log('err =', err)


//             // const date = new Date()
//             // const { data, err } = await wf.database.update(wf.mode.Network, 'products', {
//             //     id: 'jeje',
//             //     updatedAt: date,
//             //     str: date.toISOString(),
//             //     value: 'data-added'
//             // })
//             // console.log('data =', data)
//             // console.log('err =', err)


//             // const { data, err } = await wf.database.getAll(wf.mode.Network, 'products', filters)
//             // console.log('data =', data)
//             // console.log('err =', err)


//             // const { data, err } = await wf.database.get(wf.mode.Network, 'products', 'jeje')
//             // console.log('data =', data)
//             // console.log('err =', err)
//         }
//     }
// }

// init()
