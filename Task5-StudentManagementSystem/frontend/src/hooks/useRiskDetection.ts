import { useState, useEffect } from 'react'
import { apiClient } from '../services/apiClient'
import type { RiskReport } from '../types/student'

export const useRiskDetection = (studentId: string | undefined) => {
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRiskReport = async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const response = await apiClient.get<RiskReport>(`/students/${studentId}/academic-risk`)
      setRiskReport(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch academic risk report:', err)
      setError(err.message || 'Failed to fetch academic risk report')
    } finally {
      setLoading(false)
    }
  }

  const recalculateRisk = async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const response = await apiClient.post<RiskReport>(`/students/${studentId}/academic-risk/recalculate`)
      setRiskReport(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to recalculate academic risk:', err)
      setError(err.message || 'Failed to recalculate academic risk')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRiskReport()
  }, [studentId])

  return {
    riskReport,
    loading,
    error,
    recalculate: recalculateRisk,
    refetch: fetchRiskReport
  }
}
