import * as FirebaseAuth from 'firebase/auth'
import { 
    initApp,
    getApp
} from '@wf/services/firebase.app.service'

interface IUserProfile {
    accessToken: string,
    phoneNumber: string,
    displayName: string,
    photoURL: string
}

interface IUser extends IUserProfile {
    email: string,
    emailVerified: boolean,
    uid: string
}

interface IError {
    err: T
}

interface IUserInfo {
    user: IUser
}

let auth

const register = () => {
    const app = getApp()
    if (!app) throw 'firebase-app not initialized for firebase/auth'
    auth = FirebaseAuth.getAuth()
}

const createUserWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await FirebaseAuth.createUserWithEmailAndPassword(auth, email, password)
        const { user } = userCredential
        return { user } as IUserInfo
    } catch (err) {
        const { code } = err
        return { err: code } as IError
    }
}

const createUserWithEmailAndPasswordWithoutLogin = async (email, password) => {
    try {
        const currentUser = getCurrentUser()
        const { user, err } = await FirebaseAuth.createUserWithEmailAndPassword(email, password)
        if (err) throw err
        await FirebaseAuth.updateCurrentUser(currentUser)
        return { user } as IUserInfo
    } catch (err) {
        const { code } = err
        return { err: code } as IError
    }
}

const signInWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await FirebaseAuth.signInWithEmailAndPassword(auth, email, password)
        const { user } = userCredential
        return { user } as IUserInfo
    } catch (err) {
        const { code } = err
        return { err: code } as IError
    }
}

const signOut = async () => {
    try {
        await FirebaseAuth.signOut(auth)
        return 'sign out succesfully!'
    } catch (err) {
        return { err } as IError
    }
}

const formatUser = (user: IUser | null) => {
    if (!user) return user
    const { uid, email, emailVerified, photoURL, displayName, phoneNumber, accessToken } = user
    return { uid, email, emailVerified, photoURL, displayName, phoneNumber, accessToken } as IUser
}

const onAuthStateChanged = (callback) => FirebaseAuth.onAuthStateChanged(auth, (user: IUser | null) => callback(formatUser(user)))

const getCurrentUser = () => formatUser(auth.currentUser as IUser)

const updateProfile = async (data: IUserProfile) => {
    try {
        await FirebaseAuth.updateProfile(getCurrentUser(), data)
        return { user: getCurrentUser() } as IUserInfo
    } catch (err) {
        return { err } as IError
    }
}

const updateEmail = async (email: string) => {
    try {
        await FirebaseAuth.updateEmail(getCurrentUser(), email)
        return { user: getCurrentUser() } as IUserInfo
    } catch (err) {
        return { err } as IError
    }
}

const sendPasswordResetEmail = async (email: string) => {
    try {
        await FirebaseAuth.sendPasswordResetEmail(auth, email)
        return 'password reset email sent!'
    } catch (err) {
        return { err } as IError
    }
}

enum EErrorVerifyPasswordResetCode{
    Expired = 'auth/expired-action-code',
    Invalid = 'auth/invalid-action-code',
    UserDisabled = 'auth/user-disabled',
    UserNotFound = 'auth/user-not-found'
}

const verifyPasswordResetCode = async (code: string) => {
    try {
        const email = await FirebaseAuth.verifyPasswordResetCode(code)
        const err = Object.values(EErrorVerifyPasswordResetCode).find((errCode) => errCode === email)
        if (err) throw err
        return email as String
    } catch (err) {
        return { err } as IError
    }
}

export default{
    initApp,
        
    register,
    createUserWithEmailAndPassword,
    createUserWithEmailAndPasswordWithoutLogin,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    getCurrentUser,
    updateProfile,
    updateEmail,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
}