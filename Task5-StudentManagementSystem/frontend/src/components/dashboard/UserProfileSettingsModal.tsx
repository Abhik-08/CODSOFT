import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { X, User, Check, AlertCircle } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import AvatarUpload from '../common/AvatarUpload'

interface Props {
  readonly onClose: () => void
}

export default function UserProfileSettingsModal({ onClose }: Props) {
  const { user, updateUserProfile } = useAuthContext()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isDirty = useMemo(() => {
    return (
      displayName.trim() !== (user?.displayName || '').trim() ||
      photoURL.trim() !== (user?.photoURL || '').trim()
    )
  }, [user, displayName, photoURL])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!displayName.trim()) {
      setError('Name is a required field.')
      return
    }

    setLoading(true)
    try {
      await updateUserProfile(displayName.trim(), photoURL.trim())
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Failed to update user profile:', err)
      setError(err?.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1"
  const inputCls = "field-surface w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-350 dark:border-white/5 px-3.5 py-2 text-xs text-vault-fg focus:outline-none focus:border-vault-accent transition-colors"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="vault-glass p-6 rounded-2xl border border-vault-border max-w-md w-full space-y-4 text-left shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <User className="text-vault-cyan w-5 h-5" />
            <h3 className="text-lg font-black text-vault-cyan">Profile Settings</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-vault-fg cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check size={14} className="shrink-0" />
              <span>Profile updated successfully! Closing...</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div>
            <span className={labelCls}>Profile Avatar</span>
            <AvatarUpload
              value={photoURL}
              onChange={setPhotoURL}
              placeholderInitials={displayName?.[0] || 'U'}
              storageKey={user ? `avatar_user_${user.uid}` : undefined}
            />
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="userDisplayName" className={labelCls}>Full Name</label>
            <input
              id="userDisplayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputCls}
              placeholder="Academic Lead"
            />
          </div>

          {/* Email Read-only */}
          <div>
            <label htmlFor="userEmail" className={labelCls}>Email Address</label>
            <input
              id="userEmail"
              type="email"
              disabled
              value={user?.email || ''}
              className={`${inputCls} opacity-60 cursor-not-allowed`}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-xs rounded-xl cursor-pointer font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isDirty}
              className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/90 text-white text-xs rounded-xl cursor-pointer font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
