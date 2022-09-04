import { 
    initApp,
    getApp
} from '@wf/services/firebase.app.service'

import {
    getFirestore,
    collection,
    where,
    query,
    doc,
    Timestamp,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    runTransaction,
} from 'firebase/firestore/lite'
// } from 'firebase/firestore'

let firestore

const register = () => {
    const app = getApp()
    if (!app) throw 'firebase-app not initialized firebase/firestore'
    firestore = getFirestore(app)
}

const getAll = async (collectionName, filters) => {
    try {
        const c = collection(firestore, collectionName)
        const w = !filters ?
            null :
            filters
                .map((filter) => where(filter.field, filter.operator, filter.value))
        const q = w?.length ? query(c, ...w) : c
        const snapshot = await getDocs(q)
        return {
            data: snapshot.docs
                .map(doc => {
                    const data = formatDoc(doc.data())
                    data.id = doc.id
                    return data
                })
        }
    } catch (err) {
        return { err }
    }
}

const get = async (collectionName, id) => {
    try {
        const docRef = await getDoc(doc(firestore, collectionName, id))
        const data = {
            id: docRef.id,
            ...formatDoc(docRef.data())
        }
        return { data }
    } catch (err) {
        return { err }
    }
}

// TODO: Check if this is eccesary
const getWithTransaction = async (docRef, callback) => {
    try {
        const doc = await runTransaction(firestore, (transaction) => callback(transaction, docRef))
        const data = {
            id: doc.id,
            ...formatDoc(doc.data())
        }
        return { data }
    } catch (err) {
        return { err }
    }
}

// TODO: Remove id splitting
const update = async (collectionName, docData) => {
    const { id, ...data } = docData
    const docRef = doc(firestore, collectionName, id)
    try {
        await updateDoc(docRef, formatDocForFirebase(data))
        return {
            data: {
                id: docRef.id,
                ...data
            }
        }
    } catch (err) {
        return { err }
    }
}

// TODO: Remove id splitting
const add = async (collectionName, docData) => {
    const { id, ...data } = docData
    try {
        const docRef = await addDoc(collection(firestore, collectionName), formatDocForFirebase(data))
        return {
            data: {
                id: docRef.id,
                ...data
            }
        }
    } catch (err) {
        return { err }
    }
}

const getDocRef = (docData, collectionName) => {
    const { id, ...data } = docData
    return id ? doc(firestore, collectionName, id) : doc(collection(firestore, collectionName))
}

const runWithTransaction = async (transactionData, onTransaction) => {
    for (const key of Object.keys(transactionData)){
        if (key === 'fns') continue
        transactionData[key].docRefs = transactionData[key].datas.map((data) => getDocRef(data, transactionData[key].collectionName))
    }

    try {
        const transactionResponse = await runTransaction(firestore, (transaction) => onTransaction(transaction, transactionData))
        return { data: transactionResponse }
    } catch (err) {
        return { err }
    }
}

const isTimestamp = (timestamp) => typeof timestamp.seconds !== 'undefined' && typeof timestamp.nanoseconds !== 'undefined'

const timestampToDate = (timestamp) => (new Timestamp(timestamp.seconds, timestamp.nanoseconds)).toDate()

const dateToTimestamp = (date) => Timestamp.fromDate(date)

const formatDoc = (data) => {
    for (const key of Object.keys(data))
        if (isTimestamp(data[key]))
            data[key] = timestampToDate(data[key])
    return data
}

const formatDocForFirebase = (doc) => {
    const { id, ...data } = doc
    for (const key of Object.keys(data))
        if (typeof data[key] instanceof Date)
            data[key] = dateToTimestamp(data[key])
    return data
}

export default {
    initApp,

    register,
    getAll,
    update,
    get,
    add,

    runWithTransaction,

    formatDocForDB: formatDocForFirebase,
}