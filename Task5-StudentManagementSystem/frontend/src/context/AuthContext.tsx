import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { authService } from '../services/authService'
import { firestoreService } from '../services/firestoreService'
import type { User } from '../types/auth'

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await firestoreService.getUserProfile(firebaseUser.uid)
          if (profile) {
            setUser(profile)
          } else {
            const provider = firebaseUser.providerData[0]?.providerId || 'google.com'
            const synced = await firestoreService.syncUserProfile(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || '',
              firebaseUser.photoURL || '',
              provider
            )
            setUser(synced)
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            provider: firebaseUser.providerData[0]?.providerId || 'password',
            role: 'STUDENT',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const fbUser = await authService.signInWithGoogle()
      const provider = fbUser.providerData[0]?.providerId || 'google.com'
      const profile = await firestoreService.syncUserProfile(
        fbUser.uid,
        fbUser.email || '',
        fbUser.displayName || '',
        fbUser.photoURL || '',
        provider
      )
      setUser(profile)
    } finally {
      setLoading(false)
    }
  }

  const registerWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const fbUser = await authService.registerWithEmail(email, password, name)
      const profile = await firestoreService.syncUserProfile(
        fbUser.uid,
        fbUser.email || '',
        name,
        '',
        'password'
      )
      setUser(profile)
    } finally {
      setLoading(false)
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true)
    try {
      const fbUser = await authService.signInWithEmail(email, password)
      const profile = await firestoreService.getUserProfile(fbUser.uid)
      if (profile) {
        setUser(profile)
      } else {
        const synced = await firestoreService.syncUserProfile(
          fbUser.uid,
          fbUser.email || '',
          fbUser.displayName || '',
          fbUser.photoURL || '',
          'password'
        )
        setUser(synced)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (displayName: string, photoURL: string) => {
    if (!user) return
    try {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        name: displayName,
        photoURL: photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true })

      setUser(prev => prev ? {
        ...prev,
        displayName: displayName,
        photoURL: photoURL
      } : null)
    } catch (err) {
      console.error('Failed to update user profile in context:', err)
      throw err
    }
  }

  const contextValue = useMemo(() => ({
    user,
    loading,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    resetPassword,
    logout,
    updateUserProfile
  }), [user, loading])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

