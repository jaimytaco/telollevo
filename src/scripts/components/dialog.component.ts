import { getDOMElement } from '@helpers/util.helper'

const handle = (id, action) => {
    const dialog = getDOMElement(document, `#${id}`)
    if (!dialog) return
    const body = document.body
    dialog?.classList[action]('active')
    body.classList[action]('on-dialog')
}

const init = (id) => {
    const dialog = getDOMElement(document, `#${id}`)
    if (!dialog) return
    const closeBtns = getDOMElement(dialog, '[data-close-dialog_btn]', 'all')
    closeBtns.forEach((closeBtn) => closeBtn.onclick = () => handle(closeBtn.getAttribute('data-close-dialog_btn'), 'remove'))

    const stepBackBtns = getDOMElement(dialog, '[data-previous-step_btn]', 'all')
    stepBackBtns.forEach((btn) => btn.onclick = () => {
        const currentFormId = btn.getAttribute('data-current-step')
        const currentForm = getDOMElement(dialog, `#${currentFormId}`)
        if (!currentForm) return
        const previousFormId = btn.getAttribute('data-previous-step_btn')
        const previousForm = getDOMElement(dialog, `#${previousFormId}`)
        if (!previousForm) return

        currentForm?.classList.remove('active')
        previousForm?.classList.add('active')
    })
}

export default {
    handle,
    init
}