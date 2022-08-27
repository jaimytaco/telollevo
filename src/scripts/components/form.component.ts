import { getDOMElement } from '@helpers/util.helper'
import { logger } from '@wf/helpers/browser.helper'


const showInvalid = (form, err, doc) => {
    const { inForm, field, desc } = err

    if (field || inForm) {
        const invalid = inForm ? getDOMElement(form, 'main') :
            getDOMElement(form, `#${field}`)?.parentNode || getDOMElement(form, `[name="${field}"]`)?.parentNode

        if (!invalid) return

        handleInvalid('add', desc, invalid)
        invalid.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    const msg = `Sanitize error: ${desc}${field ? ` in field ${field} ` : ''}for `
    logger(msg, doc)
    return { err: `${msg}: ${doc}` }

}

const validateOnSubmit = async (form, sanitizeFn, el) => {
    const sanitizeStatus = await sanitizeFn(el)
    if (sanitizeStatus?.err) return showInvalid(form, sanitizeStatus.err, el)
}

const validateBeforeSubmit = (form) => {
    resetInvalid(form.id)
    const isFormValid = form.checkValidity()
    if (!isFormValid) {
        logger(`Form ${form.id} is not HTML valid`)
        const invalidFieldset = getDOMElement(form, 'fieldset.is-invalid')
        if (invalidFieldset) invalidFieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        return
    }
    form.requestSubmit()
}

const resetInvalid = (id) => {
    // const form = getDOMElement(document, `#${id}`)
    // const fieldsets = getDOMElement(form, 'fieldset.is-invalid', 'all')
    // for (const fieldset of fieldsets) {
    //     handleInvalid('remove', '', fieldset)
    // }
    const invalids = getDOMElement(document, `#${id} .is-invalid`, 'all')
    for (const invalid of invalids) handleInvalid('remove', '', invalid)
}

const handleInvalid = (mode, msg, el) => {
    if (mode === 'add') {
        el.classList.add('is-invalid')
        el.setAttribute('data-invalid', msg)
    } else {
        el.classList.remove('is-invalid')
        el.removeAttribute('data-invalid')
    }
}

const handleFreeze = (form, mode='freeze') => {
    if (!form) return
    const btnSubmit = getDOMElement(form, '[type="submit"]')
    if (!btnSubmit) return
    const inputs = getDOMElement(form, 'input, textarea', 'all')

    for (const input of inputs) input.disabled = mode === 'freeze'
    btnSubmit.classList[mode === 'freeze' ? 'add' : 'remove']('btn-loading')
}

const init = (id, onSubmit) => {
    const form = getDOMElement(document, `#${id}`)
    if (!form) return
    const inputs = getDOMElement(form, 'input, textarea', 'all')

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
        if (btnSubmit.matches('.btn-loading')) return
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
    handleFreeze,
}