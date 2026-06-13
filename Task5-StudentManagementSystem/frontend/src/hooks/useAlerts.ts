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

export const useAlerts = () => {
  const { user } = useAuthContext()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !user.email) {
      setAlerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const alertsCollection = collection(db, 'alerts')
    
    // Build query based on role
    let q = query(alertsCollection, orderBy('createdAt', 'desc'))
    
    if (user.role === 'STUDENT') {
      q = query(
        alertsCollection,
        where('userId', '==', user.email),
        orderBy('createdAt', 'desc')
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Alert[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          list.push({
            id: docSnap.id,
            alertId: data.alertId || docSnap.id,
            userId: data.userId || '',
            title: data.title || '',
            message: data.message || '',
            type: data.type || 'SYSTEM',
            priority: (data.priority || 'LOW').toUpperCase() as any,
            status: (data.status || 'UNREAD').toUpperCase() as any,
            relatedRecordId: data.relatedRecordId || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          })
        })
        setAlerts(list)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Firestore alerts subscription error:', err)
        setError(err.message || 'Failed to sync alerts.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
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
