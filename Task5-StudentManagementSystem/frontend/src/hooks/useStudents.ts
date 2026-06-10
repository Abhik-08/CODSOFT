import { useState, useEffect } from 'react'
import { onSnapshot, query } from 'firebase/firestore'
import { studentsCollection, firestoreService } from '../services/firestoreService'
import { studentService } from '../services/studentService'
import type { Student } from '../types/student'

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const q = query(studentsCollection)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Student[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        list.push({
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          enrollmentNumber: data.enrollmentNumber || '',
          dateOfBirth: data.dateOfBirth || '',
          department: data.department || '',
          semester: Number(data.semester) || 1,
          status: data.status || 'ACTIVE',
          grades: data.grades || [],
          attendance: data.attendance || [],
          imageUrl: data.imageUrl || '',
          gpa: Number(data.gpa) || 0,
          attendanceRate: Number(data.attendanceRate) || 100
        })
      })

      // Sort alphabetically client-side to ensure a stable presentation
      list.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })

      setStudents(list)
      setLoading(false)
      setError(null)
    }, (err) => {
      console.error('Firestore registry subscription error:', err)
      setError(err.message || 'Failed to sync student registry from Firestore.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addStudent = async (student: Omit<Student, 'id' | 'grades' | 'attendance' | 'gpa'> & { gpa?: number }) => {
    setError(null)
    try {
      const payload = {
        ...student,
        gpa: student.gpa ?? 8,
        grades: [],
        attendance: []
      }
      await studentService.create(payload)
    } catch (err: any) {
      console.error('Failed to add student:', err)
      setError(err.message || 'Failed to create student.')
      throw err
    }
  }

  const updateStudent = async (id: string, data: Partial<Student>) => {
    setError(null)
    try {
      await studentService.update(id, data)
    } catch (err: any) {
      console.error('Failed to update student:', err)
      setError(err.message || 'Failed to update student.')
      throw err
    }
  }

  const deleteStudent = async (id: string) => {
    setError(null)
    try {
      await studentService.delete(id)
    } catch (err: any) {
      console.error('Failed to delete student:', err)
      setError(err.message || 'Failed to delete student.')
      throw err
    }
  }

  const bulkDelete = async (ids: string[]) => {
    setError(null)
    try {
      await firestoreService.bulkDeleteStudents(ids)
    } catch (err: any) {
      console.error('Failed bulk delete:', err)
      setError(err.message || 'Failed bulk delete operation.')
      throw err
    }
  }

  const seedMockData = async () => {
    console.info('Mock data seeding is managed by the backend on startup listener.')
  }

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkDelete,
    seedMockData,
    refresh: () => {}
  }
}

