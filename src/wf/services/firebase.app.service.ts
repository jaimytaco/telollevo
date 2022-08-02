import * as FirebaseApp from 'firebase/app'

export const initApp = (credentials) => !!FirebaseApp.initializeApp(credentials)

export const getApp = (name?: string) => FirebaseApp.getApp(name)