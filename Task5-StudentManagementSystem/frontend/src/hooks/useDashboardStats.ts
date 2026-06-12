import { useState, useEffect } from 'react'
import { onSnapshot, query, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { studentsCollection, portfoliosCollection } from '../services/firestoreService'
import type { PlacementStatus, SemesterRecord } from '../types/student'

export interface SkillStat {
  skill: string
  count: number
}

export interface TopPerformer {
  id: string
  name: string
  department: string
  gpa: number
}

export interface DeptTrend {
  department: string
  avgGpa: number
  count: number
}

export interface SemesterTrend {
  semester: number
  avgSgpa: number
  avgCgpa: number
}

export interface DashboardPortfolioStats {
  skillDistribution: SkillStat[]
  topSkill: string
  publishedPortfolioCount: number
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  // Academic analytics
  averageCgpa: number
  topPerformers: TopPerformer[]
  semesterTrends: SemesterTrend[]
  departmentTrends: DeptTrend[]
  placementReadiness: {
    total: number
    placed: number
    preparing: number
    interviewing: number
    notStarted: number
    readinessPercent: number
  }
}

/** Aggregates skill strings from a Firestore document's skills field into a frequency map. */
function aggregateSkills(skills: unknown, skillMap: Record<string, number>) {
  if (!Array.isArray(skills)) return
  for (const skill of skills) {
    if (typeof skill === 'string' && skill.trim()) {
      const normalized = skill.trim()
      skillMap[normalized] = (skillMap[normalized] || 0) + 1
    }
  }
}

/**
 * Subscribes in real-time to Firestore students and portfolios collections.
 * Computes academic analytics including average CGPA, top performers,
 * semester trends, department trends, and placement readiness.
 */
export const useDashboardStats = (): DashboardPortfolioStats => {
  const [skillDistribution, setSkillDistribution] = useState<SkillStat[]>([])
  const [publishedPortfolioCount, setPublishedPortfolioCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Academic analytics state
  const [averageCgpa, setAverageCgpa] = useState(0)
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [semesterTrends, setSemesterTrends] = useState<SemesterTrend[]>([])
  const [departmentTrends, setDepartmentTrends] = useState<DeptTrend[]>([])
  const [placementReadiness, setPlacementReadiness] = useState({
    total: 0, placed: 0, preparing: 0, interviewing: 0, notStarted: 0, readinessPercent: 0
  })

  useEffect(() => {
    setLoading(true)

    // ── Subscribe to students for academic analytics ───────────────
    const studentQuery = query(studentsCollection)
    const unsubStudents = onSnapshot(studentQuery, async (snapshot) => {
      const gpas: number[] = []
      const performers: TopPerformer[] = []
      const deptMap: Record<string, { totalGpa: number; count: number }> = {}
      const placementStats = { total: 0, placed: 0, preparing: 0, interviewing: 0, notStarted: 0 }
      const allSemesterRecords: SemesterRecord[] = []

      // Process each student
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        const gpa = Number(data.gpa) || 0
        const name = `${data.firstName || ''} ${data.lastName || ''}`.trim()
        const dept = data.department || 'Unknown'
        const status = (data.placementStatus as PlacementStatus) || 'NOT_STARTED'

        // GPA tracking
        if (gpa > 0) gpas.push(gpa)

        // Top performers
        performers.push({ id: docSnap.id, name, department: dept, gpa })

        // Department trends
        if (!deptMap[dept]) deptMap[dept] = { totalGpa: 0, count: 0 }
        deptMap[dept].totalGpa += gpa
        deptMap[dept].count++

        // Placement readiness
        placementStats.total++
        if (status === 'PLACED') placementStats.placed++
        else if (status === 'PREPARING') placementStats.preparing++
        else if (status === 'INTERVIEWING') placementStats.interviewing++
        else placementStats.notStarted++

        // Fetch semester subcollection for trends
        try {
          const semSnap = await getDocs(collection(db, 'students', docSnap.id, 'semesters'))
          semSnap.forEach((semDoc) => {
            const semData = semDoc.data()
            allSemesterRecords.push({
              semesterNumber: Number(semData.semesterNumber) || 0,
              sgpa: Number(semData.sgpa) || 0,
              cgpa: Number(semData.cgpa) || 0,
              attendance: Number(semData.attendance) || 0,
              academicYear: semData.academicYear || ''
            })
          })
        } catch {
          // Subcollection may not exist yet — gracefully skip
        }
      }

      // Compute average CGPA
      const avgCgpa = gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0
      setAverageCgpa(Math.round(avgCgpa * 100) / 100)

      // Top 5 performers
      performers.sort((a, b) => b.gpa - a.gpa)
      setTopPerformers(performers.slice(0, 5))

      // Department trends
      const deptTrends: DeptTrend[] = Object.entries(deptMap).map(([dept, { totalGpa, count }]) => ({
        department: dept,
        avgGpa: Math.round((totalGpa / count) * 100) / 100,
        count
      })).sort((a, b) => b.avgGpa - a.avgGpa)
      setDepartmentTrends(deptTrends)

      // Semester trends (aggregate across all students)
      const semMap: Record<number, { totalSgpa: number; totalCgpa: number; count: number }> = {}
      for (const rec of allSemesterRecords) {
        if (rec.semesterNumber <= 0) continue
        if (!semMap[rec.semesterNumber]) semMap[rec.semesterNumber] = { totalSgpa: 0, totalCgpa: 0, count: 0 }
        semMap[rec.semesterNumber].totalSgpa += rec.sgpa
        semMap[rec.semesterNumber].totalCgpa += rec.cgpa
        semMap[rec.semesterNumber].count++
      }
      const semTrends: SemesterTrend[] = Object.entries(semMap)
        .map(([sem, { totalSgpa, totalCgpa, count }]) => ({
          semester: Number(sem),
          avgSgpa: Math.round((totalSgpa / count) * 100) / 100,
          avgCgpa: Math.round((totalCgpa / count) * 100) / 100
        }))
        .sort((a, b) => a.semester - b.semester)
      setSemesterTrends(semTrends)

      // Placement readiness
      const readinessPercent = placementStats.total > 0
        ? Math.round(((placementStats.placed + placementStats.interviewing + placementStats.preparing) / placementStats.total) * 100)
        : 0
      setPlacementReadiness({ ...placementStats, readinessPercent })

      setLastUpdated(new Date())
      setLoading(false)
    }, (err) => {
      const isPermissionError =
        err.code === 'permission-denied' ||
        err.message?.toLowerCase().includes('insufficient permissions')
      if (!isPermissionError) {
        console.error('Student analytics subscription error:', err)
        setError(err.message || 'Failed to load student analytics.')
      }
      setLoading(false)
    })

    // ── Subscribe to portfolios for skill distribution ─────────────
    const portfolioQuery = query(portfoliosCollection)
    const unsubPortfolios = onSnapshot(portfolioQuery, (snapshot) => {
      const skillMap: Record<string, number> = {}
      let publishedCount = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.portfolioStatus === 'PUBLISHED' || data.published === true) {
          publishedCount++
        }
        aggregateSkills(data.skills, skillMap)
      })

      const sortedSkills: SkillStat[] = Object.entries(skillMap)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)

      setSkillDistribution(sortedSkills)
      setPublishedPortfolioCount(publishedCount)
    }, (err) => {
      const isPermissionError =
        err.code === 'permission-denied' ||
        err.message?.toLowerCase().includes('insufficient permissions') ||
        err.message?.toLowerCase().includes('missing or insufficient')
      if (isPermissionError) {
        console.debug('Portfolio stats unavailable (Firestore permission denied) — skipping.')
      } else {
        console.error('Firestore portfolio stats subscription error:', err)
      }
      setSkillDistribution([])
      setPublishedPortfolioCount(0)
    })

    return () => {
      unsubStudents()
      unsubPortfolios()
    }
  }, [])

  const topSkill = skillDistribution.length > 0 ? skillDistribution[0].skill : 'N/A'

  return {
    skillDistribution,
    topSkill,
    publishedPortfolioCount,
    loading,
    error,
    lastUpdated,
    averageCgpa,
    topPerformers,
    semesterTrends,
    departmentTrends,
    placementReadiness
  }
}
