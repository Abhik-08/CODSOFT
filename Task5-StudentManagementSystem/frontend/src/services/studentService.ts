import { doc, getDoc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { studentsCollection } from './firestoreService'
import type { Student } from '../types/student'
import { apiClient } from './apiClient'

const mapStudent = (id: string, data: any): Student => ({
  id,
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
  attendanceRate: Number(data.attendanceRate) || 100,
  placementStatus: data.placementStatus || 'NOT_STARTED',
  offerCount: Number(data.offerCount) || 0,
  placementScore: data.placementScore,
  placementTier: data.placementTier,
  confidenceLevel: data.confidenceLevel,
  academicReadinessScore: data.academicReadinessScore,
  technicalReadinessScore: data.technicalReadinessScore,
  careerReadinessScore: data.careerReadinessScore,
  consistencyReadinessScore: data.consistencyReadinessScore,
  industryReadinessScore: data.industryReadinessScore,
  riskScore: data.riskScore,
  riskCategory: data.riskCategory,
  riskFactors: data.riskFactors || [],
  riskReasons: data.riskReasons || [],
  interventionSuggestions: data.interventionSuggestions || [],
  priorityActions: data.priorityActions || [],
  riskTrend: data.riskTrend || [],
  riskLastCalculatedAt: data.riskLastCalculatedAt,
  phone: data.phone || '',
  githubUrl: data.githubUrl || '',
  linkedinUrl: data.linkedinUrl || '',
  portfolioUrl: data.portfolioUrl || '',
  portfolioTitle: data.portfolioTitle || '',
  portfolioSummary: data.portfolioSummary || '',
})

export const studentService = {
  async getAll(): Promise<Student[]> {
    const querySnapshot = await getDocs(studentsCollection)
    const list: Student[] = []
    querySnapshot.forEach((doc) => {
      list.push(mapStudent(doc.id, doc.data()))
    })
    return list
  },

  async getById(id: string): Promise<Student> {
    const docRef = doc(db, 'students', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error(`Student with ID ${id} not found`)
    }
    return mapStudent(docSnap.id, docSnap.data())
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
    
    // Retrieve the updated student
    const docSnap = await getDoc(docRef)
    return mapStudent(docSnap.id, docSnap.data()!)
  },

  async updateWithHistory(
    id: string,
    newData: Partial<Student>,
    oldData: Student,
    _changedBy: string
  ): Promise<Student> {
    const fullStudent: Student = {
      ...oldData,
      ...newData,
    }

    const payload = {
      firstName: fullStudent.firstName,
      lastName: fullStudent.lastName,
      email: fullStudent.email,
      enrollmentNumber: fullStudent.enrollmentNumber,
      dateOfBirth: fullStudent.dateOfBirth,
      department: fullStudent.department,
      semester: Number(fullStudent.semester) || 1,
      status: fullStudent.status,
      imageUrl: fullStudent.imageUrl || '',
      gpa: Number(fullStudent.gpa) || 8,
      attendanceRate: Number(fullStudent.attendanceRate ?? 100),
      placementStatus: fullStudent.placementStatus || 'NOT_STARTED',
      offerCount: Number(fullStudent.offerCount || 0),
      phone: fullStudent.phone || '',
      githubUrl: fullStudent.githubUrl || '',
      linkedinUrl: fullStudent.linkedinUrl || '',
      portfolioUrl: fullStudent.portfolioUrl || '',
      portfolioTitle: fullStudent.portfolioTitle || '',
      portfolioSummary: fullStudent.portfolioSummary || '',
      grades: fullStudent.grades || [],
      attendance: fullStudent.attendance || []
    }

    // Call REST endpoint on backend
    await apiClient.put(`/students/firestore/${id}`, payload)

    // Retrieve the updated student
    return this.getById(id)
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'students', id)
    await deleteDoc(docRef)
  }
}
