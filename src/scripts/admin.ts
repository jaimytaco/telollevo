import '../styles/admin/root-admin.css'
import '../styles/admin/font.css'
import '../styles/admin/global-admin.css'
import '../styles/admin/button.css'
import '../styles/admin/table.css'
import '../styles/admin/cards.css'
import '../styles/admin/dialog.css'
import '../styles/admin/form.css'
import '../styles/admin/split-button.css'

import '../styles/admin/admin.css'

const handleDialog = (id, action) => {
    const body = document.body
    const dialog = document.getElementById(id)
    if (!dialog) throw 'dialog not found'
    
    body.classList[action]('on-dialog')
    dialog.classList[action]('active')
}

const initDialog = (id) => {
    const closeBtns = [...document.querySelectorAll('[data-close-dialog]')]
    closeBtns.forEach((btn) => btn.onclick = () => {
        const id = btn.getAttribute('data-close-dialog')
        handleDialog(id, 'remove')
    })

    const stepBackBtns = [...document.querySelectorAll(['[data-previous-step]'])]
    stepBackBtns.forEach((btn) => btn.onclick = () => {
        const currentFormId = btn.getAttribute('data-current-step')
        if (!currentFormId) throw 'data-current-step not found'
        const currentForm = document.getElementById(currentFormId)
        if (!currentForm) throw 'data-current-step form not found'

        const previousFormId = btn.getAttribute('data-previous-step')
        if (!previousFormId) throw 'data-previous-step not found'
        const previousForm = document.getElementById(previousFormId)
        if (!previousForm) throw 'data-previous-step form not found'

        currentForm.classList.remove('active')
        previousForm.classList.add('active')
    })
}

const registerOrder = () => {
    const btn = document.getElementById('register-order_btn')
    if (!btn) throw 'register-order_btn not found'
    const formStep1 = document.getElementById('register-order-step-1_form')
    if (!formStep1) throw 'register-order-step-1_form not found'
    const formStep2 = document.getElementById('register-order-step-2_form')
    if (!formStep2) throw 'register-order-step-2_form not found'
    const formStep3 = document.getElementById('register-order-step-3_form')
    if (!formStep3) throw 'register-order-step-3_form not found'
    const formStep4 = document.getElementById('register-order-step-4_form')
    if (!formStep4) throw 'register-order-step-4_form not found'
    const formStep5 = document.getElementById('register-order-step-5_form')
    if (!formStep5) throw 'register-order-step-5_form not found'

    btn.onclick = () => {
        handleDialog('register-order_dialog', 'add')
        formStep1.classList.add('active')
    }

    formStep1.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-1 submit logic

        formStep1.classList.remove('active')
        formStep2.classList.add('active')
    }

    formStep2.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-2 submit logic

        formStep2.classList.remove('active')
        formStep3.classList.add('active')
    }

    formStep3.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-3 submit logic

        formStep3.classList.remove('active')
        formStep4.classList.add('active')
    }

    formStep4.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-4 submit logic

        formStep4.classList.remove('active')
        formStep5.classList.add('active')
    }
}

const initTableExtra = () => {
    const showTableBtns = [...document.querySelectorAll('[data-show-table-extra]')]
    showTableBtns.forEach((btn) => {
        btn.onclick = () => {
            const id = btn.getAttribute('data-show-table-extra')
            if (!id) throw 'table-extra id not found'
            const extra = document.getElementById(id)
            if (!extra) throw 'table-extra not found'

            const btns = [...document.querySelectorAll(`[data-show-table-extra="${id}"]`)]
            btns.forEach((b) => {
                const content = b.getAttribute(`data-show-table-extra-${extra.matches('.active') ? 'open' : 'close'}`)
                if (content) b.textContent = content
                b.classList.toggle('active')
            })

            extra.classList.toggle('active')
        }
    })
}

const initTable = () => {
    initTableExtra()
}

const initCard8 = () => {
    const btns = [...document.querySelectorAll('[data-c-8]')]
    btns.forEach((btn) => {
        btn.onclick = () => btn.parentNode.classList.toggle('active')
    })
}

const render = () => {
    initDialog()
    initTable()
    initCard8()

    registerOrder()
}

render()
