// import '../styles/admin.css'
import '../styles/new-admin.css'

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
}

const render = () => {
    initDialog()

    registerOrder()
}

render()
