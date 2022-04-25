import { IError } from '../interfaces/error.interface'
import { isBrowser, isWorker, isNode } from '../helpers/browser.helper'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

export class Firebase {
    static app: any
    static firestore: any
    static FIREBASE_CONFIG = {
        apiKey: "AIzaSyCTuRFw8EAuWbtzzx00flegmKU73wqyzdc",
        authDomain: "telollevo-e311e.firebaseapp.com",
        projectId: "telollevo-e311e",
        storageBucket: "telollevo-e311e.appspot.com",
        messagingSenderId: "963897814772",
        appId: "1:963897814772:web:ac04bfb7b5e2c43f7338a1"
    }
    static initializeApp: Function
    static getFirestore: Function
    static collection: Function
    static getDocs: Function

    static init = async () => {
        this.initializeApp = initializeApp
        this.getFirestore = getFirestore
        this.collection = collection
        this.getDocs = getDocs

        this.app = this.initializeApp(this.FIREBASE_CONFIG)
        this.firestore = this.getFirestore(this.app)
    }

    static getAll = async (collectionName: string): Promise<any[] | IError> => {
        try {
            const q = this.collection(this.firestore, collectionName)
            const snapshot = await this.getDocs(q)
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
}