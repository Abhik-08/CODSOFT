import { useState, useEffect } from 'react'
import { onSnapshot, query } from 'firebase/firestore'
import { portfoliosCollection } from '../services/firestoreService'
import { portfolioService } from '../services/portfolioService'
import { studentService } from '../services/studentService'
import { useAuthContext } from '../context/AuthContext'
import type { Portfolio } from '../types/portfolio'

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthContext()
  const [currentStudentId, setCurrentStudentId] = useState<string | number | null>(null)

  // Determine current student context if logged in as a STUDENT
  useEffect(() => {
    const resolveStudentId = async () => {
      if (!user) return
      try {
        if (user.role === 'STUDENT') {
          const students = await studentService.getAll()
          const match = students.find(s => s.email.toLowerCase() === user.email.toLowerCase())
          if (match?.id) {
            setCurrentStudentId(match.id)
          }
        }
      } catch (err) {
        console.error('Failed to resolve student ID:', err)
      }
    }
    resolveStudentId()
  }, [user])

  // Set up real-time listener for portfolios
  useEffect(() => {
    setLoading(true)
    const q = query(portfoliosCollection)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Portfolio[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        list.push({
          id: doc.id,
          studentId: data.studentId,
          portfolioName: data.portfolioName || '',
          templateType: data.templateType || 'Developer',
          title: data.title || '',
          summary: data.summary || '',
          skills: data.skills || [],
          projects: data.projects || [],
          achievements: data.achievements || [],
          certificates: data.certificates || [],
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioStatus: data.portfolioStatus || 'DRAFT',
          theme: data.theme || 'Nexus Dark',
          about: data.about || '',
          email: data.email || '',
          phone: data.phone || '',
          socialLinks: data.socialLinks || {},
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : undefined
        })
      })

      setPortfolios(list)
      setLoading(false)
      setError(null)
    }, (err) => {
      console.error('Firestore portfolios subscription error:', err)
      setError(err.message || 'Failed to sync portfolios from Firestore.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addPortfolio = async (portfolio: Omit<Portfolio, 'id'>) => {
    setError(null)
    try {
      return await portfolioService.create(portfolio)
    } catch (err: any) {
      console.error('Failed to create portfolio:', err)
      setError(err.message || 'Failed to create portfolio.')
      throw err
    }
  }

  const updatePortfolio = async (id: string | number, data: Partial<Portfolio>) => {
    setError(null)
    try {
      return await portfolioService.update(String(id), data)
    } catch (err: any) {
      console.error('Failed to update portfolio:', err)
      setError(err.message || 'Failed to update portfolio.')
      throw err
    }
  }

  const deletePortfolio = async (id: string | number) => {
    setError(null)
    try {
      await portfolioService.delete(String(id))
    } catch (err: any) {
      console.error('Failed to delete portfolio:', err)
      setError(err.message || 'Failed to delete portfolio.')
      throw err
    }
  }

  const duplicatePortfolio = async (id: string | number) => {
    setError(null)
    try {
      return await portfolioService.duplicate(String(id))
    } catch (err: any) {
      console.error('Failed to duplicate portfolio:', err)
      setError(err.message || 'Failed to duplicate portfolio.')
      throw err
    }
  }

  return {
    portfolios,
    loading,
    error,
    currentStudentId,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    duplicatePortfolio,
    refresh: () => {}
  }
}
