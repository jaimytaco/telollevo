import { IQuotation } from '@types/quotation.type'
import { EFormat } from '@types/util.type'
import { formatLocaleDate } from '@helpers/util.helper'
import MFlight from '@models/flight.model'
import { ECoin } from '@types/util.type'

import { logger } from '@wf/helpers/browser.helper'


const getAllByOrderId = async (wf, mode, isFormatted: EFormat, orderId) => {
    const { operator } = wf

    const byOrder = {
        field: 'orderId',
        operator: operator.EqualTo,
        value: orderId
    }

    const filters = [byOrder]

    return getAll(wf, mode, isFormatted, filters)
}

const add = (wf, mode, quotation: IQuotation) => {
    const { database: db } = wf
    return db.add(mode, 'quotations', quotation)
}

const getAll = async (wf, mode, isFormatted: EFormat, filters?) => {
    const { database: db } = wf
    const responseQuotations = await db.getAll(mode, 'quotations', filters)
    if (responseQuotations?.err) {
        const { err } = responseQuotations
        logger(err)
        return { err }
    }

    const quotations = responseQuotations.data as IQuotation[]
    if (isFormatted === EFormat.Raw) return quotations
    
    for (const quotation of quotations){
        quotation.flight = await MFlight.get(wf, mode, quotation.flightId, isFormatted)
    }

    return isFormatted === EFormat.Related ? 
        quotations :
        quotations.map(format)
}

const format = (quotation: IQuotation) => {
    quotation.priceStr = `${ECoin[quotation.coin].symbol}${quotation.price.toFixed(2)}`
    quotation.createdAt = formatLocaleDate(quotation.createdAt)
    if (quotation.flight) quotation.flight = MFlight.format(quotation.flight)
    return quotation
}

export default{
    collection: 'quotations',
    
    format,
    getAll,
    add,

    getAllByOrderId,
}