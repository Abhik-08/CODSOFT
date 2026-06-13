import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, orderBy } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuthContext } from '../context/AuthContext'

export interface Alert {
  id: string
  alertId: string
  userId: string
  title: string
  message: string
  type: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'UNREAD' | 'READ' | 'ARCHIVED'
  relatedRecordId?: string
  createdAt: string
  updatedAt: string
}

const mapAlertDoc = (docSnap: any): Alert => {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    alertId: data.alertId || docSnap.id,
    userId: data.userId || '',
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'SYSTEM',
    priority: (data.priority || 'LOW').toUpperCase(),
    status: (data.status || 'UNREAD').toUpperCase(),
    relatedRecordId: data.relatedRecordId || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  }
}

export const useAlerts = () => {
  const { user } = useAuthContext()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setAlerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const alertsCollection = collection(db, 'alerts')
    let isFallback = false
    
    // Build query based on role
    let q = query(alertsCollection, orderBy('createdAt', 'desc'))
    
    if (user.role === 'STUDENT') {
      q = query(
        alertsCollection,
        where('userId', '==', user.email),
        orderBy('createdAt', 'desc')
      )
    }

    let unsubscribe: () => void

    const handleSnapshot = (snapshot: any) => {
      const list: Alert[] = []
      snapshot.forEach((docSnap: any) => {
        list.push(mapAlertDoc(docSnap))
      })
      // Sort client-side by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setAlerts(list)
      setLoading(false)
      setError(null)
    }

    const startSubscription = (currentQuery: any): (() => void) => {
      return onSnapshot(
        currentQuery,
        handleSnapshot,
        (err) => {
          if (err.code === 'permission-denied' && !isFallback && user.role === 'ADMIN') {
            console.warn('Firestore alerts admin query permission denied. Falling back to user-specific alerts query...', err)
            isFallback = true
            const fallbackQuery = query(
              alertsCollection,
              where('userId', '==', user.email)
            )
            // Re-subscribe using the fallback query
            unsubscribe = startSubscription(fallbackQuery)
          } else {
            console.error('Firestore alerts subscription error:', err)
            setError(err.message || 'Failed to sync alerts.')
            setLoading(false)
          }
        }
      )
    }

    unsubscribe = startSubscription(q)
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user])

  const markAsRead = async (alertId: string) => {
    try {
      const alertRef = doc(db, 'alerts', alertId)
      await updateDoc(alertRef, {
        status: 'READ',
        updatedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Failed to mark alert as read:', err)
    }
  }

  const archiveAlert = async (alertId: string) => {
    try {
      const alertRef = doc(db, 'alerts', alertId)
      await updateDoc(alertRef, {
        status: 'ARCHIVED',
        updatedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Failed to archive alert:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => a.status === 'UNREAD')
      if (unreadAlerts.length === 0) return

      const batch = writeBatch(db)
      unreadAlerts.forEach((alert) => {
        const ref = doc(db, 'alerts', alert.id)
        batch.update(ref, {
          status: 'READ',
          updatedAt: new Date().toISOString()
        })
      })
      await batch.commit()
    } catch (err) {
      console.error('Failed to mark all alerts as read:', err)
    }
  }

  const unreadAlerts = alerts.filter((a) => a.status === 'UNREAD')
  const unreadCount = unreadAlerts.length
  const hasCriticalAlert = unreadAlerts.some((a) => a.priority === 'CRITICAL')

  return {
    alerts,
    unreadAlerts,
    unreadCount,
    hasCriticalAlert,
    loading,
    error,
    markAsRead,
    archiveAlert,
    markAllAsRead,
  }
}
