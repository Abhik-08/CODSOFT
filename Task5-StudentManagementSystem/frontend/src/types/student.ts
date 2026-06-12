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

// ── Academic Profile Types ──────────────────────────────────────────

export interface SemesterRecord {
  id?: string;
  semesterNumber: number;
  sgpa: number;
  cgpa: number;
  attendance: number;
  academicYear: string;
  remarks?: string;
  createdAt?: string;
}

export interface SubjectRecord {
  id?: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  marks: number;
  grade: string;
  semester: number;
  createdAt?: string;
}

export interface Certificate {
  id?: string;
  title: string;
  issuer: string;
  issueDate: string;
  certificateUrl?: string;
  createdAt?: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  createdAt?: string;
}

export interface Achievement {
  id?: string;
  title: string;
  description?: string;
  date?: string;
  createdAt?: string;
}

export interface Skill {
  id?: string;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Tools' | 'Languages';
  proficiency?: number;
  createdAt?: string;
}

export type PlacementStatus = 'NOT_STARTED' | 'PREPARING' | 'INTERVIEWING' | 'PLACED';

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
  placementStatus?: PlacementStatus;
  offerCount?: number;
  placementScore?: number;
  placementTier?: string;
  strengths?: string[];
  weaknesses?: string[];
  skillGaps?: string[];
  careerGaps?: string[];
  projectGaps?: string[];
  certificationGaps?: string[];
  recommendations?: string[];
  careerInsights?: string[];
  growthRoadmap?: string[];
  confidenceLevel?: number;
  lastCalculatedAt?: string;
  academicReadinessScore?: number;
  technicalReadinessScore?: number;
  careerReadinessScore?: number;
  consistencyReadinessScore?: number;
  industryReadinessScore?: number;

  riskScore?: number;
  riskCategory?: string;
  riskFactors?: string[];
  riskReasons?: string[];
  interventionSuggestions?: string[];
  priorityActions?: string[];
  riskTrend?: number[];
  riskLastCalculatedAt?: string;

  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  portfolioTitle?: string;
  portfolioSummary?: string;
}

export interface HistoryRecord {
  id?: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  createdAt?: any;
  changedAt?: any;
}

export interface RiskReport {
  studentId: string;
  studentName: string;
  riskScore: number;
  riskCategory: string;
  riskFactors: string[];
  riskReasons: string[];
  interventionSuggestions: string[];
  priorityActions: string[];
  riskTrend: number[];
  lastCalculatedAt: string;
}
