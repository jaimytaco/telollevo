// import { isBrowser, getWorkerPath } from '../helpers/browser.helper'
// import WSW from '../workers/sw.worker?worker'

// Taken from https://stackoverflow.com/questions/37573482/to-check-if-serviceworker-is-in-waiting-state
const registerSW = async () => {
    const { DEV } = import.meta.env
    if (DEV) return

    const { isBrowser, getWorkerPath } = await import('../helpers/browser.helper')
    if (!isBrowser()) return
    if (!navigator.serviceWorker) return

    
    const WSW = (await import('../workers/sw.worker?worker')).default

    console.log('WSW =', WSW)
    console.log('getWorkerPath(WSW.toString()) =', getWorkerPath(WSW.toString()))

    try {
        const registration = await navigator.serviceWorker.register(
            getWorkerPath(WSW.toString()),
            {
                scope: '/',
                type: 'module',
            }
        )

        console.log('registration!!')

        if (registration.waiting && registration.active) {
            // The page has been loaded when there's already a waiting and active SW.
            // This would happen if skipWaiting() isn't being called, and there are
            // still old tabs open.
            console.log('Please close all tabs to get updates.')
        } else {
            // updatefound is also fired for the very first install. ¯\_(ツ)_/¯
            registration.addEventListener('updatefound', () => {
                registration.installing.addEventListener('statechange', async (e) => {
                    if (e.target.state === 'installed') {
                        if (registration.active) {
                            // If there's already an active SW, and skipWaiting() is not
                            // called in the SW, then the user needs to close all their
                            // tabs before they'll get updates.
                            console.log('Please close all tabs to get updates.')
                        } else {
                            // Otherwise, this newly installed SW will soon become the
                            // active SW. Rather than explicitly wait for that to happen,
                            // just show the initial "content is cached" message.
                            console.log('Content is cached for the first time!')

                            // Force control of SW in initial state
                            location.reload()
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