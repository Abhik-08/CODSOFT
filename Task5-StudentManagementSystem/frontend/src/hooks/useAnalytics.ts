import { useState, useEffect } from 'react'
import { apiClient } from '../services/apiClient'
import { useAuthContext } from '../context/AuthContext'

export interface AnalyticsOverview {
  totalStudents: number
  activeStudents: number
  averageCgpa: number
  averageAttendance: number
  topDepartment: string
  placementReadyPercentage: number
}

export interface CgpaDistributionData {
  progression: Array<{ name: string; cgpa: number }>
  segments: Array<{ name: string; value: number; fill: string }>
}

export interface AttendanceAnalyticsData {
  monthlyAttendance: Array<{ name: string; rate: number }>
}

export interface RiskAnalyticsData {
  riskDistribution: Array<{ name: string; count: number; fill: string }>
  riskCategoryBreakdown: Array<{ name: string; value: number; fill: string }>
  departmentRisk: Array<{ name: string; fullName: string; avgRisk: number }>
  semesterRisk: Array<{ name: string; avgRisk: number }>
  riskTrend: Array<{ name: string; avgRisk: number }>
}

export interface DepartmentAnalyticsData {
  enrollment: Record<string, number>
  averages: Record<string, number>
}

export interface PlacementAnalyticsData {
  totalCalculated: number
  readiness: Array<{ name: string; value: number; fill: string }>
  tierDistribution: Array<{ name: string; value: number; fill: string }>
  distributionBins: Array<{ name: string; count: number; fill: string }>
  deptAverageScoreData: Array<{
    name: string
    fullName: string
    averageScore: number
    skill: number
    project: number
    career: number
    industry: number
  }>
}

export const useAnalytics = () => {
  const { user } = useAuthContext()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [cgpaData, setCgpaData] = useState<CgpaDistributionData | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceAnalyticsData | null>(null)
  const [riskData, setRiskData] = useState<RiskAnalyticsData | null>(null)
  const [deptData, setDeptData] = useState<DepartmentAnalyticsData | null>(null)
  const [placementData, setPlacementData] = useState<PlacementAnalyticsData | null>(null)

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllAnalytics = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)

      const [
        overviewRes,
        cgpaRes,
        attendanceRes,
        riskRes,
        deptRes,
        placementRes
      ] = await Promise.all([
        apiClient.get<AnalyticsOverview>('/analytics/overview'),
        apiClient.get<CgpaDistributionData>('/analytics/cgpa-distribution'),
        apiClient.get<AttendanceAnalyticsData>('/analytics/attendance'),
        apiClient.get<RiskAnalyticsData>('/analytics/risk'),
        apiClient.get<DepartmentAnalyticsData>('/analytics/departments'),
        apiClient.get<PlacementAnalyticsData>('/analytics/placement')
      ])

      setOverview(overviewRes.data)
      setCgpaData(cgpaRes.data)
      setAttendanceData(attendanceRes.data)
      setRiskData(riskRes.data)
      setDeptData(deptRes.data)
      setPlacementData(placementRes.data)
    } catch (err: any) {
      console.error('Failed to fetch analytics data:', err)
      setError(err.message || 'Failed to retrieve analytics data from backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAllAnalytics()
    } else {
      setOverview(null)
      setCgpaData(null)
      setAttendanceData(null)
      setRiskData(null)
      setDeptData(null)
      setPlacementData(null)
      setLoading(false)
    }
  }, [user])

  return {
    overview,
    cgpaData,
    attendanceData,
    riskData,
    deptData,
    placementData,
    loading,
    error,
    refetch: fetchAllAnalytics
  }
}
