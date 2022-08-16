import { IOrder } from '@types/order.type'
import MOrder from '@models/order.model'
import { EUserType } from '@types/user.type'
import { EFormat } from '@types/util.type'

import { logger } from '@wf/helpers/browser.helper'
import {
    getOfflineTimestamp,
    updateOfflineTimestamp
} from '@wf/lib.worker'

interface IUser{
    id: string,
    email: string,
    name: string,
    lastName: string,
    createdAt: Date,
    updatedAt: Date,
    type: EUserType
}

const getType = (user: IUserType) => `${user.type}`

const getFullName = (user: IUser) => `${user.name} ${user.lastName}`

const getAcronym = (user: IUser) => `${user.name.charAt(0)}${user.lastName.charAt(0)}`

// TODO: install depending of user-type
const install = async (wf, id) => {
    const lastUpdate = await getOfflineTimestamp('users')
    
    const user = await get(wf, wf.mode.Network, id, EFormat.Raw)
    await add(wf, wf.mode.Offline, user)
    
    logger(`User installed successfully!`, user)

    await updateOfflineTimestamp('users', new Date())
}

const add = (wf, mode, user: IUser) => {
    const { database: db } = wf
    return db.add(mode, 'users', user)
}

const get = async (wf, mode, id, isFormatted: EFormat) => {
    const { database: db } = wf
    const responseUser = await db.get(mode, 'users', id)
    if (responseUser?.err) {
        const { err } = responseUser
        logger(err)
        return { err }
    }

    const user = responseUser.data as IUser
    return mode === EFormat.Pretty ? format(user) : user
}

const format = (user: IUser) => user

export default{
    collection: 'users',
    
    format,
    get,
    add,

    install,
    getAcronym,
    getFullName,
    getType,
}