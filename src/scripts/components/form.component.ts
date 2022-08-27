import { getDOMElement } from '@helpers/util.helper'
import { logger } from '@wf/helpers/browser.helper'


const showInvalid = (form, err, el) => {
    // TODO: Show error in inForm
    const { inForm, field, desc } = err
    if (!field) {
        const err = `Sanitize error: ${desc} for`
        logger(err, el)
        return { err: `${err} ${el}` }
    }

    const invalidFieldset = getDOMElement(form, `#${field}`)?.parentNode || getDOMElement(form, `[name="${field}"]`)?.parentNode
    if (invalidFieldset) {
        handleInvalid('add', desc, invalidFieldset)
        invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        const err = `Sanitize error: ${desc}${field ? ` in field ${field} ` : ''}for`
        logger(err, el)
        return { err: `${err}: ${el}` }
    }
}

const validateOnSubmit = async (form, sanitizeFn, el) => {
    const sanitizeStatus = await sanitizeFn(el)
    if (sanitizeStatus?.err) {
        // const { field, desc } = sanitizeStatus.err
        // if (!field) {
        //     const err = `Sanitize error: ${desc} for`
        //     logger(err, el)
        //     return { err: `${err} ${el}` }
        // }

        // const invalidFieldset = getDOMElement(form, `#${field}`)?.parentNode || getDOMElement(form, `[name="${field}"]`)?.parentNode
        // if (invalidFieldset) {
        //     handleInvalid('add', desc, invalidFieldset)
        //     invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        //     const err = `Sanitize error: ${desc}${field ? ` in field ${field} ` : ''}for`
        //     logger(err, el)
        //     return { err: `${err}: ${el}` }
        // }
        return showInvalid(form, sanitizeStatus.err, el)
    }
}

const validateBeforeSubmit = (form) => {
    resetInvalid(form.id)
    const isFormValid = form.checkValidity()
    if (!isFormValid) {
        logger(`Form ${form.id} is not HTML valid`)
        const invalidFieldset = getDOMElement(form, 'fieldset.fs-invalid')
        if (invalidFieldset) invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        return
    }
    form.requestSubmit()
}

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

const init = (id, onSubmit) => {
    const form = getDOMElement(document, `#${id}`)
    if (!form) return
    const inputs = getDOMElement(form, 'input', 'all')

    for (const input of inputs) {
        input.oninvalid = (e) => {
            e.preventDefault()
            handleInvalid('add', input.validationMessage, input.parentNode)
        }
    }

    const btnSubmit = getDOMElement(form, '[type="submit"]')
    if (!btnSubmit) return

    btnSubmit.onclick = (e) => {
        e.preventDefault()
        validateBeforeSubmit(form)
    }

    if (!onSubmit) return
    form.onsubmit = onSubmit
}

export default {
    init,
    handleInvalid,
    resetInvalid,
    validateBeforeSubmit,
    validateOnSubmit,
    showInvalid,
}