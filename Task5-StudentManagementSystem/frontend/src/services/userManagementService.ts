import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { User } from '../types/auth'

/** The permanent super admin — cannot be modified by anyone */
export const SUPER_ADMIN_EMAIL = 'abhikmukherjee2003@gmail.com'

export interface ManagedUser extends User {
  name?: string
}

export interface UserAuditLog {
  id?: string
  action: string
  targetUser: {
    uid: string
    email: string
    displayName: string
  }
  performedBy: {
    uid: string
    email: string
    displayName: string
  }
  timestamp: string
  details: string
}

export const userManagementService = {
  /**
   * Helper to write an audit log
   */
  async writeAuditLog(
    action: string,
    targetUser: { uid: string; email: string; displayName: string },
    performedBy: { uid: string; email: string; displayName: string },
    details: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'user_audit_logs'), {
        action,
        targetUser,
        performedBy,
        timestamp: serverTimestamp(),
        details
      })
    } catch (err) {
      console.error('Failed to write audit log:', err)
    }
  },

  /**
   * Fetch all platform users from the Firestore users collection.
   * Normalises legacy TEACHER roles to STUDENT.
   */
  async getAllUsers(): Promise<ManagedUser[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => {
      const data = d.data() as any
      const role: 'ADMIN' | 'STUDENT' = data.role === 'ADMIN' ? 'ADMIN' : 'STUDENT'
      return {
        uid: d.id,
        email: data.email || '',
        displayName: data.displayName || data.name || '',
        name: data.name || data.displayName || '',
        photoURL: data.photoURL || '',
        provider: data.provider || 'password',
        role,
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000).toISOString()
          : new Date().toISOString(),
        lastLogin: data.updatedAt?.seconds
          ? new Date(data.updatedAt.seconds * 1000).toISOString()
          : new Date().toISOString()
      }
    })
  },

  /** Promote a student to admin. Blocked for the super admin (no-op). */
  async promoteToAdmin(
    uid: string,
    email: string,
    performedBy: { uid: string; email: string; displayName: string }
  ): Promise<void> {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return
    await updateDoc(doc(db, 'users', uid), {
      role: 'ADMIN',
      updatedAt: serverTimestamp()
    })
    await this.writeAuditLog(
      'User Promoted',
      { uid, email, displayName: '' },
      performedBy,
      `Promoted to role ADMIN`
    )
  },

  /** Demote an admin to student. Blocked for the super admin. */
  async demoteToStudent(
    uid: string,
    email: string,
    performedBy: { uid: string; email: string; displayName: string }
  ): Promise<void> {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return
    await updateDoc(doc(db, 'users', uid), {
      role: 'STUDENT',
      updatedAt: serverTimestamp()
    })
    await this.writeAuditLog(
      'User Demoted',
      { uid, email, displayName: '' },
      performedBy,
      `Demoted to role STUDENT`
    )
  },

  /** Enable or disable a user account. Blocked for the super admin. */
  async setUserActive(
    uid: string,
    email: string,
    isActive: boolean,
    performedBy: { uid: string; email: string; displayName: string }
  ): Promise<void> {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return
    await updateDoc(doc(db, 'users', uid), {
      isActive,
      updatedAt: serverTimestamp()
    })
    await this.writeAuditLog(
      isActive ? 'User Enabled' : 'User Disabled',
      { uid, email, displayName: '' },
      performedBy,
      isActive ? `Account enabled` : `Account disabled`
    )
  },

  /** Permanently delete a user account doc. Blocked for the super admin. */
  async deleteUser(
    uid: string,
    email: string,
    performedBy: { uid: string; email: string; displayName: string }
  ): Promise<void> {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return
    await deleteDoc(doc(db, 'users', uid))
    await this.writeAuditLog(
      'User Deleted',
      { uid, email, displayName: '' },
      performedBy,
      `Account permanently deleted from workspace registry`
    )
  },

  /** Fetch all audit logs sorted by timestamp desc */
  async getAuditLogs(): Promise<UserAuditLog[]> {
    const q = query(collection(db, 'user_audit_logs'), orderBy('timestamp', 'desc'), limit(150))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        action: data.action || '',
        targetUser: data.targetUser || { uid: '', email: '', displayName: '' },
        performedBy: data.performedBy || { uid: '', email: '', displayName: '' },
        timestamp: data.timestamp?.seconds
          ? new Date(data.timestamp.seconds * 1000).toISOString()
          : new Date().toISOString(),
        details: data.details || ''
      }
    })
  }
}
