import { useState, useEffect } from 'react'
import { apiClient } from '../services/apiClient'
import { useAuthContext } from '../context/AuthContext'

export interface DashboardMetrics {
  cohortSize: number
  averageCgpa: number
  averageAttendance: number
  placementReadyPercentage: number
  portfolioCompletionPercentage: number
  riskStudents: number
  certificateCount: number
  projectCount: number
  studentsFollowingRoadmaps: number
  completedRoadmaps: number
  highPriorityRoadmaps: number
  averageImprovementProgress: number
}

export const useDashboardMetrics = () => {
  const { user } = useAuthContext()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<DashboardMetrics>('/dashboard/metrics')
      setMetrics(response.data)
    } catch (err: any) {
      console.error('Failed to fetch dashboard metrics:', err)
      setError(err.message || 'Failed to retrieve dashboard metrics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMetrics()
    } else {
      setMetrics(null)
      setLoading(false)
    }
  }, [user])

  return { metrics, loading, error, refetch: fetchMetrics }
}
