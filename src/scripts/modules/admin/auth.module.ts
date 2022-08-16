import {
    getDOMElement, 
    delay, 
} from '@helpers/util.helper'

const configSignIn = async (wf) => {
    const loginForm = getDOMElement(document, '#login-form')
    if (loginForm)
        loginForm.onsubmit = async (e) => {
            e.preventDefault()
            const emailInput = getDOMElement(loginForm, '#login-email')
            const passwordInput = getDOMElement(loginForm, '#login-password')
            if (!emailInput || !passwordInput) return

            const userCredential = await wf.auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
            
            // TODO: UI animations according to userCredential

            // TODO: redirect to admin page?
            await delay(1500)
            location.href = '/admin/orders'
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