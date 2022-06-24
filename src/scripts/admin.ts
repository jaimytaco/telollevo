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
    const closeBtns = [...document.querySelectorAll('[data-close-dialog_btn]')]
    closeBtns.forEach((btn) => btn.onclick = () => {
        const id = btn.getAttribute('data-close-dialog_btn')
        handleDialog(id, 'remove')
    })

    const stepBackBtns = [...document.querySelectorAll(['[data-previous-step_btn]'])]
    stepBackBtns.forEach((btn) => btn.onclick = () => {
        const currentFormId = btn.getAttribute('data-current-step')
        if (!currentFormId) throw 'data-current-step not found'
        const currentForm = document.getElementById(currentFormId)
        if (!currentForm) throw 'data-current-step form not found'

        const previousFormId = btn.getAttribute('data-previous-step_btn')
        if (!previousFormId) throw 'data-previous-step_btn not found'
        const previousForm = document.getElementById(previousFormId)
        if (!previousForm) throw 'data-previous-step_btn form not found'

        currentForm.classList.remove('active')
        previousForm.classList.add('active')
    })
}

const registerOrder = () => {
    const btn = document.getElementById('create-order_btn')
    if (!btn) throw 'create-order_btn not found'
    const formStep1 = document.getElementById('create-order-step-1_form')
    if (!formStep1) throw 'create-order-step-1_form not found'
    const formStep2 = document.getElementById('create-order-step-2_form')
    if (!formStep2) throw 'create-order-step-2_form not found'
    const formStep3 = document.getElementById('create-order-step-3_form')
    if (!formStep3) throw 'create-order-step-3_form not found'
    const formStep4 = document.getElementById('create-order-step-4_form')
    if (!formStep4) throw 'create-order-step-4_form not found'
    const formStep5 = document.getElementById('create-order-confirmation-step-5_form')
    if (!formStep5) throw 'create-order-confirmation-step-5_form not found'

    btn.onclick = () => {
        handleDialog('create-order_dialog', 'add')
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
    const showTableBtns = [...document.querySelectorAll('[data-show-table-extra_id]')]
    showTableBtns.forEach((btn) => {
        btn.onclick = () => {
            const id = btn.getAttribute('data-show-table-extra_id')
            if (!id) throw 'data-show-table-extra_id not found'
            const extra = document.getElementById(id)
            if (!extra) throw 'data-show-table-extra_id item not found'

            const btns = [...document.querySelectorAll(`[data-show-table-extra_id="${id}"]`)]
            btns.forEach((b) => {
                const content = b.getAttribute(`data-show-table-extra_id-${extra.matches('.active') ? 'open' : 'close'}`)
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
    const btns = [...document.querySelectorAll('[data-c-8_btn]')]
    btns.forEach((btn) => {
        btn.onclick = () => btn.parentNode.classList.toggle('active')
    })
}

const configCreateSaleDialog = (dialogId, currentSales) => {
    const dialog = document.querySelector(`#${dialogId}`)
    if (!dialog) throw `${dialogId} not found`

    const btn = document.getElementById('cart_btn')
    if (!btn) throw 'cart_btn not found'

    btn.onclick = () => {
        !currentSales.length ?
            (() => {
                handleDialog(dialogId, 'add')
                formStep1.classList.add('active')
            })() : null
    }

    const formStep1 = dialog.querySelector('#create-sale-step-1_form')
    if (!formStep1) throw 'create-sale-step-1_form not found'
    const formStep2 = dialog.querySelector('#create-sale-step-2_form')
    if (!formStep2) throw 'create-sale-step-2_form not found'
    const formStep3 = dialog.querySelector('#create-sale-confirmation-step-3_form')
    if (!formStep3) throw 'create-sale-confirmation-step-3_form not found'
    
    formStep1.onsubmit = (e) => {
        e.preventDefault()

        // TODO: create-sale-step-1_form logic

        formStep1.classList.remove('active')
        formStep2.classList.add('active')
    }

    formStep2.onsubmit = (e) => {
        e.preventDefault()

        // TODO: create-sale-step-2_form logic

        formStep2.classList.remove('active')
        formStep3.classList.add('active')
    }

    const btnAddOrder = dialog.querySelector('[data-add-order]')
    if (!btnAddOrder) throw 'data-add-order btn not found'

    const btnRetry = dialog.querySelector('[data-retry]')
    if (!btnRetry) throw 'data-retry btn not found'

    btnAddOrder.onclick = () => {
        formStep3.classList.remove('active')
        handleDialog(dialogId, 'remove')
        
        // TODO: open add-order dialog
        
        configCreateServiceDialog('create-service_dialog')
        fireCreateServiceDialog('create-service_dialog')
    }

    btnRetry.onclick = () => {
        formStep1.reset()
        formStep2.reset()

        formStep3.classList.remove('active')
        formStep1.classList.add('active')
    }
}

const initCart = (cards) => {
    cards.forEach((card) => {
        const btnAdd = card.querySelector('[data-addtocart-item_btn]')
        if (!btnAdd) throw 'data-addtocart-item_btn not found'

        const btnRemove = card.querySelector('[data-removefromcart-item_btn]')
        if (!btnRemove) throw 'data-removefromcart-item_btn not found'

        const counter = card.querySelector('.card-12')
        if (!counter) throw 'card-12 counter not found'
        const btnDecrement = counter.querySelector('[data-decrement_btn]')
        if (!btnDecrement) throw 'card-12 counter data-decrement_btn not found'
        const btnIncrement = counter.querySelector('[data-increment_btn]')
        if (!btnIncrement) throw 'card-12 counter data-increment_btn not found'
        const input = counter.querySelector('input')
        if (!input) throw 'card-12 counter input not found'


        btnAdd.onclick = () => {
            btnAdd.classList.remove('active')
            btnRemove.classList.add('active')
            counter.classList.add('active')
            // TODO: cart-item-added logic
        }

        btnRemove.onclick = () => {
            btnRemove.classList.remove('active')
            btnAdd.classList.add('active')
            counter.classList.remove('active')
            // TODO: cart-item-removed logic
        }

        btnDecrement.onclick = () => {
            input.value = parseInt(input.value) ? parseInt(input.value) - 1 : 0
            // TODO: cart-decrement-update logic
        }

        btnIncrement.onclick = () => {
            input.value = parseInt(input.value) + 1
            // TODO: cart-increment-update logic
        }
    })
}

const fireCreateServiceDialog = (dialogId) => {
    const dialog = document.querySelector(`#${dialogId}`)
    if (!dialog) throw `${dialogId} not found`

    const formStep1 = dialog.querySelector('#create-service-step-1_form')
    if (!formStep1) throw 'create-service-step-1_form not found'

    handleDialog(dialogId, 'add')
    formStep1.classList.add('active')
}

const configCreateServiceDialog = (dialogId) => {
    const dialog = document.querySelector(`#${dialogId}`)
    if (!dialog) throw `${dialogId} not found`

    const formStep1 = dialog.querySelector('#create-service-step-1_form')
    if (!formStep1) throw 'create-service-step-1_form not found'
    const formSelectCustomerStep2 = dialog.querySelector('#create-service-select-customer-step-2_form')
    if (!formSelectCustomerStep2) throw 'create-service-select-customer-step-2_form not found'
    const formDeviceDetailStep3 = dialog.querySelector('#create-service-device-detail-step-3_form')
    if (!formDeviceDetailStep3) throw 'create-service-device-detail-step-3_form not found'
    const formDeviceFailureStep4 = dialog.querySelector('#create-service-device-failure-step-4_form')
    if (!formDeviceFailureStep4) throw 'create-service-device-failure-step-4_form not found'
    const formStep5 = dialog.querySelector('#create-service-confirmation-step-5_form')
    if (!formStep5) throw 'create-service-confirmation-step-5_form not found'

    const btnSearchCustomer = dialog.querySelector('[data-search-customer]')
    if (!btnSearchCustomer) throw 'btn data-search-customer nor found'

    btnSearchCustomer.onclick = () => {
        formStep1.classList.remove('active')
        formSelectCustomerStep2.classList.add('active')
    }

    formSelectCustomerStep2.onsubmit = (e) => {
        e.preventDefault()

        // TODO: select-customer for service logic

        formSelectCustomerStep2.classList.remove('active')
        formDeviceDetailStep3.classList.add('active')
    }

    formDeviceDetailStep3.onsubmit = (e) => {
        e.preventDefault()

        // TODO: device-detail for service logic

        formDeviceDetailStep3.classList.remove('active')
        formDeviceFailureStep4.classList.add('active')
    }

    formDeviceFailureStep4.onsubmit = (e) => {
        e.preventDefault()

        // TODO: device-failure for service logic

        formDeviceFailureStep4.classList.remove('active')
        formStep5.classList.add('active')
    }

    formStep5.onsubmit = (e) => {
        e.preventDefault()

        formStep5.classList.remove('active')
        handleDialog(dialogId, 'remove')
    }
}

const initSelect = (cards) => {
    cards.forEach((card) => {
        const btnSelect = card.querySelector('[data-select_btn]')
        if (!btnSelect) throw 'data-select_btn not found'
        const btnUnselect = card.querySelector('[data-unselect_btn]')
        if (!btnUnselect) throw 'data-unselect_btn not found'

        btnSelect.onclick = () => {
            btnUnselect.classList.add('active')
            btnSelect.classList.remove('active')

            // TODO: customer-select logic
        }

        btnUnselect.onclick = () => {
            btnSelect.classList.add('active')
            btnUnselect.classList.remove('active')

            // TODO: customer-unselect logic
        }
    })
}

const render = () => {
    initDialog()
    initTable()
    initCard8()
    
    initCart([...document.querySelectorAll('.card-11[data-cart]')])
    initSelect([...document.querySelectorAll('.card-11[data-select]')])

    registerOrder()
    configCreateSaleDialog('create-sale_dialog', [])
}

render()
