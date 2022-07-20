import { IQuotation } from '@types/quotation.type'
import { formatLocaleDate } from '@helpers/util.helper'
import MFlight from '@models/flight.model'
import { ECoin } from '@types/util.type'

const format = (quotation: IQuotation) => {
    quotation.priceStr = `${ECoin[quotation.coin].symbol}${quotation.price.toFixed(2)}`
    quotation.createdAt = formatLocaleDate(quotation.createdAt)
    if (quotation.flight) quotation.flight = MFlight.format(quotation.flight)
    return quotation
}

const getAll = async (db, mode) => {
    const responseQuotations = await db.getAll(mode, 'quotations')
    if (responseQuotations?.err) throw 'error querying quotations in quotation-model'
    
    for (const quotationData of responseQuotations.data){
        quotationData.flight = await MFlight.get(db, mode, quotationData.flightId)
    }

    return responseQuotations.data
        .map((quotation) => format(quotation as IQuotation))
}

export default{
    collection: 'quotations',
    
    format,
    getAll
}