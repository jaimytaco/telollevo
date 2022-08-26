import {
    IQuotation,
    EQuotationStatus,
    EQuotationComissionPercentage,
} from '@types/quotation.type'

import {
    EFormat,
    ECoin,
    ETax,
} from '@types/util.type'

import {
    formatLocaleDate,
    hasParameter,
    mergeUUIDs,
    formatPrice,
} from '@helpers/util.helper'

import { IFlight } from '@types/flight.type'
import MFlight from '@models/flight.model'

import { 
    IOrder, 
    EOrderShoppers,
} from '@types/order.type'
import MOrder from '@models/order.model'

import { IUser } from '@types/user.type'
import MUser from '@models/user.model'

import ModPayment from '@modules/admin/payment.module'

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

const getAllByShopperIdAndOrderId = (wf, mode, isFormatted: EFormat, shopperId, orderId) => {
    const byShopper = {
        field: 'shopperId',
        operator: wf.operator.EQualTo,
        value: shopperId
    }

    const byOrder = {
        field: 'orderId',
        operator: wf.operator.EQualTo,
        value: orderId
    }

    return getAll(wf, mode, isFormatted, [byShopper, byOrder])
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

const getAllByOrderId = (wf, mode, isFormatted: EFormat, orderId) => {
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

const update = async (wf, mode, quotation) => wf.database.update(mode, 'quotations', quotation)

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

    // for (const quotation of quotations) {
    //     quotation.flight = await MFlight.get(wf, mode, quotation.flightId, isFormatted) as IFlight
    //     quotation.traveler = await MUser.get(wf, mode, quotation.travelerId, isFormatted) as IUser
    // }

    // return isFormatted === EFormat.Related ?
    //     quotations :
    //     quotations.map(prettify)

    const quotationsRelated = await Promise.all(
        quotations.map((quotation) => relate(wf, mode, isFormatted, quotation))
    )

    return isFormatted === EFormat.Related ?
        quotationsRelated :
        quotationsRelated.map(prettify)
}

const get = async (wf, mode, id, isFormatted: EFormat) => {
    const { database: db } = wf
    const responseQuotation = await db.get(mode, 'quotations', id)
    if (responseQuotation?.err) {
        const { err } = responseQuotation
        logger(err)
        return { err }
    }

    const quotation = responseQuotation.data as IOrder
    if (isFormatted === EFormat.Raw) return quotation

    // quotation.flight = await MFlight.get(wf, mode, quotation.flightId, isFormatted) as IFlight
    // quotation.traveler = await MUser.get(wf, mode, quotation.travelerId, isFormatted) as IUser
    // return isFormatted === EFormat.Related ?
    //     quotation :
    //     prettify(quotation)

    const quotationRelated = await relate(quotation)
    return isFormatted === EFormat.Related ?
        quotationRelated :
        prettify(quotationRelated)
}

const relate = async (wf, mode, isFormatted: EFormat, quotation: IQuotation) => {
    const flight = await MFlight.get(wf, mode, quotation.flightId, isFormatted) as IFlight
    const traveler = await MUser.get(wf, mode, quotation.travelerId, isFormatted) as IUser
    // const order = await MOrder.get(wf, mode, quotation.orderId, isFormatted) as IOrder
    return {
        ...quotation,
        flight,
        traveler,
        // order,
    } as IQuotation
}

const prettify = (quotation: IQuotation) => {
    // quotation.priceStr = formatPrice(ECoin[quotation.coin].symbol, quotation.price)
    quotation.createdAt = formatLocaleDate(quotation.createdAt)
    if (quotation.flight) quotation.flight = MFlight.prettify(quotation.flight)
    if (quotation.traveler) quotation.traveler = MUser.prettify(quotation.traveler)
    // if (quotation.order) quotation.order = MOrder.prettify(quotation.order)
    return quotation
}

const compute = async (wf, mode, quotation: IQuotation) => {
    const order = await MOrder.get(wf, mode, quotation.orderId, EFormat.Raw) as IOrder
    const commissionPercentage = (order.shopper === EOrderShoppers.Myself ? 
        EQuotationComissionPercentage.Myself : 
        EQuotationComissionPercentage.Bussiness) as number
    
    const symbol = ECoin[quotation.coin].symbol
    const price = quotation.price
    const commission = quotation.price * commissionPercentage
    const tax = quotation.price * ETax.Peru
    const total = quotation.price + commission + tax

    return {
        ...quotation,
        computed: {
            price,
            commission,
            tax,
            total,
            priceStr: formatPrice(symbol, price),
            commissionStr: formatPrice(symbol, commission),
            taxStr: formatPrice(symbol, tax),
            totalStr: formatPrice(symbol, total),
        }
    }
}

const uncompute = (quotation: IQuotation) => {
    delete quotation.computed
    return quotation
}

const sanitize = (quotation: IQuotation) => {}

const doPay = async (wf, quotationId) => {
    // TODO: Payment response logic
    const paymentResponse = {}
    if (paymentResponse?.err){
        logger(paymentResponse.err)
        return { err: paymentResponse.err }
    }

    const quotationToPay = await get(wf, wf.mode.Offline, quotationId, EFormat.Raw)
    const computedQuotationToPay = await compute(wf, wf.mode.Offline, quotationToPay)

    const quotations = await getAllByOrderId(wf, wf.mode.Offline, EFormat.Raw, computedQuotationToPay.orderId)
    const otherQuotations = quotations.filter((quotation) => quotation.id !== computedQuotationToPay.id)

    const transactionData = {
        quotation: {
            collectionName: 'quotations',
            datas: [computedQuotationToPay, ...otherQuotations],
        },
        fns: {
            formatDocForDB: (computedQuotationToFormat) => {
                const { id, ...data } = computedQuotationToFormat
                return wf.database.formatDocForDB(data)
            },
            makePayment: (computedQuotationToPay) => ModPayment.makePayment(computedQuotationToPay)
        }
    }

    const onTransaction = async (transaction, transactionData) => {
        const quotationRefs = transactionData.quotation.docRefs
        const quotationDocs = await Promise.all(
            quotationRefs.map((quotationRef) => transaction.get(quotationRef))
        )
        const quotationDocsThatNotExist = quotationDocs
            .filter((quotationDoc) => !quotationDoc.exists())

        if (quotationDocsThatNotExist.length)
            return Promise.reject({
                desc: 'Algunas de las cotizaciones de la orden no existen'
            })

        const quotations = quotationDocs.map((quotationDoc) => quotationDoc.data())
        const payedQuotations = quotations.filter((quotation) => quotation.status === EQuotationStatus.Paid)
        
        if (payedQuotations.length)
            return Promise.reject({
                desc: 'No se puede pagar esta cotización porque la orden ya ha sido pagada'
            })
        
        const quotationToPay = quotations[0]

        if (quotationToPay.status === EQuotationStatus.Paid)
            return Promise.reject({
                desc: `La cotización ya tiene el estado ${EQuotationStatus.Paid}`
            })
        
        const data = transactionData.quotation.datas[0]
        const paymentResponse = await transactionData.fns.makePayment(data)
        
        if (paymentResponse?.err)
            return Promise.reject({
                desc: `Error en pasarela de pago: ${paymentResponse.err}`
            })

        const payedQuotation = {
            ...data,
            updatedAt: new Date(),
            status: EQuotationStatus.Paid,
            payment: paymentResponse
        }

        const formattedQuotation = transactionData.fns.formatDocForDB(payedQuotation)

        transaction.update(quotationRefs[0], formattedQuotation)

        return {
            id: quotationRefs[0].id,
            ...payedQuotation,
        }
    }

    return wf.database.customRunWithTransaction(transactionData, onTransaction)
}

// TODO: Valid payed-status
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

    prettify,
    getAll,
    get,
    update,
    add,
    remove,

    getAllByOrderId,
    getAllByFlightId,
    getAllByShopperIdAndOrderId,
    getAllByTravelerIdAndOrderId,
    uninstall,
    sanitize,
    doQuote,
    compute,
    uncompute,
    doPay,
}