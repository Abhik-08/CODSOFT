import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { User, FirestoreUser } from '../types/auth'
import type { Student } from '../types/student'

// ─── Collection References ───────────────────────────────────────────
export const usersCollection = collection(db, 'users')
export const studentsCollection = collection(db, 'students')
export const portfoliosCollection = collection(db, 'portfolios')

/**
 * Firestore Service Layer
 * Reusable database operations for EduVault AI.
 */
export const firestoreService = {

  // ═══════════════════════════════════════════════════════════════════
  //  USER OPERATIONS (existing — unchanged)
  // ═══════════════════════════════════════════════════════════════════

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
  },

  // ═══════════════════════════════════════════════════════════════════
  //  STUDENT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Adds a new student document to Firestore
   */
  async addStudent(student: Omit<Student, 'id'>): Promise<string> {
    const docRef = await addDoc(studentsCollection, {
      ...student,
      createdAt: serverTimestamp()
    })
    return docRef.id
  },

  /**
   * Updates an existing student document
   */
  async updateStudent(id: string, data: Partial<Student>): Promise<void> {
    const studentRef = doc(db, 'students', id)
    await updateDoc(studentRef, { ...data, updatedAt: serverTimestamp() })
  },

  /**
   * Deletes a single student document
   */
  async deleteStudent(id: string): Promise<void> {
    const studentRef = doc(db, 'students', id)
    await deleteDoc(studentRef)
  },

  /**
   * Bulk deletes multiple student documents in a batch
   */
  async bulkDeleteStudents(ids: string[]): Promise<void> {
    const batch = writeBatch(db)
    ids.forEach((id) => {
      const studentRef = doc(db, 'students', id)
      batch.delete(studentRef)
    })
    await batch.commit()
  },

  // ═══════════════════════════════════════════════════════════════════
  //  PORTFOLIO OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Adds a new portfolio document to Firestore
   */
  async addPortfolio(portfolio: {
    studentName: string
    template: string
    theme: string
    deployed: boolean
    deployUrl?: string
  }): Promise<string> {
    const docRef = await addDoc(portfoliosCollection, {
      ...portfolio,
      createdAt: serverTimestamp()
    })
    return docRef.id
  },

  /**
   * Updates an existing portfolio document
   */
  async updatePortfolio(id: string, data: Record<string, unknown>): Promise<void> {
    const portfolioRef = doc(db, 'portfolios', id)
    await updateDoc(portfolioRef, data)
  }
}
