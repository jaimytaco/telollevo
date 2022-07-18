import { getDOMElement } from '@helpers/util.helper'

const handle = (id, action) => {
    const body = document.body
    const dialog = getDOMElement(document, `#${id}`)

    dialog?.classList[action]('active')
    body.classList[action]('on-dialog')
}

const init = (id) => {
    const dialog = getDOMElement(document, `#${id}`)

    const closeBtn = getDOMElement(dialog, '[data-close-dialog_btn]')
    if (closeBtn) closeBtn.onclick = () => handle(closeBtn.getAttribute('data-close-dialog_btn'), 'remove')

    const stepBackBtns = getDOMElement(dialog, '[data-previous-step_btn]', 'all')
    stepBackBtns?.forEach((btn) => btn.onclick = () => {
        const currentFormId = btn.getAttribute('data-current-step')
        const currentForm = getDOMElement(dialog, `#${currentFormId}`)
        const previousFormId = btn.getAttribute('data-previous-step_btn')
        const previousForm = getDOMElement(dialog, `#${previousFormId}`)

        currentForm?.classList.remove('active')
        previousForm?.classList.add('active')
    })
}

export default {
    handle,
    init
}