import { EFormat } from '@types/util.type'

import { IFlight } from '@types/flight.type'
import MFlight from '@models/flight.model'

import { IUser } from '@types/user.type'
import MUser from '@models/user.model'

import { IQuotation } from '@types/quotation.type'
import MQuotation from '@models/quotation.model'

import { IOrder } from '@types/order.type'
import MOrder from '@models/order.model'

import {
    getOfflineTimestamp,
    updateOfflineTimestamp
} from '@wf/lib.worker'

import { logger } from '@wf/helpers/browser.helper'


const builder = async () => {
    return {
        head: { 
            title: '', 
            meta: '' },
        body: ''
    }
}

const loader = async (wf) => {
    const { mode, auth } = wf
    const lastUpdate = await getOfflineTimestamp('flights')
    const { uid: userId } = await auth.getCurrentUser()
    const done = 1

    const user = await MUser.get(wf, mode.Offline, userId, EFormat.Raw) as IUser

    const flights = await MFlight.getAllByUserAuthenticated(wf, mode.Network, EFormat.Raw, user, lastUpdate) as IFlight[]
    
    if (flights?.err) {
        const { err } = flights
        logger(err)
        return { err }
    }

    if (!flights.length) {
        logger('There is no flights to cache offline for admin-flights')
        return { done }
    }

    logger(`Flights to cache offline for admin-flights: `, flights)

    await Promise.all(
        flights.map((flight) => MFlight.add(wf, mode.Offline, flight))
    )

    logger('All flights cached offline succesfully')

    await updateOfflineTimestamp('flights', new Date())

    const quotationsByFlight = await Promise.all(
        flights.map((flight) => MQuotation.getAllByFlightId(wf, mode.Network, EFormat.Raw, flight.id))
    )

    for (const quotations of quotationsByFlight) {
        if (quotations?.err) {
            const { err } = quotations
            logger(err)
            return { err }
        }
    }

    const allQuotations = quotationsByFlight.flat(1) as IQuotation[]

    logger(`All quotations to cache offline for admin-flights: `, allQuotations)

    await Promise.all(
        allQuotations
            .map((quotation) => MQuotation.add(wf, mode.Offline, quotation))
    )

    logger('All quotations cached offline succesfully')

    await updateOfflineTimestamp('quotations', new Date())

    const orderIds = [...new Set(allQuotations.map((quotation) => quotation.orderId))]
    const orders = await MOrder.getAllByIds(wf, mode.Network, orderIds, EFormat.Raw) as IOrder[]
    
    logger(`All orders to cache offline for admin-flights: `, orders)

    await Promise.all(
        orders.map((order) => MOrder.add(wf, mode.Offline, order))
    )

    logger('All orders cached offline succesfully')

    await updateOfflineTimestamp('orders', new Date())

    return { done }
}

const action = () => {}

export default{
    builder,
    loader,
    action,
}