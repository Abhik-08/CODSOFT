import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../services/apiClient'

export interface Advisory {
  id?: number
  advisoryId?: string // firestoreId
  studentId?: number
  studentFirestoreId?: string
  title: string
  message: string
  type: 'ACADEMIC' | 'PLACEMENT' | 'ATTENDANCE' | 'PORTFOLIO' | 'SKILL_DEVELOPMENT' | 'CERTIFICATE_RECOMMENDATIONS'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'VIEWED' | 'COMPLETED' | 'DISMISSED'
  createdAt?: string
}

export interface AdvisoryStats {
  activeAdvisories: number
  criticalAdvisories: number
  resolvedAdvisories: number
}

export const useAdvisories = (studentId?: string) => {
  const [advisories, setAdvisories] = useState<Advisory[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdvisoryStats | null>(null)

  const fetchAdvisories = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<Advisory[]>(`/advisories/student/${studentId}`)
      setAdvisories(response.data)
    } catch (err: any) {
      console.error('Failed to fetch student advisories:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to fetch advisories.')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  const createAdvisory = async (advisoryData: Omit<Advisory, 'id' | 'advisoryId' | 'status' | 'createdAt'>) => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...advisoryData,
        studentFirestoreId: studentId
      }
      const response = await apiClient.post<Advisory>('/advisories', payload)
      setAdvisories((prev) => [response.data, ...prev])
      return response.data
    } catch (err: any) {
      console.error('Failed to create advisory:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to create advisory.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateAdvisoryStatus = async (id: number, status: Advisory['status']) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.put<Advisory>(`/advisories/${id}/status?status=${status}`)
      setAdvisories((prev) =>
        prev.map((adv) => (adv.id === id ? response.data : adv))
      )
      return response.data
    } catch (err: any) {
      console.error('Failed to update advisory status:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to update advisory status.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAdvisory = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/advisories/${id}`)
      setAdvisories((prev) => prev.filter((adv) => adv.id !== id))
    } catch (err: any) {
      console.error('Failed to delete advisory:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to delete advisory.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<AdvisoryStats>('/advisories/dashboard')
      setStats(response.data)
      return response.data
    } catch (err: any) {
      console.error('Failed to fetch advisory dashboard stats:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to fetch advisory stats.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (studentId) {
      fetchAdvisories()
    }
  }, [studentId, fetchAdvisories])

  return {
    advisories,
    loading,
    error,
    stats,
    fetchAdvisories,
    createAdvisory,
    updateAdvisoryStatus,
    deleteAdvisory,
    fetchDashboardStats
  }
}
