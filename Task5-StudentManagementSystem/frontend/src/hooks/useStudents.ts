import { useState, useEffect } from 'react'
import { onSnapshot, query, orderBy } from 'firebase/firestore'
import { studentsCollection, firestoreService } from '../services/firestoreService'
import type { Student } from '../types/student'

/**
 * Seed data — written to Firestore ONCE if the collection is empty.
 * After seeding, onSnapshot picks up the documents automatically.
 */
const SEED_STUDENTS: Omit<Student, 'id'>[] = [
  {
    firstName: "Abhik",
    lastName: "Mukherjee",
    email: "abhik.m@university.edu",
    enrollmentNumber: "CS-2023-0041",
    dateOfBirth: "2002-08-15",
    department: "Computer Science",
    semester: 6,
    status: "ACTIVE",
    gpa: 9.8,
    grades: [
      { id: "g1", courseId: "cs1", courseName: "Machine Learning", score: 95, gradeLetter: "A", semester: "Fall 2025", dateRecorded: "2025-12-10" }
    ],
    attendance: [{ date: "2026-06-01", status: "PRESENT" }],
    imageUrl: ""
  },
  {
    firstName: "Anjali",
    lastName: "Sharma",
    email: "anjali.s@university.edu",
    enrollmentNumber: "CS-2023-0012",
    dateOfBirth: "2003-04-10",
    department: "Computer Science",
    semester: 6,
    status: "ACTIVE",
    gpa: 9.6,
    grades: [],
    attendance: [{ date: "2026-06-01", status: "PRESENT" }, { date: "2026-06-02", status: "PRESENT" }],
    imageUrl: ""
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@university.edu",
    enrollmentNumber: "EE-2023-0105",
    dateOfBirth: "2002-12-05",
    department: "Electrical Engineering",
    semester: 6,
    status: "ACTIVE",
    gpa: 8.7,
    grades: [],
    attendance: [{ date: "2026-06-01", status: "PRESENT" }, { date: "2026-06-02", status: "ABSENT" }],
    imageUrl: ""
  },
  {
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.p@university.edu",
    enrollmentNumber: "ME-2024-0082",
    dateOfBirth: "2004-01-22",
    department: "Mechanical Engineering",
    semester: 4,
    status: "ACTIVE",
    gpa: 7.8,
    grades: [],
    attendance: [{ date: "2026-06-01", status: "LATE" }, { date: "2026-06-02", status: "PRESENT" }],
    imageUrl: ""
  },
  {
    firstName: "Rohan",
    lastName: "Das",
    email: "rohan.das@university.edu",
    enrollmentNumber: "CE-2023-0094",
    dateOfBirth: "2002-09-18",
    department: "Civil Engineering",
    semester: 6,
    status: "ACTIVE",
    gpa: 8.9,
    grades: [],
    attendance: [{ date: "2026-06-01", status: "PRESENT" }, { date: "2026-06-02", status: "PRESENT" }],
    imageUrl: ""
  },
  {
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.s@university.edu",
    enrollmentNumber: "CS-2023-0029",
    dateOfBirth: "2002-05-14",
    department: "Computer Science",
    semester: 6,
    status: "ACTIVE",
    gpa: 9.4,
    grades: [],
    attendance: [{ date: "2026-06-01", status: "PRESENT" }, { date: "2026-06-02", status: "PRESENT" }],
    imageUrl: ""
  },
  {
    firstName: "Sneha",
    lastName: "Reddy",
    email: "sneha.r@university.edu",
    enrollmentNumber: "EE-2023-0055",
    dateOfBirth: "2003-11-02",
    department: "Electrical Engineering",
    semester: 6,
    status: "ACTIVE",
    gpa: 9.2,
    grades: [],
    attendance: [{ date: "2026-06-01", status: "PRESENT" }, { date: "2026-06-02", status: "EXCUSED" }],
    imageUrl: ""
  },
  {
    firstName: "Amit",
    lastName: "Kumar",
    email: "amit.k@university.edu",
    enrollmentNumber: "CS-2024-0112",
    dateOfBirth: "2004-03-20",
    department: "Computer Science",
    semester: 4,
    status: "ACTIVE",
    gpa: 7.1,
    grades: [],
    attendance: [{ date: "2026-06-01", status: "ABSENT" }, { date: "2026-06-02", status: "ABSENT" }],
    imageUrl: ""
  }
]

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [seeded, setSeeded] = useState(false)

  // Realtime listener
  useEffect(() => {
    const q = query(studentsCollection, orderBy('firstName'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: Student[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        } as Student))

        // Seed once if the collection is empty
        if (docs.length === 0 && !seeded) {
          setSeeded(true)
          seedMockData()
          return // the seed writes will re-trigger onSnapshot
        }

        setStudents(docs)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Firestore students listener error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [seeded])

  // ── Mutations ──────────────────────────────────────────────────────

  const addStudent = async (student: Omit<Student, 'id' | 'grades' | 'attendance'> & { gpa?: number }) => {
    const payload: Omit<Student, 'id'> = {
      ...student,
      gpa: student.gpa ?? 8.0,
      grades: [],
      attendance: []
    }
    await firestoreService.addStudent(payload)
  }

  const updateStudent = async (id: string, data: Partial<Student>) => {
    await firestoreService.updateStudent(id, data)
  }

  const deleteStudent = async (id: string) => {
    await firestoreService.deleteStudent(id)
  }

  const bulkDelete = async (ids: string[]) => {
    await firestoreService.bulkDeleteStudents(ids)
  }

  const seedMockData = async () => {
    try {
      await Promise.all(SEED_STUDENTS.map((s) => firestoreService.addStudent(s)))
      console.info('Firestore: Seeded students collection with sample data.')
    } catch (err) {
      console.error('Firestore seed error:', err)
    }
  }

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkDelete,
    seedMockData
  }
}
