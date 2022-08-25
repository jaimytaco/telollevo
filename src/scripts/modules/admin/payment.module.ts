import { IQuotation } from '@types/quotation.type'

const makePayment = async (computedQuotation: IQuotation) => {
    // TODO: Payment logic
    const paymentResponse = {}
    if (paymentResponse?.err) return { err: paymentResponse.err }

    return paymentResponse
}

export default {
    makePayment
}