import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    sendPasswordResetEmail,
    signOut,
    updateCurrentUser
} from 'firebase/auth'

interface IUserProfile {
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

const auth = getAuth()

const createUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const { user } = userCredential
        return { user } as IUserInfo
    } catch (err) {
        return { err } as IError
    }
}

const createUserWithoutLogin = async (email, password) => {
    try {
        const currentUser = getCurrentUser()
        const { user, err } = await createUser(email, password)
        if (err) throw err
        await updateCurrentUser(currentUser)
        return { user } as IUserInfo
    } catch (err) {
        return { err } as IError
    }
}

const signInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const { user } = userCredential
        return { user } as IUserInfo
    } catch (err) {
        return { err } as IError
    }
}

const signOutUser = async () => {
    try {
        await signOut(auth)
        return 'sign out succesfully!'
    } catch (err) {
        return { err } as IError
    }
}

const subscribeAuthState = (callback) => onAuthStateChanged(auth, (user: IUser | null) => callback(user?.uid))

const getCurrentUser = () => auth.currentUser as IUser

const updateUserProfile = async (data: IUserProfile) => {
    try {
        await updateProfile(getCurrentUser(), data)
        return { user: getCurrentUser() } as IUserInfo
    } catch (err) {
        return { err } as IError
    }
}

const updateUserEmail = async (email: string) => {
    try {
        await updateEmail(getCurrentUser(), email)
        return { user: getCurrentUser() } as IUserInfo
    } catch (err) {
        return { err } as IError
    }
}

const requestPasswordResetEmail = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email)
        return 'password reset email sent!'
    } catch (err) {
        return { err } as IError
    }
}

const checkPasswordResetCode = async (code: string) => {
    try {
        await verifyPasswordResetCode(code)
        return 'password reset code verified successfully!'
    } catch (err) {
        return { err } as IError
    }
}

export default{
    createUser,
    createUserWithoutLogin,
    signInUser,
    signOutUser,
    subscribeAuthState,
    getCurrentUser,
    updateUserProfile,
    updateUserEmail,
    requestPasswordResetEmail,
    checkPasswordResetCode
}