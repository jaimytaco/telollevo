import {
    isBrowser,
} from '@wf/helpers/browser.helper'

// Taken from https://stackoverflow.com/questions/37573482/to-check-if-serviceworker-is-in-waiting-state
export const registerSW = async (ui) => {
    const { DEV } = import.meta.env
    if (DEV) return

    if (!isBrowser()) return
    if (!navigator.serviceWorker) return

    const workerPath = '/sw.worker.js'
    // const WSW = (await import('@wf/workers/sw.worker?worker')).default
    // const workerPath = getWorkerPath(WSW.toString())

    try {
        const registration = await navigator.serviceWorker.register(
            workerPath,
            {
                scope: '/',
                type: 'module',
            }
        )

        // navigator.serviceWorker.addEventListener('message', ({ data }) => {
        //     console.log('--- data =', data)
            
        //     const message = data.msg

        //     if (message === 'START_PREFETCH'){
        //         const keys = Object.keys(ui)
        //         keys.map((key) => fetch(ui[key].pathname))
        //     }
        // })

        if (registration.waiting && registration.active) {
            // The page has been loaded when there's already a waiting and active SW.
            // This would happen if skipWaiting() isn't being called, and there are
            // still old tabs open.
            // console.info('Please close all tabs to get updates.')
        } else {
            // updatefound is also fired for the very first install. ¯\_(ツ)_/¯
            registration.addEventListener('updatefound', () => {
                registration.installing.addEventListener('statechange', async (e) => {
                    if (e.target.state === 'installed') {
                        if (registration.active) {
                            // If there's already an active SW, and skipWaiting() is not
                            // called in the SW, then the user needs to close all their
                            // tabs before they'll get updates.
                            // console.info('Please close all tabs to get updates.')
                        } else {
                            // Otherwise, this newly installed SW will soon become the
                            // active SW. Rather than explicitly wait for that to happen,
                            // just show the initial "content is cached" message.
                            // console.info('Content is cached for the first time!')

                            // // Force control of SW in initial state
                            // location.reload()
                        }
                    }
                })
            })
        }
    } catch (err) {
        // registration failed :(
        console.error('ServiceWorker registration failed: ', err)
    }
}

export const APWA = {
    registerSW
}