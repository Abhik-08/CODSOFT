import {
  collection,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type {
  SemesterRecord,
  SubjectRecord,
  Certificate,
  Project,
  Achievement,
  Skill,
  PlacementStatus,
  HistoryRecord
} from '../types/student'

import { apiClient } from './apiClient'

// ── Subcollection reference helpers ─────────────────────────────────

function subcol(studentId: string, name: string) {
  return collection(db, 'students', studentId, name)
}

// ── Generic subcollection CRUD ──────────────────────────────────────

async function addSubDoc<T extends Record<string, unknown>>(
  studentId: string,
  subcollection: string,
  data: T
): Promise<string> {
  const response = await apiClient.post(`/students/${studentId}/${subcollection}`, data)
  return response.data.id
}

async function updateSubDoc<T extends Record<string, unknown>>(
  studentId: string,
  subcollection: string,
  docId: string,
  data: T
): Promise<void> {
  await apiClient.put(`/students/${studentId}/${subcollection}/${docId}`, data)
}

async function deleteSubDoc(
  studentId: string,
  subcollection: string,
  docId: string
): Promise<void> {
  await apiClient.delete(`/students/${studentId}/${subcollection}/${docId}`)
}

function subscribeToSubcollection<T>(
  studentId: string,
  subcollectionName: string,
  callback: (items: T[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(subcol(studentId, subcollectionName), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const items: T[] = []
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as T)
      })
      callback(items)
    },
    (err) => {
      // Gracefully handle permission errors for subcollections that don't exist yet
      if (err.code === 'failed-precondition' || err.code === 'permission-denied') {
        callback([])
      } else if (onError) {
        onError(err)
      } else {
        console.error(`Subcollection ${subcollectionName} error:`, err)
        callback([])
      }
    }
  )
}

// ── Semester Records ────────────────────────────────────────────────

export const semesterService = {
  subscribe(studentId: string, cb: (items: SemesterRecord[]) => void, onErr?: (e: Error) => void) {
    return subscribeToSubcollection<SemesterRecord>(studentId, 'semesters', cb, onErr)
  },
  async add(studentId: string, data: Omit<SemesterRecord, 'id' | 'createdAt'>) {
    return addSubDoc(studentId, 'semesters', data as Record<string, unknown>)
  },
  async update(studentId: string, docId: string, data: Partial<SemesterRecord>) {
    const rest = { ...data }
    delete (rest as any).id
    delete (rest as any).createdAt
    return updateSubDoc(studentId, 'semesters', docId, rest as Record<string, unknown>)
  },
  async delete(studentId: string, docId: string) {
    return deleteSubDoc(studentId, 'semesters', docId)
  }
}

// ── Subject Records ─────────────────────────────────────────────────

export const subjectService = {
  subscribe(studentId: string, cb: (items: SubjectRecord[]) => void, onErr?: (e: Error) => void) {
    return subscribeToSubcollection<SubjectRecord>(studentId, 'subjects', cb, onErr)
  },
  async add(studentId: string, data: Omit<SubjectRecord, 'id' | 'createdAt'>) {
    return addSubDoc(studentId, 'subjects', data as Record<string, unknown>)
  },
  async update(studentId: string, docId: string, data: Partial<SubjectRecord>) {
    const rest = { ...data }
    delete (rest as any).id
    delete (rest as any).createdAt
    return updateSubDoc(studentId, 'subjects', docId, rest as Record<string, unknown>)
  },
  async delete(studentId: string, docId: string) {
    return deleteSubDoc(studentId, 'subjects', docId)
  }
}

// ── Certificates ────────────────────────────────────────────────────

export const certificateService = {
  subscribe(studentId: string, cb: (items: Certificate[]) => void, onErr?: (e: Error) => void) {
    return subscribeToSubcollection<Certificate>(studentId, 'certificates', cb, onErr)
  },
  async add(studentId: string, data: Omit<Certificate, 'id' | 'createdAt'>) {
    return addSubDoc(studentId, 'certificates', data as Record<string, unknown>)
  },
  async update(studentId: string, docId: string, data: Partial<Certificate>) {
    const rest = { ...data }
    delete (rest as any).id
    delete (rest as any).createdAt
    return updateSubDoc(studentId, 'certificates', docId, rest as Record<string, unknown>)
  },
  async delete(studentId: string, docId: string) {
    return deleteSubDoc(studentId, 'certificates', docId)
  }
}

// ── Projects ────────────────────────────────────────────────────────

export const projectService = {
  subscribe(studentId: string, cb: (items: Project[]) => void, onErr?: (e: Error) => void) {
    return subscribeToSubcollection<Project>(studentId, 'projects', cb, onErr)
  },
  async add(studentId: string, data: Omit<Project, 'id' | 'createdAt'>) {
    return addSubDoc(studentId, 'projects', data as Record<string, unknown>)
  },
  async update(studentId: string, docId: string, data: Partial<Project>) {
    const rest = { ...data }
    delete (rest as any).id
    delete (rest as any).createdAt
    return updateSubDoc(studentId, 'projects', docId, rest as Record<string, unknown>)
  },
  async delete(studentId: string, docId: string) {
    return deleteSubDoc(studentId, 'projects', docId)
  }
}

// ── Achievements ────────────────────────────────────────────────────

export const achievementService = {
  subscribe(studentId: string, cb: (items: Achievement[]) => void, onErr?: (e: Error) => void) {
    return subscribeToSubcollection<Achievement>(studentId, 'achievements', cb, onErr)
  },
  async add(studentId: string, data: Omit<Achievement, 'id' | 'createdAt'>) {
    return addSubDoc(studentId, 'achievements', data as Record<string, unknown>)
  },
  async update(studentId: string, docId: string, data: Partial<Achievement>) {
    const rest = { ...data }
    delete (rest as any).id
    delete (rest as any).createdAt
    return updateSubDoc(studentId, 'achievements', docId, rest as Record<string, unknown>)
  },
  async delete(studentId: string, docId: string) {
    return deleteSubDoc(studentId, 'achievements', docId)
  }
}

// ── Skills ──────────────────────────────────────────────────────────

export const skillService = {
  subscribe(studentId: string, cb: (items: Skill[]) => void, onErr?: (e: Error) => void) {
    return subscribeToSubcollection<Skill>(studentId, 'skills', cb, onErr)
  },
  async add(studentId: string, data: Omit<Skill, 'id' | 'createdAt'>) {
    return addSubDoc(studentId, 'skills', data as Record<string, unknown>)
  },
  async update(studentId: string, docId: string, data: Partial<Skill>) {
    const rest = { ...data }
    delete (rest as any).id
    delete (rest as any).createdAt
    return updateSubDoc(studentId, 'skills', docId, rest as Record<string, unknown>)
  },
  async delete(studentId: string, docId: string) {
    return deleteSubDoc(studentId, 'skills', docId)
  }
}

// ── Placement Status (stored on the student document itself) ────────

export const placementService = {
  async updateStatus(studentId: string, status: PlacementStatus, offerCount: number) {
    await apiClient.put(`/students/${studentId}/placement`, {
      placementStatus: status,
      offerCount
    })
  }
}

// ── Profile Change History ──────────────────────────────────────────
export const historyService = {
  subscribe(studentId: string, cb: (items: HistoryRecord[]) => void, onErr?: (e: Error) => void) {
    return subscribeToSubcollection<HistoryRecord>(studentId, 'changeHistory', cb, onErr)
  }
}
