export interface Grade {
  id: string;
  courseId: string;
  courseName: string;
  score: number;
  gradeLetter: string;
  semester: string;
  dateRecorded: string;
}

export interface Attendance {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface SemesterData {
  semesterName: string;
  gpa: number;
  courses: string[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentNumber: string;
  dateOfBirth: string;
  department: string;
  semester: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
  grades: Grade[];
  attendance: Attendance[];
  imageUrl?: string;
  gpa: number;
  attendanceRate?: number;
  semesters?: SemesterData[];
}
