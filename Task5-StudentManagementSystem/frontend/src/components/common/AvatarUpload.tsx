import React, { useState, useRef, useEffect } from 'react'
import { Upload, Link, AlertCircle, RefreshCw, Trash2, Check } from 'lucide-react'

interface Props {
  readonly value: string
  readonly onChange: (val: string) => void
  readonly placeholderInitials: string
  readonly storageKey?: string // If provided, base64 uploads will save here
}

export default function AvatarUpload({ value, onChange, placeholderInitials, storageKey }: Props) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resolve localstorage URL if needed
  const getDisplayUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('localstorage://') && storageKey) {
      return localStorage.getItem(storageKey) || ''
    }
    return url
  }

  useEffect(() => {
    setPreviewUrl(getDisplayUrl(value))
    if (!value.startsWith('localstorage://')) {
      setUrlInput(value)
    }
  }, [value, storageKey])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(false)

    // Format validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload JPG, PNG, WEBP, or GIF.')
      return
    }

    // Size validation: 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      setError('File size too large. Maximum size is 2MB.')
      return
    }

    setLoading(true)
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const base64String = reader.result as string
        setPreviewUrl(base64String)

        if (storageKey) {
          localStorage.setItem(storageKey, base64String)
          onChange(`localstorage://${storageKey}`)
        } else {
          onChange(base64String)
        }

        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } catch (err: any) {
        console.error('FileReader processing error:', err)
        setError('Failed to process image file.')
      } finally {
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setError('Error reading file.')
      setLoading(false)
    }

    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = () => {
    setError(null)
    setSuccess(false)

    const trimmedUrl = urlInput.trim()
    if (!trimmedUrl) {
      onChange('')
      setPreviewUrl('')
      setShowUrlInput(false)
      return
    }

    // Simple URL pattern validation
    if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setLoading(true)
    // Verify image URL loads successfully
    const img = new Image()
    img.src = trimmedUrl
    img.onload = () => {
      setPreviewUrl(trimmedUrl)
      onChange(trimmedUrl)
      setSuccess(true)
      setLoading(false)
      setShowUrlInput(false)
      setTimeout(() => setSuccess(false), 2000)
    }
    img.onerror = () => {
      setError('Unable to load image from the provided URL. Please check the URL.')
      setLoading(false)
    }
  }

  const handleRemove = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
    onChange('')
    setPreviewUrl('')
    setUrlInput('')
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar Display Card */}
        <div className="relative group h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-vault-accent/10 to-vault-cyan/10 border border-vault-border/60 flex items-center justify-center font-black text-2xl text-vault-accent shrink-0 shadow-inner">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar Preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => {
                setError('Image failed to load. Removed.')
                handleRemove()
              }}
            />
          ) : (
            <span>{placeholderInitials}</span>
          )}

          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full sm:w-auto text-left">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-vault-accent hover:bg-vault-accent/90 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer text-xs font-black shadow-md"
            >
              <Upload size={13} />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg border border-slate-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer text-xs font-bold"
            >
              <Link size={13} />
              <span>From URL</span>
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/25 text-red-500 rounded-xl transition-colors cursor-pointer text-xs font-bold"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            )}
          </div>
          
          <p className="text-[10px] text-slate-400 font-semibold">
            Supports JPG, PNG, WEBP, or GIF. Max 2MB.
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex flex-col sm:flex-row gap-2 items-stretch">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter Image URL (e.g. https://example.com/avatar.jpg)"
            className="flex-1 rounded-lg bg-white dark:bg-white/5 border border-slate-250 dark:border-white/5 px-3 py-1.5 text-xs text-vault-fg focus:outline-none focus:border-vault-accent transition-colors"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleUrlSubmit}
            className="px-4 py-1.5 bg-vault-accent hover:bg-vault-accent/90 text-white rounded-lg cursor-pointer text-xs font-bold transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-[11px] font-semibold flex items-center gap-1.5">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold flex items-center gap-1.5">
          <Check size={13} className="shrink-0" />
          <span>Image applied successfully!</span>
        </div>
      )}
    </div>
  )
}
