import { useState, useEffect } from 'react'
import { onSnapshot, query } from 'firebase/firestore'
import { portfoliosCollection } from '../services/firestoreService'

export interface SkillStat {
  skill: string
  count: number
}

export interface DashboardPortfolioStats {
  skillDistribution: SkillStat[]
  topSkill: string
  publishedPortfolioCount: number
  loading: boolean
  error: string | null
  lastUpdated: Date | null
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
 * Subscribes in real-time to Firestore portfolios collection and computes
 * skill distribution and portfolio counts for dashboard visualisation.
 *
 * Degrades gracefully when the current user lacks Firestore read permissions
 * (e.g. security rules deny access): returns empty defaults and suppresses
 * the error banner so the rest of the dashboard remains functional.
 */
export const useDashboardStats = (): DashboardPortfolioStats => {
  const [skillDistribution, setSkillDistribution] = useState<SkillStat[]>([])
  const [publishedPortfolioCount, setPublishedPortfolioCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    setLoading(true)
    const q = query(portfoliosCollection)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const skillMap: Record<string, number> = {}
      let publishedCount = 0

      snapshot.forEach((doc) => {
        const data = doc.data()

        // Count published portfolios
        if (data.portfolioStatus === 'PUBLISHED' || data.published === true) {
          publishedCount++
        }

        // Aggregate skills via extracted helper
        aggregateSkills(data.skills, skillMap)
      })

      // Sort by frequency descending
      const sortedSkills: SkillStat[] = Object.entries(skillMap)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)

      setSkillDistribution(sortedSkills)
      setPublishedPortfolioCount(publishedCount)
      setLastUpdated(new Date())
      setLoading(false)
      setError(null)
    }, (err) => {
      // PERMISSION_DENIED means the current Firestore security rules don't allow
      // unauthenticated or lower-privileged reads on the portfolios collection.
      // Degrade silently — the dashboard can still display student data.
      const isPermissionError =
        err.code === 'permission-denied' ||
        err.message?.toLowerCase().includes('insufficient permissions') ||
        err.message?.toLowerCase().includes('missing or insufficient')

      if (isPermissionError) {
        console.debug('Portfolio stats unavailable (Firestore permission denied) — skipping.')
      } else {
        console.error('Firestore portfolio stats subscription error:', err)
        setError(err.message || 'Failed to load portfolio statistics.')
      }

      // Always clear loading and fall back to empty defaults
      setSkillDistribution([])
      setPublishedPortfolioCount(0)
      setLastUpdated(null)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const topSkill = skillDistribution.length > 0 ? skillDistribution[0].skill : 'N/A'

  return {
    skillDistribution,
    topSkill,
    publishedPortfolioCount,
    loading,
    error,
    lastUpdated
  }
}
