import { getDOMElement } from '@helpers/util.helper'

const handleAll = () => {
    const btns = getDOMElement(document, '[data-c-8_btn]', 'all')
    btns.forEach((btn) => {
        btn.onclick = () => btn.parentNode.classList.toggle('active')
    })
}

export default{
    handleAll
}