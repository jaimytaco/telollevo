import { getDOMElement } from '@helpers/util.helper'

const resetInvalid = (id) => {
    const form = getDOMElement(document, `#${id}`)
    const fieldsets = getDOMElement(form, 'fieldset.fs-invalid', 'all')
    for (const fieldset of fieldsets) {
        handleInvalid('remove', '', fieldset)
    }
}

const handleInvalid = (mode, msg, fieldset) => {
    if (mode === 'add') {
        fieldset.classList.add('fs-invalid')
        fieldset.setAttribute('data-invalid', msg)
    } else {
        fieldset.classList.remove('fs-invalid')
        fieldset.removeAttribute('data-invalid')
    }
}

const init = (id) => {
    const form = getDOMElement(document, `#${id}`)
    const inputs = getDOMElement(form, 'input', 'all')

    for (const input of inputs) {
        input.oninvalid = (e) => {
            e.preventDefault()
            handleInvalid('add', input.validationMessage, input.parentNode)
        }
    }
}

export default {
    init,
    handleInvalid,
    resetInvalid,
}