import { motion } from 'motion/react'
import { X, Check, CheckCheck, Archive, ExternalLink, BellOff } from 'lucide-react'
import { useAlerts, type Alert } from '../../hooks/useAlerts'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

interface SmartAlertDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SmartAlertDrawer({ isOpen, onClose }: Readonly<SmartAlertDrawerProps>) {
  const { alerts, unreadCount, markAsRead, archiveAlert, markAllAsRead } = useAlerts()
  const { user } = useAuthContext()
  const navigate = useNavigate()

  if (!isOpen) return null

  // Priority color maps
  const getPriorityStyles = (priority: Alert['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
          text: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-500 text-white',
          dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
        }
      case 'HIGH':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
          text: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-500 text-white',
          dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]'
        }
      case 'MEDIUM':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-500 text-white',
          dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]'
        }
      case 'LOW':
      default:
        return {
          bg: 'bg-slate-50 dark:bg-[#121c2c]/40 border-slate-200 dark:border-slate-800/50',
          text: 'text-slate-500 dark:text-slate-400',
          badge: 'bg-slate-500 text-white',
          dot: 'bg-slate-400'
        }
    }
  }

  const handleViewRecord = (alert: Alert) => {
    onClose()
    
    // Determine routing based on type & role
    const isStaff = user?.role === 'ADMIN'
    
    if (alert.relatedRecordId && isStaff) {
      if (alert.type === 'ROADMAP') {
        navigate('/dashboard/ai') // roadmap actions are reviewed or recommended in AI recommendations
      } else if (alert.type === 'ADVISORY') {
        navigate(`/dashboard/students/${alert.relatedRecordId}`)
      } else if (alert.type === 'PORTFOLIO') {
        navigate('/dashboard/portfolio')
      } else {
        navigate(`/dashboard/students/${alert.relatedRecordId}`)
      }
    } else if (alert.type === 'PORTFOLIO') {
      // Students or fallback
      navigate('/dashboard/portfolio')
    } else if (alert.type === 'ROADMAP') {
      navigate('/dashboard/ai')
    } else if (alert.type === 'ADVISORY') {
      navigate('/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  // Filter out archived notifications for active center view
  const activeAlerts = alerts.filter(a => a.status !== 'ARCHIVED')

  return (
    <>
      {/* Backdrop */}
      <button 
        type="button"
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity border-none w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close Alert Drawer"
      />

      {/* Drawer Container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white dark:bg-[#080f19] border-l border-slate-200 dark:border-vault-border/50 shadow-2xl z-50 flex flex-col h-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-vault-border/50 flex items-center justify-between bg-slate-50 dark:bg-[#0a1322]/50">
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-white uppercase flex items-center gap-2">
              Smart Alert Center
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-vault-accent/10 dark:bg-vault-accent/20 text-vault-accent px-2 py-0.5 rounded-full border border-vault-accent/20">
                  {unreadCount} New
                </span>
              )}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
              EduVault Academic Alerts
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-vault-border/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-vault-accent"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-vault-border/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-3">
              <BellOff size={32} className="stroke-[1.5] text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-bold uppercase tracking-wider">No active alerts found</p>
              <p className="text-[10px] text-center max-w-[250px] text-slate-400/80">
                You are all caught up! Academic and placement alerts appear here in real-time.
              </p>
            </div>
          ) : (
            activeAlerts.map((alert) => {
              const styles = getPriorityStyles(alert.priority)
              const isUnread = alert.status === 'UNREAD'
              
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all duration-200 relative group flex gap-3.5 ${styles.bg} ${
                    isUnread 
                      ? 'shadow-sm border-l-4 border-l-vault-accent' 
                      : 'opacity-75 hover:opacity-100 border-dashed'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${styles.dot}`} />
                    {isUnread && (
                      <div className="w-1.5 h-1.5 rounded-full bg-vault-accent animate-ping absolute top-4 left-4" />
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] font-black tracking-widest uppercase mb-1 block ${styles.text}`}>
                        {alert.type} • {alert.priority}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                      {alert.title}
                    </h4>
                    
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-bold">
                      {alert.message}
                    </p>

                    {/* Action Panel */}
                    <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-200/40 dark:border-white/5">
                      <button
                        onClick={() => handleViewRecord(alert)}
                        className="text-[9px] font-black uppercase text-vault-accent dark:text-vault-cyan hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        Action Record <ExternalLink size={10} />
                      </button>

                      <div className="flex items-center space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {isUnread && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-1 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-vault-accent/30 hover:text-vault-accent text-slate-400 cursor-pointer transition-colors"
                            title="Mark as read"
                          >
                            <Check size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => archiveAlert(alert.id)}
                          className="p-1 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-red-500/30 hover:text-red-400 text-slate-400 cursor-pointer transition-colors"
                          title="Archive Alert"
                        >
                          <Archive size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </>
  )
}
