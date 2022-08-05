import { IOrder } from '@types/order.type'
import MOrder from '@models/order.model'

import { logger } from '@wf/helpers/browser.helper'

interface IUser{
    id: string,
    email: string,
    name: string,
    lastName: string,
}

const installOnAuth = async (wf, userId) => {
    const { mode, operator } = wf
    const orders = await MOrder.getAll(wf, mode.Network, 'raw', [{
        field: 'shopperId',
        operator: operator.EqualTo,
        value: userId
    }]) as IOrder[]

    await Promise.all(
        orders.map((order) => MOrder.add(wf, mode.Offline, order))
    )
}

const get = async (wf, mode, id) => {
    const responseUser = await db.get(mode, 'users', id)
    if (responseUser?.err) {
        const { err } = responseUser
        logger(err)
        return { err }
    }
    
    return format(responseUser.data as IUser)
}

const format = (user: IUser) => user

export default{
    collection: 'users',
    
    installOnAuth,
    get,
    format,
}