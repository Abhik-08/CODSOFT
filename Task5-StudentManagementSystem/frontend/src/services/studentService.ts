import { doc, getDoc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { studentsCollection } from './firestoreService'
import type { Student } from '../types/student'

export const studentService = {
  async getAll(): Promise<Student[]> {
    const querySnapshot = await getDocs(studentsCollection)
    const list: Student[] = []
    querySnapshot.forEach((doc) => {
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
    return list
  },

  async getById(id: string): Promise<Student> {
    const docRef = doc(db, 'students', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error(`Student with ID ${id} not found`)
    }
    const data = docSnap.data()
    return {
      id: docSnap.id,
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
    }
  },

  async create(student: Omit<Student, 'id'>): Promise<Student> {
    const docRef = await addDoc(studentsCollection, {
      ...student,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return {
      id: docRef.id,
      ...student
    }
  },

  async update(id: string, student: Partial<Student>): Promise<Student> {
    const docRef = doc(db, 'students', id)
    const updateData = {
      ...student,
      updatedAt: serverTimestamp()
    }
    await updateDoc(docRef, updateData)
    
    // Retrieve the updated student to return a complete Student object
    const docSnap = await getDoc(docRef)
    const data = docSnap.data()!
    return {
      id: docSnap.id,
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
    }
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'students', id)
    await deleteDoc(docRef)
  }
}

