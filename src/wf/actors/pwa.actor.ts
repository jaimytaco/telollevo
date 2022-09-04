import {
    isBrowser,
    logger,
    subscribeToServiceWorkerMessage,
    getServiceWorkerState,
    supportsServiceWorker,
    delay,
} from '@wf/helpers/browser.helper'

import {
    ESWStatus,
} from '@helpers/sw.helper'


export const supportsSW = supportsServiceWorker

export const getSWState = getServiceWorkerState

export const subscribeToSWMessage = subscribeToServiceWorkerMessage

// Taken from https://stackoverflow.com/questions/37573482/to-check-if-serviceworker-is-in-waiting-state
export const registerSW = async () => {
    const { DEV } = import.meta.env
    if (DEV) return

    if (!isBrowser()) return
    if (!navigator.serviceWorker) return

    const workerPath = '/sw.worker.js'
    try {
        const registration = await navigator.serviceWorker.register(
            workerPath,
            {
                scope: '/',
                type: 'module',
            }
        )

        subscribeToSWMessage(async (msg) => {
            if (msg === ESWStatus.Unregister) {
                if (!registration) return
                logger('Unregistering ServiceWorker')
                await registration.unregister()
                logger('ServiceWorker unregistered successfully')
                location.reload()
            } 
        })

        if (registration.waiting && registration.active) {
            // The page has been loaded when there's already a waiting and active SW.
            // This would happen if skipWaiting() isn't being called, and there are
            // still old tabs open.
            // console.info('Please close all tabs to get updates.')
            logger('Please close all tabs to get updates. [1]')

            subscribeToSWMessage(async (msg) => {
                if (msg === ESWStatus.Claimed) {
                    logger('SW claimed tabs [1]')
                    document.body.classList.add('data-pwa-update')
                }
            })
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
                            logger('Please close all tabs to get updates. [2]')

                            subscribeToSWMessage(async (msg) => {
                                if (msg === ESWStatus.Claimed) {
                                    logger('SW claimed tabs [2]')
                                    document.body.classList.add('data-pwa-update')
                                }
                            })
                        } else {
                            // Otherwise, this newly installed SW will soon become the
                            // active SW. Rather than explicitly wait for that to happen,
                            // just show the initial "content is cached" message.
                            // console.info('Content is cached for the first time!')
                            logger('Content is cached for the first time! [3]')

                            subscribeToSWMessage(async (msg) => {
                                if (msg === ESWStatus.ContentReady) {
                                    logger('SW content ready [3]')
                                    location.reload()
                                }
                            })
                        }
                    }
                })
            })
        }

        return registration
    } catch (err) {
        // registration failed :(
        return { err }
    }
}