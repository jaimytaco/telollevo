export const capitalizeString = (str) => {
    if (!str) return ''
    const [first, ...rest] = str
    return first || rest ? `${first.toUpperCase()}${rest.join('')}` : ''
}

export const getBodyPage = () => document.body.getAttribute('data-page')

export const getDOMElement = (parent, query, mode: 'all' | undefined) => { 
    const el = parent[`querySelector${mode ? 'All' : ''}`](query)
    if (!el) throw `'${query}' query not found in '${parent.id || parent.className}' parent element` 
    return mode ? [...el] : el
}

export const configCreateOrderDialog = async (wf, dialogId) => {
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

    const { ECoin } = await import('@types/coin.type')
    const { EOrderStatus } = await import('@types/order.type')

    // TODO: use order local object
    const order = {}

    step1Form.onsubmit = (e) => {
        e.preventDefault()

        const name = (getDOMElement(step1Form, '#product-name')).value
        const category = (getDOMElement(step1Form, '[list="product-category"]')).value
        const url = (getDOMElement(step1Form, '#product-link')).value
        const price = parseFloat((getDOMElement(step1Form, '#product-pu')).value)
        const units = parseInt((getDOMElement(step1Form, '#product-qty')).value)
        const isBoxIncluded = (getDOMElement(step1Form, '[name="product-need-box"]:checked')).value === 'yes'
        const coin = ECoin.PEN.code
        const status = EOrderStatus.Registered

        // TODO: validate product info in step-1
        
        order.product = {
            name,
            category,
            url,
            price,
            units,
            isBoxIncluded,
            coin
        }

        order.status = status

        console.log('--- step 1 - order =', order)

        step1Form.classList.remove('active')
        step2Form.classList.add('active')
    }

    step2Form.onsubmit = (e) => {
        e.preventDefault()

        const weightMore5kg = (getDOMElement(step2Form, '[name="product-weight-more-5kg"]:checked')).value === 'yes'
        const isTaller50cm = (getDOMElement(step2Form, '[name="product-is-taller-50cm"]:checked')).value === 'yes'
        const isOneUnitPerProduct = (getDOMElement(step2Form, '[name="product-has-more-units"]:checked')).value === 'yes'
        const shipper = (getDOMElement(step2Form, '[name="order-shipper"]')).value
        const comments = (getDOMElement(step2Form, '#order-extra-comment')).value

        // TODO: validate product info in step-2

        order.product = {
            ...order.product,
            weightMore5kg,
            isTaller50cm,
            isOneUnitPerProduct
        }

        order.comments = comments
        order.shipper = shipper

        console.log('--- step 2 - order =', order)

        step2Form.classList.remove('active')
        step3Form.classList.add('active')
    }

    step3Form.onsubmit = (e) => {
        e.preventDefault()

        const shippingDestination = (getDOMElement(step3Form, '[name="order-shipping-address"]:checked')).value
        // TODO: validate order info in step-3
        order.shippingDestination = shippingDestination

        console.log('--- step 3 - order =', order)

        step3Form.classList.remove('active')
        step4Form.classList.add('active')
    }

    step4Form.onsubmit = async (e) => {
        e.preventDefault()

        const shopper = (getDOMElement(step4Form, '[name="order-shopper"]')).value
        // TODO: validate order info in step-4
        order.shopper = shopper

        console.log('--- step 4 - order =', order)

        await wf.database.add(wf.mode.Network, 'orders', order)

        step4Form.classList.remove('active')
        step5Form.classList.add('active')
    }

    step5Form.onsubmit = (e) => {
        e.preventDefault()
        step5Form.classList.remove('active')
        CDialog.handle('create-order_dialog', 'remove')
    }
}