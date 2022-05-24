import '../styles/global.css'
import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    doc,
    runTransaction,
    collection,
    query,
    where,
    getDocs,
    limit
} from 'firebase/firestore'

const updateWithTransaction = async (firestore, collectionName, el, updateFn) => {
    const { id, ...data } = el
    const docRef = doc(firestore, collectionName, id)
    try {
        const dataUpdated = await runTransaction(firestore, (transaction) => updateFn(transaction, docRef, data))
        return { data: dataUpdated }
    } catch (err) {
        return { err }
    }
}

const registerDB = () => {
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyCTuRFw8EAuWbtzzx00flegmKU73wqyzdc",
        authDomain: "telollevo-e311e.firebaseapp.com",
        projectId: "telollevo-e311e",
        storageBucket: "telollevo-e311e.appspot.com",
        messagingSenderId: "963897814772",
        appId: "1:963897814772:web:ac04bfb7b5e2c43f7338a1"
    }
    const app = initializeApp(FIREBASE_CONFIG)
    const firestore = getFirestore(app)

    // projects/telollevo-e311e/databases/(default)/documents/products/gfLkzQnS9LSMN1ZEYC9g.



    return { firestore }
}

const updateJob = async () => {
    const { firestore } = registerDB()

    const product = {
        id: 'gfLkzQnS9LSMN1ZEYC9g',
        count: 2,
        desc: 'B',
        name: 'Soy viajero'
    }

    // const updateFn = async (transaction, docRef, data) => {
    //     const doc = await transaction.get(docRef)
    //     if (!doc.exists()) throw 'document does not exist'

    //     const newCount = doc.data().count + 1
    //     if (newCount < 5) {
    //         transaction.update(docRef, { count: newCount })
    //         return newCount
    //     } else return Promise.reject('Sorry! Count is too big')
    // }

    const updateFn = async (transaction, docRef, data) => {
        transaction.update(docRef, { count: data.count })
        return data
    }

    const { err, data } = await updateWithTransaction(firestore, 'products', product, updateFn)
    if (err) {
        console.error('err =', err)
        return
    } else console.log('Count increased to ', data)
}

const getWithTransaction = async (firestore, docRef, getFn) => {
    try {
        const doc = await runTransaction(firestore, (transaction) => getFn(transaction, docRef))
        const data = {
            id: doc.id,
            ...doc.data()
        }
        return { data }
    } catch (err) {
        return { err }
    }
}

const getJob = async () => {
    const { firestore } = registerDB()

    const getFn = async (transaction, docRef) => {
        return transaction.get(docRef)
    }

    const docRef = doc(firestore, 'products', 'gfLkzQnS9LSMN1ZEYC9g')

    const { err, data } = await getWithTransaction(firestore, docRef, getFn)
    if (err) {
        console.error('err =', err)
        return
    }
    console.log('data gotten = ', data)
}

const getDocsWithTransaction = async (firestore, docRef, getFn) => {
    try {
        const docs = await runTransaction(firestore, async (transaction) => {
            console.log('docRef =', docRef)
            console.log('docRef.converter =', docRef.converter)
            const res = await transaction.get(docRef)
            return res
        })
        return { data: docs }
    } catch (err) {
        return { err }
    }
}

const getDocsJob = async () => {
    const { firestore } = registerDB()

    const getFn = async (transaction, docRef) => {
        console.log('docRef =', docRef)
        const res = await transaction.get(docRef)
        console.log('res =', res)
        return res
    }

    const docsRef = collection(firestore, 'products')
    const w = where('count', '==', 1)
    const l = limit(1)
    const q = query(docsRef, w, l)

    // const docs = (await getDocs(q)).docs
    // .map(doc => {
    //     const data = doc.data()
    //     data.id = doc.id
    //     return data
    // })
    // console.log('docs =', docs)


    const { err, data } = await getDocsWithTransaction(firestore, q, getFn)
    if (err) {
        console.error('err =', err)
        return
    }
    console.log('data gotten = ', data)
}

const btn = document.querySelector('.c-5-bg-1 .c-actions a')
if (btn) {
    btn.onclick = (e) => {
        e.preventDefault()
        // updateJob()
        getJob()
        // getDocsJob()
    }
}