export const capitalizeString = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('')}`

export const getBodyPage = () => document.body.getAttribute('data-page')

export const getDOMElement = (parent, query, mode: 'all' | undefined) => { 
    const el = parent[`querySelector${mode ? 'All' : ''}`](query)
    if (!el) throw `'${query}' query not found in '${parent.id || parent.className}' parent element` 
    return mode ? [...el] : el
}

export const configCreateOrderDialog = async (dialogId) => {
    const dialog = getDOMElement(document, `#${dialogId}`)
    const createOrderBtns = getDOMElement(document, '[data-create-order-dialog_btn]', 'all')
    const step1Form = getDOMElement(dialog, '#create-order-step-1_form')
    const step2Form = getDOMElement(dialog, '#create-order-step-2_form')
    const step3Form = getDOMElement(dialog, '#create-order-step-3_form')
    const step4Form = getDOMElement(dialog, '#create-order-step-4_form')
    const step5Form = getDOMElement(dialog, '#create-order-confirmation-step-5_form')
    
    const { default: CDialog } = await import('@components/dialog.component')

    createOrderBtns?.forEach((createOrderBtn) => createOrderBtn.onclick = () => {
        CDialog.handle('create-order_dialog', 'add')
        step1Form.classList.add('active')
    })

    step1Form.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-1 submit logic

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }

    step2Form.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-2 submit logic

        step2Form.classList.remove('active')
        step3Form.classList.add('active')
    }

    step3Form.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-3 submit logic

        step3Form.classList.remove('active')
        step4Form.classList.add('active')
    }

    step4Form.onsubmit = (e) => {
        e.preventDefault()

        // TODO: form-step-4 submit logic

        step4Form.classList.remove('active')
        step5Form.classList.add('active')
    }
}