import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
    createUserWithEmailAndPassword,
    deleteUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [profile, setProfile] = useState(null) // our DB user; null = logged out
    const [loading, setLoading] = useState(true)
    const busy = useRef(false) // true while login/signup loads the profile itself

    // Runs on page load and whenever Firebase's login state changes
    useEffect(() => {
        return onAuthStateChanged(auth, async (fbUser) => {
            if (busy.current) return
            if (!fbUser) {
                setProfile(null)
            } else {
                try {
                    setProfile(await api('/api/me'))
                } catch (e) {
                    if (e.status === 404) await signOut(auth)
                    setProfile(null)
                }
            }
            setLoading(false)
        })
    }, [])

    async function login(email, password) {
        busy.current = true
        try {
            await signInWithEmailAndPassword(auth, email, password)
            try {
                setProfile(await api('/api/me'))
            } catch (e) {
                await signOut(auth)
                throw e.status === 404 ? new Error('This account has no profile. Please sign up.') : e
            }
        } finally {
            busy.current = false
        }
    }

    async function signup({ name, email, password, role }) {
        busy.current = true
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password)
            try {
                setProfile(await api('/api/register', { method: 'POST', body: { name, role } }))
            } catch (e) {
                await deleteUser(cred.user) // don't leave a Firebase account with no profile
                throw e
            }
        } finally {
            busy.current = false
        }
    }

    const logout = () => signOut(auth)

    return (
        <AuthContext.Provider value={{ profile, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)