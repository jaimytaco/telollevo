import {
    IQuotation,
    EQuotationStatus,
} from '@types/quotation.type'

import {
    EFormat,
    ECoin
} from '@types/util.type'

import {
    formatLocaleDate,
    hasParameter,
    mergeUUIDs,
} from '@helpers/util.helper'

import { IFlight } from '@type/flight.type'
import MFlight from '@models/flight.model'

import { IOrder } from '@type/order.type'
import MOrder from '@models/order.model'

import { IUser } from '@type/user.type'
import MUser from '@models/user.model'

import { logger } from '@wf/helpers/browser.helper'
import { removeOfflineTimestamp } from '@wf/lib.worker'


const uninstall = async (wf) => {
    const quotations = await getAll(wf, wf.mode.Offline, EFormat.Raw)
    const quotationIds = quotations.map((quotation: IQuotation) => quotation.id)
    await Promise.all([
        quotationIds.map((id) => remove(wf, wf.mode.Offline, id)),
        removeOfflineTimestamp('quotations')
    ])

    logger(`Quotations uninstalled successfully`)
}

const getAllByTravelerIdAndOrderId = (wf, mode, isFormatted: EFormat, travelerId, orderId) => {
    const byTraveler = {
        field: 'travelerId',
        operator: wf.operator.EQualTo,
        value: travelerId
    }

    const byOrder = {
        field: 'orderId',
        operator: wf.operator.EQualTo,
        value: orderId
    }

    return getAll(wf, mode, isFormatted, [byTraveler, byOrder])
}

const getAllByFlightId = async (wf, mode, isFormatted: EFormat, flightId) => {
    const byFlight = {
        field: 'flightId',
        operator: wf.operator.EqualTo,
        value: flightId
    }

    return getAll(wf, mode, isFormatted, [byFlight])
}

const getAllByOrderId = async (wf, mode, isFormatted: EFormat, orderId) => {
    const byOrder = {
        field: 'orderId',
        operator: wf.operator.EqualTo,
        value: orderId
    }

    return getAll(wf, mode, isFormatted, [byOrder])
}

const remove = async (wf, mode, id) => {
    const { database: db } = wf
    const response = await db.remove(mode, 'quotations', id)
    if (response?.err) {
        const { err } = response
        logger(err)
        return { err }
    }
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

    for (const quotation of quotations) {
        quotation.flight = await MFlight.get(wf, mode, quotation.flightId, isFormatted) as IFlight
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

const sanitize = (quotation: IQuotation) => {

}

const doQuote = async (wf, quotation: IQuotation) => {
    const quotationDetails = await Promise.all([
        MFlight.get(wf, wf.mode.Offline, quotation.flightId, EFormat.Raw),
        MOrder.get(wf, wf.mode.Offline, quotation.orderId, EFormat.Raw),
        MUser.get(wf, wf.mode.Offline, quotation.shopperId, EFormat.Raw),
        MUser.get(wf, wf.mode.Offline, quotation.travelerId, EFormat.Raw),
    ])

    const isReadyToQuote = !quotationDetails.filter((response) => hasParameter(response, 'err')).length

    // TODO: Show error in form
    if (!isReadyToQuote) return {
        err: {
            inForm: 'quote-order-step-1_form',
            desc: 'Hubo un error al registrar su cotización, intente nuevamente'
        }
    }

    const data = {
        id: mergeUUIDs([quotation.orderId, quotation.shopperId, quotation.flightId, quotation.travelerId]),
        ...quotation
    }

    const onTransaction = async (transaction, docRef, data) => {
        const doc = await transaction.get(docRef)
        if (doc.exists())
            return Promise.reject({
                field: 'quote-flight',
                desc: 'Este pedido ya ha sido cotizado con este vuelo'
            })

        transaction.set(docRef, data)

        return {
            data: {
                id: docRef.id,
                ...data
            }
        }
    }

    // TODO: update to new transaction fn
    return wf.database.runWithTransaction(wf.mode.Network, 'quotations', data, onTransaction)
}

export default {
    collection: 'quotations',

    format,
    getAll,
    add,
    remove,

    getAllByOrderId,
    getAllByFlightId,
    getAllByTravelerIdAndOrderId,
    uninstall,
    sanitize,
    doQuote,
}