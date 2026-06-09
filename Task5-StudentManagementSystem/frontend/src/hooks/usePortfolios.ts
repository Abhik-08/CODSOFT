import { useState, useEffect } from 'react'
import { onSnapshot, query, orderBy } from 'firebase/firestore'
import { portfoliosCollection, firestoreService } from '../services/firestoreService'
import type { Portfolio } from '../types/portfolio'

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Realtime listener
  useEffect(() => {
    const q = query(portfoliosCollection, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: Portfolio[] = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            studentName: data.studentName || '',
            template: data.template || '',
            theme: data.theme || '',
            createdAt: data.createdAt
              ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            deployed: data.deployed || false,
            deployUrl: data.deployUrl || undefined
          }
        })
        setPortfolios(docs)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore portfolios listener error:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // ── Mutations ──────────────────────────────────────────────────────

  const addPortfolio = async (portfolio: {
    studentName: string
    template: string
    theme: string
  }) => {
    await firestoreService.addPortfolio({
      ...portfolio,
      deployed: false
    })
  }

  const markDeployed = async (id: string, deployUrl: string) => {
    await firestoreService.updatePortfolio(id, {
      deployed: true,
      deployUrl
    })
  }

  return {
    portfolios,
    loading,
    addPortfolio,
    markDeployed
  }
}
