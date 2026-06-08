import { useState, useEffect } from 'react'
import type { Student } from '../types/student'
import { studentService } from '../services/studentService'

// Robust mock database of students for fallback / placeholder
export const MOCK_STUDENTS: Student[] = [
  {
    id: "1",
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
    id: "2",
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
    attendance: [],
    imageUrl: ""
  },
  {
    id: "3",
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
    attendance: [],
    imageUrl: ""
  },
  {
    id: "4",
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
    attendance: [],
    imageUrl: ""
  },
  {
    id: "5",
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
    attendance: [],
    imageUrl: ""
  },
  {
    id: "6",
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
    attendance: [],
    imageUrl: ""
  },
  {
    id: "7",
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
    attendance: [],
    imageUrl: ""
  },
  {
    id: "8",
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
    attendance: [],
    imageUrl: ""
  }
]

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await studentService.getAll()
      if (data && data.length > 0) {
        setStudents(data)
      } else {
        setStudents(MOCK_STUDENTS)
      }
    } catch (err: any) {
      console.warn("Using mock student fallback due to API fetch failure:", err)
      setStudents(MOCK_STUDENTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    loading,
    error,
    refresh: fetchStudents
  }
}
