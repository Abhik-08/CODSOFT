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
import type { Portfolio } from '../types/portfolio'

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
  //  USER OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  /** Permanent super admin email — always retains ADMIN role */
  SUPER_ADMIN_EMAIL: 'abhikmukherjee2003@gmail.com',

  /**
   * Syncs user login details to the 'users' Firestore collection.
   * On first login, seeds role: super admin → ADMIN, everyone else → STUDENT.
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
    const isSuperAdmin = (email || '').toLowerCase() === firestoreService.SUPER_ADMIN_EMAIL
    let finalProfile: User

    if (userSnapshot.exists()) {
      const existingData = userSnapshot.data() as any
      // Super admin always retains ADMIN; everyone else keeps stored role or defaults to STUDENT
      const userRole: 'ADMIN' | 'STUDENT' = isSuperAdmin
        ? 'ADMIN'
        : (existingData.role === 'ADMIN' ? 'ADMIN' : 'STUDENT')

      const updateData = {
        updatedAt: serverTimestamp(),
        displayName: name || existingData.displayName || existingData.name || 'User',
        photoURL: photoURL || existingData.photoURL || '',
        role: userRole,
        isActive: existingData.isActive !== false
      }

      await setDoc(userDocRef, updateData, { merge: true })

      finalProfile = {
        uid,
        email: existingData.email || email,
        displayName: updateData.displayName,
        photoURL: updateData.photoURL,
        provider: existingData.provider || provider,
        role: userRole,
        isActive: updateData.isActive,
        createdAt: existingData.createdAt
          ? new Date(existingData.createdAt.seconds * 1000).toISOString()
          : currentTime,
        lastLogin: currentTime
      }
    } else {
      // First login — seed user document
      const defaultRole: 'ADMIN' | 'STUDENT' = isSuperAdmin ? 'ADMIN' : 'STUDENT'
      const newUserData = {
        uid,
        displayName: name || 'User',
        name: name || 'User',
        email: email || '',
        photoURL: photoURL || '',
        provider: provider || 'password',
        role: defaultRole,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(userDocRef, newUserData)

      finalProfile = {
        uid,
        email: newUserData.email,
        displayName: newUserData.displayName,
        photoURL: newUserData.photoURL,
        provider: newUserData.provider,
        role: newUserData.role,
        isActive: true,
        createdAt: currentTime,
        lastLogin: currentTime
      }
    }

    return finalProfile
  },

  /**
   * Fetches user profile from Firestore by UID.
   * Normalises any legacy TEACHER role to STUDENT.
   */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userSnapshot = await getDoc(userDocRef)
      if (!userSnapshot.exists()) return null

      const data = userSnapshot.data() as FirestoreUser
      // Normalise any legacy TEACHER values → STUDENT
      const role: 'ADMIN' | 'STUDENT' = data.role === 'ADMIN' ? 'ADMIN' : 'STUDENT'

      return {
        uid,
        email: data.email || '',
        displayName: data.displayName || (data as any).name || '',
        photoURL: data.photoURL || '',
        provider: data.provider || 'password',
        role,
        isActive: data.isActive !== false,
        createdAt: data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toISOString()
          : new Date().toISOString(),
        lastLogin: data.updatedAt
          ? new Date(data.updatedAt.seconds * 1000).toISOString()
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
  async addPortfolio(portfolio: Omit<Portfolio, 'id'>): Promise<string> {
    const docRef = await addDoc(portfoliosCollection, {
      ...portfolio,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  },

  /**
   * Updates an existing portfolio document
   */
  async updatePortfolio(id: string, data: Partial<Portfolio>): Promise<void> {
    const portfolioRef = doc(db, 'portfolios', id)
    await updateDoc(portfolioRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  /**
   * Deletes an existing portfolio document
   */
  async deletePortfolio(id: string): Promise<void> {
    const portfolioRef = doc(db, 'portfolios', id)
    await deleteDoc(portfolioRef)
  }
}
