
let auth

const setAuthenticator = (authenticator: T) => auth = authenticator

const initApp = (credentials) => auth?.initApp(credentials)

const register = () => auth?.register()

const createUserWithEmailAndPassword = (email, password) => auth?.createUserWithEmailAndPassword(email, password)

const createUserWithEmailAndPasswordWithoutLogin = (email, password) => auth?.createUserWithEmailAndPasswordWithoutLogin(email, password)

const signInWithEmailAndPassword = (email, password) => auth?.signInWithEmailAndPassword(email, password)

const signOut = () => auth?.signOut()

const onAuthStateChanged = (callback) => auth?.onAuthStateChanged(callback)

const getCurrentUser = () => auth?.getCurrentUser()

const updateProfile = (data: T) => auth?.updateProfile(data)

const updateEmail = (email: string) => auth?.updateEmail(email)

const sendPasswordResetEmail = (email: string) => auth?.sendPasswordResetEmail(email)

const verifyPasswordResetCode = (code: string) => auth?.verifyPasswordResetCode(code)

export const AAuth = {
    initApp,
    
    setAuthenticator,
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