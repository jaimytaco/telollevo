import { IOrder } from '@types/order.type'
import MOrder from '@models/order.model'

import { EUserType } from '@types/user.type'

import { EMenu, EFormat } from '@types/util.type'

import { logger } from '@wf/helpers/browser.helper'
import {
    getOfflineTimestamp,
    updateOfflineTimestamp,
    removeOfflineTimestamp,
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

const getMenuByUser = (user: IUser) => {
    if (user.type === EUserType.Shopper)
        return [EMenu.Orders]
    if (user.type === EUserType.Traveler)
        return [EMenu.Orders, EMenu.Flights]
    if (user.type === EUserType.Multiple)
        return [EMenu.Orders, EMenu.Flights]
    if (user.type === EUserType.Admin)
        return [EMenu.Orders, EMenu.Flights]  
    return []
}

const uninstall = async (wf) => {
    const users = await getAll(wf, wf.mode.Offline, EFormat.Raw)
    const userIds = users.map((user: IUser) => user.id)
    await Promise.all([
        userIds.map((id) => remove(wf, wf.mode.Offline, id)),
        removeOfflineTimestamp('users')
    ])

    logger(`Users uninstalled successfully`)
}

const getType = (user: IUserType) => `${user.type}`

const getFullName = (user: IUser) => `${user.name} ${user.lastName}`

const getAcronym = (user: IUser) => `${user.name.charAt(0)}${user.lastName.charAt(0)}`

const install = async (wf, id) => {
    const lastUpdate = await getOfflineTimestamp('users')
    
    const user = await get(wf, wf.mode.Network, id, EFormat.Raw)
    await add(wf, wf.mode.Offline, user)
    
    logger(`User installed successfully`)

    if (user.type === EUserType.Admin){
        const restOfUsers = (await Promise.all([
            getAllByType(wf, wf.mode.Network, EFormat.Raw, EUserType.Shopper),
            getAllByType(wf, wf.mode.Network, EFormat.Raw, EUserType.Traveler)
        ])).flat(1) as IUser[]

        await Promise.all(restOfUsers.map((restOfUser) => install(wf, restOfUser.id)))
    }

    await updateOfflineTimestamp('users', new Date())
}

const getAllByType = (wf, mode, isFormatted: EFormat, type: EUserType) => {
    const byType = {
        field: 'type',
        operator: wf.operator.EqualTo,
        value: type
    }

    return getAll(wf, mode, isFormatted, [byType])
}

const remove = async (wf, mode, id) => {
    const { database: db } = wf
    const response = await db.remove(mode, 'users', id)
    if (response?.err) {
        const { err } = response
        logger(err)
        return { err }
    }
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
    return mode === EFormat.Pretty ? prettify(user) : user
}

const getAll = async (wf, mode, isFormatted: EFormat, filters?) => {
    const { database: db } = wf
    const responseUser = await db.getAll(mode, 'users', filters)
    if (responseUser?.err) {
        const { err } = responseUser
        logger(err)
        return { err }
    }

    const users = responseUser.data as IUser[]

    if (isFormatted === EFormat.Raw) return users

    return isFormatted === EFormat.Related ?
        users :
        users.map(prettify)
}

const prettify = (user: IUser) => user

export default{
    collection: 'users',
    
    prettify,
    getAll,
    get,
    add,
    remove,

    install,
    uninstall,
    getAcronym,
    getFullName,
    getType,
    getMenuByUser,
    getAllByType,
}