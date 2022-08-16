import {
    getDOMElement, 
    delay, 
} from '@helpers/util.helper'

import { logger } from '@wf/helpers/browser.helper'

import { EUserType } from '@types/user.type'
import MUser from '@models/user.model'

import { EFormat } from '@types/util.type'


const configSignIn = async (wf) => {
    const loginForm = getDOMElement(document, '#login-form')
    if (loginForm)
        loginForm.onsubmit = async (e) => {
            e.preventDefault()
            const emailInput = getDOMElement(loginForm, '#login-email')
            const passwordInput = getDOMElement(loginForm, '#login-password')
            if (!emailInput || !passwordInput) return

            const userCredential = await wf.auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
            console.log('--- userCredential =', userCredential)
            if (userCredential?.err){
                logger(userCredential.err)
                // TODO: undo UI animation
                return
            }

            const user = await MUser.get(wf, wf.mode.Network, userCredential.user.uid, EFormat.Raw)

            // TODO: UI animations 

            await delay(1500)

            if (user.type === EUserType.Shopper) location.href = '/admin/orders'
            if (user.type === EUserType.Traveler) location.href = '/admin/flights'
        }  
}

const configSignOut = async (wf) => {
    const { getDOMElement } = await import('@helpers/util.helper')
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
}