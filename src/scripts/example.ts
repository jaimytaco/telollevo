import '../styles/global.css'
import { initializeApp } from 'firebase/app'
import { 
    getFirestore, 
    doc, 
    runTransaction 
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

const job = async () => {
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

// job()

const btn = document.querySelector('.c-5-bg-1 .c-actions a')
if (btn) {
    btn.onclick = (e) => {
        e.preventDefault()
        job()
    }
}