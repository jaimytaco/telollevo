import { 
    initializeApp
} from 'firebase/app'

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
    updateDoc
} from 'firebase/firestore/lite'

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCTuRFw8EAuWbtzzx00flegmKU73wqyzdc",
    authDomain: "telollevo-e311e.firebaseapp.com",
    projectId: "telollevo-e311e",
    storageBucket: "telollevo-e311e.appspot.com",
    messagingSenderId: "963897814772",
    appId: "1:963897814772:web:ac04bfb7b5e2c43f7338a1"
}

const firestore = getFirestore(initializeApp(FIREBASE_CONFIG))

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

const update = async (collectionName, docData, updateFn) => {
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

const isTimestamp = (timestamp) => typeof timestamp.seconds !== 'undefined' && typeof timestamp.nanoseconds !== 'undefined'

const timestampToDate = (timestamp) => (new Timestamp(timestamp.seconds, timestamp.nanoseconds)).toDate()

const dateToTimestamp = (date) => Timestamp.fromDate(date)

const formatDoc = (data) => {
    for (const key of Object.keys(data))
        if (isTimestamp(data[key]))
            data[key] = timestampToDate(data[key])
    return data
}

const formatDocForFirebase = (data) => {
    for (const key of Object.keys(data))
        if (typeof data[key] instanceof Date)
            data[key] = dateToTimestamp(data[key])
    return data
}

export default {
    getAll,
    update,
    get,
    add
}