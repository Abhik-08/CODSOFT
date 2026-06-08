import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { User, FirestoreUser } from '../types/auth'

// Reusable Collection References
export const usersCollection = collection(db, 'users')
export const studentsCollection = collection(db, 'students')

/**
 * Firestore Service Layer
 * Reusable database operations for EduVault AI.
 */
export const firestoreService = {
  /**
   * Syncs user login details to the 'users' Firestore collection
   */
  async syncUserProfile(
    uid: string,
    email: string,
    name: string,
    photoURL: string,
    provider: string
  ): Promise<User> {
    const userDocRef = doc(db, 'users', uid)
    const userSnapshot = await getDoc(userDocRef)

    const currentTime = new Date().toISOString()
    let finalProfile: User

    if (userSnapshot.exists()) {
      // Pre-existing account, update last login metadata
      const existingData = userSnapshot.data() as FirestoreUser
      const updateData = {
        lastLogin: serverTimestamp(),
        name: name || existingData.name || 'User',
        photoURL: photoURL || existingData.photoURL || ''
      }

      await setDoc(userDocRef, updateData, { merge: true })

      finalProfile = {
        uid,
        email: existingData.email || email,
        displayName: updateData.name,
        photoURL: updateData.photoURL,
        provider: existingData.provider || provider,
        role: existingData.role || 'STUDENT',
        createdAt: existingData.createdAt
          ? new Date(existingData.createdAt.seconds * 1000).toISOString()
          : currentTime,
        lastLogin: currentTime
      }
    } else {
      // New registration, create document
      const newUserData: FirestoreUser = {
        uid,
        name: name || 'User',
        email: email || '',
        photoURL: photoURL || '',
        provider: provider || 'password',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'STUDENT' // Default privilege level
      }
      
      await setDoc(userDocRef, newUserData)

      finalProfile = {
        uid,
        email: newUserData.email,
        displayName: newUserData.name,
        photoURL: newUserData.photoURL,
        provider: newUserData.provider,
        role: newUserData.role,
        createdAt: currentTime,
        lastLogin: currentTime
      }
    }

    return finalProfile
  },

  /**
   * Fetches user profile from Firestore by UID
   */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userSnapshot = await getDoc(userDocRef)
      if (!userSnapshot.exists()) return null
      
      const data = userSnapshot.data() as FirestoreUser
      return {
        uid,
        email: data.email || '',
        displayName: data.name || '',
        photoURL: data.photoURL || '',
        provider: data.provider || 'password',
        role: data.role || 'STUDENT',
        createdAt: data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toISOString()
          : new Date().toISOString(),
        lastLogin: data.lastLogin
          ? new Date(data.lastLogin.seconds * 1000).toISOString()
          : new Date().toISOString()
      }
    } catch (err) {
      console.error('Error in getUserProfile:', err)
      return null
    }
  }
}
