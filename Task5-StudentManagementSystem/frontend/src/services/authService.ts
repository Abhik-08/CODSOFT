import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { auth } from '../firebase/firebase'

const googleProvider = new GoogleAuthProvider()

/**
 * Authentication Service Layer
 * Wraps Firebase Client Authentication actions.
 */
export const authService = {
  /**
   * Triggers a Google Popup Sign-In flow
   */
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err: any) {
      console.error('Firebase Google Sign-In Error:', err)
      throw new Error(err.message || 'Google authentication failed.')
    }
  },

  /**
   * Signs in with local credentials (email & password)
   */
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (err: any) {
      console.error('Firebase Email Login Error:', err)
      throw new Error(err.message || 'Authentication with email/password failed.')
    }
  },

  /**
   * Registers a new account, sets the display name on the profile
   */
  async registerWithEmail(email: string, password: string, name: string): Promise<FirebaseUser> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      return result.user
    } catch (err: any) {
      console.error('Firebase Email Register Error:', err)
      throw new Error(err.message || 'Registration with email/password failed.')
    }
  },

  /**
   * Sends a password reset email link
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err: any) {
      console.error('Firebase Password Reset Error:', err)
      throw new Error(err.message || 'Failed to dispatch password reset request.')
    }
  },

  /**
   * Logs out the currently authenticated user session
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (err: any) {
      console.error('Firebase Sign-Out Error:', err)
      throw new Error(err.message || 'Sign out action failed.')
    }
  },

  /**
   * Resolves the current session state via a one-time promise wrapper
   */
  getCurrentUser(): Promise<FirebaseUser | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe()
          resolve(user)
        },
        (error) => {
          unsubscribe()
          reject(error)
        }
      )
    })
  }
}
