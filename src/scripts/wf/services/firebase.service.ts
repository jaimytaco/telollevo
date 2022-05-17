import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    runTransaction
} from 'firebase/firestore'

interface IError{
    err: T
}

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCTuRFw8EAuWbtzzx00flegmKU73wqyzdc",
    authDomain: "telollevo-e311e.firebaseapp.com",
    projectId: "telollevo-e311e",
    storageBucket: "telollevo-e311e.appspot.com",
    messagingSenderId: "963897814772",
    appId: "1:963897814772:web:ac04bfb7b5e2c43f7338a1"
}

const firestore = getFirestore(initializeApp(FIREBASE_CONFIG))

const getAll = async (collectionName: string): Promise<T[] | IError> => {
    try {
        const q = collection(firestore, collectionName)
        const snapshot = await getDocs(q)
        const docs = snapshot.docs
            .map(doc => {
                const data = doc.data()
                data.id = doc.id
                return data
            })
        return docs
    } catch (err) {
        return { err }
    }
}

const update = async (collectionName: string, el: T, updateFn: () => T) => {
    const { id, ...data } = el
    const docRef = doc(firestore, collectionName, id)
    try {
        const dataUpdated = await runTransaction(firestore, (transaction) => updateFn(transaction, docRef, data))
        return { data: dataUpdated }
    } catch (err) {
        return { err }
    }
}

export default {
    getAll,
    update
}