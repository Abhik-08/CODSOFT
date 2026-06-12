import { useState, useEffect } from 'react'
import type {
  SemesterRecord,
  SubjectRecord,
  Certificate,
  Project,
  Achievement,
  Skill,
  HistoryRecord
} from '../types/student'
import {
  semesterService,
  subjectService,
  certificateService,
  projectService,
  achievementService,
  skillService,
  historyService
} from '../services/academicProfileService'
import { apiClient } from '../services/apiClient'

export interface AcademicProfileState {
  semesters: SemesterRecord[]
  subjects: SubjectRecord[]
  certificates: Certificate[]
  projects: Project[]
  achievements: Achievement[]
  skills: Skill[]
  loading: boolean
  error: string | null
}

export const useAcademicProfile = (studentId: string | undefined) => {
  const [semesters, setSemesters] = useState<SemesterRecord[]>([])
  const [subjects, setSubjects] = useState<SubjectRecord[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    let loadedCount = 0
    const totalSubscriptions = 7

    const checkLoaded = () => {
      loadedCount++
      if (loadedCount >= totalSubscriptions) {
        setLoading(false)
      }
    }

    const handleError = (err: Error) => {
      console.error('Academic profile subscription error:', err)
      setError(err.message)
      checkLoaded()
    }

    const unsub1 = semesterService.subscribe(
      studentId,
      (items) => { setSemesters(items); checkLoaded() },
      handleError
    )
    const unsub2 = subjectService.subscribe(
      studentId,
      (items) => { setSubjects(items); checkLoaded() },
      handleError
    )
    const unsub3 = certificateService.subscribe(
      studentId,
      (items) => { setCertificates(items); checkLoaded() },
      handleError
    )
    const unsub4 = projectService.subscribe(
      studentId,
      (items) => { setProjects(items); checkLoaded() },
      handleError
    )
    const unsub5 = achievementService.subscribe(
      studentId,
      (items) => { setAchievements(items); checkLoaded() },
      handleError
    )
    const unsub6 = skillService.subscribe(
      studentId,
      (items) => { setSkills(items); checkLoaded() },
      handleError
    )
    const unsub7 = historyService.subscribe(
      studentId,
      (items) => { setHistory(items); checkLoaded() },
      handleError
    )

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      unsub5()
      unsub6()
      unsub7()
    }
  }, [studentId])

  // Helper to trigger placement intelligence and academic risk recalculation on backend
  const triggerRecalculate = async () => {
    if (!studentId) return
    try {
      await apiClient.post(`/students/${studentId}/placement-intelligence/recalculate`)
      await apiClient.post(`/students/${studentId}/academic-risk/recalculate`)
    } catch (err) {
      console.error('Failed to trigger recalculation:', err)
    }
  }

  // ── Semester CRUD ─────────────────────────────────────────────────

  const addSemester = async (data: Omit<SemesterRecord, 'id' | 'createdAt'>) => {
    if (!studentId) return
    await semesterService.add(studentId, data)
    void triggerRecalculate()
  }

  const updateSemester = async (docId: string, data: Partial<SemesterRecord>) => {
    if (!studentId) return
    await semesterService.update(studentId, docId, data)
    void triggerRecalculate()
  }

  const deleteSemester = async (docId: string) => {
    if (!studentId) return
    await semesterService.delete(studentId, docId)
    void triggerRecalculate()
  }

  // ── Subject CRUD ──────────────────────────────────────────────────

  const addSubject = async (data: Omit<SubjectRecord, 'id' | 'createdAt'>) => {
    if (!studentId) return
    await subjectService.add(studentId, data)
    void triggerRecalculate()
  }

  const updateSubject = async (docId: string, data: Partial<SubjectRecord>) => {
    if (!studentId) return
    await subjectService.update(studentId, docId, data)
    void triggerRecalculate()
  }

  const deleteSubject = async (docId: string) => {
    if (!studentId) return
    await subjectService.delete(studentId, docId)
    void triggerRecalculate()
  }

  // ── Certificate CRUD ──────────────────────────────────────────────

  const addCertificate = async (data: Omit<Certificate, 'id' | 'createdAt'>) => {
    if (!studentId) return
    await certificateService.add(studentId, data)
    void triggerRecalculate()
  }

  const updateCertificate = async (docId: string, data: Partial<Certificate>) => {
    if (!studentId) return
    await certificateService.update(studentId, docId, data)
    void triggerRecalculate()
  }

  const deleteCertificate = async (docId: string) => {
    if (!studentId) return
    await certificateService.delete(studentId, docId)
    void triggerRecalculate()
  }

  // ── Project CRUD ──────────────────────────────────────────────────

  const addProject = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    if (!studentId) return
    await projectService.add(studentId, data)
    void triggerRecalculate()
  }

  const updateProject = async (docId: string, data: Partial<Project>) => {
    if (!studentId) return
    await projectService.update(studentId, docId, data)
    void triggerRecalculate()
  }

  const deleteProject = async (docId: string) => {
    if (!studentId) return
    await projectService.delete(studentId, docId)
    void triggerRecalculate()
  }

  // ── Achievement CRUD ──────────────────────────────────────────────

  const addAchievement = async (data: Omit<Achievement, 'id' | 'createdAt'>) => {
    if (!studentId) return
    await achievementService.add(studentId, data)
    void triggerRecalculate()
  }

  const updateAchievement = async (docId: string, data: Partial<Achievement>) => {
    if (!studentId) return
    await achievementService.update(studentId, docId, data)
    void triggerRecalculate()
  }

  const deleteAchievement = async (docId: string) => {
    if (!studentId) return
    await achievementService.delete(studentId, docId)
    void triggerRecalculate()
  }

  // ── Skill CRUD ────────────────────────────────────────────────────

  const addSkill = async (data: Omit<Skill, 'id' | 'createdAt'>) => {
    if (!studentId) return
    await skillService.add(studentId, data)
    void triggerRecalculate()
  }

  const updateSkill = async (docId: string, data: Partial<Skill>) => {
    if (!studentId) return
    await skillService.update(studentId, docId, data)
    void triggerRecalculate()
  }

  const deleteSkill = async (docId: string) => {
    if (!studentId) return
    await skillService.delete(studentId, docId)
    void triggerRecalculate()
  }

  return {
    semesters,
    subjects,
    certificates,
    projects,
    achievements,
    skills,
    history,
    loading,
    error,
    addSemester,
    updateSemester,
    deleteSemester,
    addSubject,
    updateSubject,
    deleteSubject,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    addProject,
    updateProject,
    deleteProject,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addSkill,
    updateSkill,
    deleteSkill
  }
}
