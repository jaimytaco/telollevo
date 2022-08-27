import {
    getDOMElement,
    delay,
} from '@helpers/util.helper'

import { logger } from '@wf/helpers/browser.helper'

import { EUserType } from '@types/user.type'
import MUser from '@models/user.model'

import { EFormat } from '@types/util.type'

const getUserCredentials = (wf) => {
    if (!wf) return { err: 'wf not working' }
    if (!wf.auth) return { err: 'wf.auth not working' }
    if (!wf.auth.getCurrentUser) return { err: 'wf.auth.getCurrentUser not working' }
    return wf.auth.getCurrentUser()
}

const getUserAuthenticated = async (wf) => {
    const userCredentials = await getUserCredentials(wf)
    if (userCredentials?.err) return userCredentials
    logger(`Verifing user authentication:${userCredentials ? '' : ' None'}`, userCredentials)
    return userCredentials ? await MUser.get(wf, wf.mode.Offline, userCredentials.uid) : null
}

const configSignIn = async (wf) => {
    const { default: CForm } = await import('@components/form.component')

    const loginForm = getDOMElement(document, '#login-form')
    if (!loginForm) return
    const btnSubmit = getDOMElement(loginForm, '[type="submit"]')
    if (!btnSubmit) return

    const onSubmit = async (e) => {
        e.preventDefault()
        const emailInput = getDOMElement(loginForm, '#login-email')
        const passwordInput = getDOMElement(loginForm, '#login-password')
        if (!emailInput || !passwordInput) return

        const userCredential = await wf.auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
        if (userCredential?.err) {
            logger(userCredential.err)
            // TODO: undo UI animation
            return
        }

        const user = await MUser.get(wf, wf.mode.Network, userCredential.user.uid, EFormat.Raw)

        // TODO: UI animations 

        await delay(1500)

        if ([EUserType.Admin, EUserType.Shopper, EUserType.Multiple].includes(user.type)) location.href = '/admin/orders'
        if (user.type === EUserType.Traveler) location.href = '/admin/flights'
    } 
    
    CForm.init(loginForm.id, onSubmit)

    // btnSubmit.onclick = (e) => {
    //     e.preventDefault()
    //     CForm.validateBeforeSubmit(loginForm)
    // }

    // loginForm.onsubmit = async (e) => {
    //     e.preventDefault()
    //     const emailInput = getDOMElement(loginForm, '#login-email')
    //     const passwordInput = getDOMElement(loginForm, '#login-password')
    //     if (!emailInput || !passwordInput) return

    //     const userCredential = await wf.auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    //     if (userCredential?.err) {
    //         logger(userCredential.err)
    //         // TODO: undo UI animation
    //         return
    //     }

    //     const user = await MUser.get(wf, wf.mode.Network, userCredential.user.uid, EFormat.Raw)

    //     // TODO: UI animations 

    //     await delay(1500)

    //     if ([EUserType.Admin, EUserType.Shopper, EUserType.Multiple].includes(user.type)) location.href = '/admin/orders'
    //     if (user.type === EUserType.Traveler) location.href = '/admin/flights'
    // }    
}

const configSignOut = async (wf) => {
    const signOutBtn = getDOMElement(document, '[data-sign-out_btn]')
    if (signOutBtn)
        signOutBtn.onclick = async (e) => {
            e.preventDefault()
            await wf.auth.signOut()

            // TODO: sign-out animation
            await delay(1500)
            location.reload()
        }
}

export default {
    configSignIn,
    configSignOut,
    getUserCredentials,
    getUserAuthenticated,
}