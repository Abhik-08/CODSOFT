import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../services/apiClient'

export interface PlacementIntelligence {
  placementScore: number
  placementTier: string
  confidenceLevel: number
  lastCalculatedAt: string
  academicReadinessScore: number
  technicalReadinessScore: number
  careerReadinessScore: number
  consistencyReadinessScore: number
  industryReadinessScore: number
  strengths: string[]
  weaknesses: string[]
  skillGaps: string[]
  careerGaps: string[]
  projectGaps: string[]
  certificationGaps: string[]
  recommendations: string[]
  careerInsights: string[]
  growthRoadmap: string[]
}

export const usePlacementIntelligence = (studentId: string | undefined) => {
  const [placementIntel, setPlacementIntel] = useState<PlacementIntelligence | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIntelligence = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const response = await apiClient.get<PlacementIntelligence>(`/students/${studentId}/placement-intelligence`)
      setPlacementIntel(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch placement intelligence:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to load placement intelligence.')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  const recalculate = async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const response = await apiClient.post<PlacementIntelligence>(`/students/${studentId}/placement-intelligence/recalculate`)
      setPlacementIntel(response.data)
      setError(null)
      return response.data
    } catch (err: any) {
      console.error('Failed to recalculate placement intelligence:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to recalculate placement intelligence.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (studentId) {
      fetchIntelligence()
    } else {
      setPlacementIntel(null)
      setLoading(false)
    }
  }, [studentId, fetchIntelligence])

  return {
    placementIntel,
    loading,
    error,
    recalculate,
    refetch: fetchIntelligence
  }
}
