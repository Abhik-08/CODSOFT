import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { X, User, GraduationCap, Link2, Check, AlertCircle } from 'lucide-react'
import type { Student } from '../../types/student'
import { useAuthContext } from '../../context/AuthContext'

interface Props {
  readonly student: Student
  readonly onClose: () => void
  readonly onSave: (updatedData: Partial<Student>, changedBy: string) => Promise<void>
}

type ModalTab = 'personal' | 'academic' | 'portfolio'

export default function StudentProfileEditModal({ student, onClose, onSave }: Props) {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<ModalTab>('personal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [firstName, setFirstName] = useState(student.firstName || '')
  const [lastName, setLastName] = useState(student.lastName || '')
  const [dateOfBirth, setDateOfBirth] = useState(student.dateOfBirth || '')
  const [email, setEmail] = useState(student.email || '')
  const [phone, setPhone] = useState(student.phone || '')

  const [department, setDepartment] = useState(student.department || '')
  const [semester, setSemester] = useState(String(student.semester || '1'))
  const [status, setStatus] = useState<Student['status']>(student.status || 'ACTIVE')
  const [gpa, setGpa] = useState(String(student.gpa ?? '8.0'))
  const [attendanceRate, setAttendanceRate] = useState(String(student.attendanceRate ?? '100'))
  const [placementStatus, setPlacementStatus] = useState<Student['placementStatus']>(student.placementStatus || 'NOT_STARTED')
  const [offerCount, setOfferCount] = useState(String(student.offerCount || '0'))
  const [imageUrl, setImageUrl] = useState(student.imageUrl || '')

  const [githubUrl, setGithubUrl] = useState(student.githubUrl || '')
  const [linkedinUrl, setLinkedinUrl] = useState(student.linkedinUrl || '')
  const [portfolioUrl, setPortfolioUrl] = useState(student.portfolioUrl || '')
  const [portfolioTitle, setPortfolioTitle] = useState(student.portfolioTitle || '')
  const [portfolioSummary, setPortfolioSummary] = useState(student.portfolioSummary || '')

  // Compare states to detect unsaved changes
  const isDirty = useMemo(() => {
    return (
      firstName.trim() !== (student.firstName || '').trim() ||
      lastName.trim() !== (student.lastName || '').trim() ||
      dateOfBirth !== (student.dateOfBirth || '') ||
      email.trim() !== (student.email || '').trim() ||
      phone.trim() !== (student.phone || '').trim() ||
      department.trim() !== (student.department || '').trim() ||
      semester !== String(student.semester || '1') ||
      status !== (student.status || 'ACTIVE') ||
      gpa !== String(student.gpa ?? '8.0') ||
      attendanceRate !== String(student.attendanceRate ?? '100') ||
      placementStatus !== (student.placementStatus || 'NOT_STARTED') ||
      offerCount !== String(student.offerCount || '0') ||
      imageUrl.trim() !== (student.imageUrl || '').trim() ||
      githubUrl.trim() !== (student.githubUrl || '').trim() ||
      linkedinUrl.trim() !== (student.linkedinUrl || '').trim() ||
      portfolioUrl.trim() !== (student.portfolioUrl || '').trim() ||
      portfolioTitle.trim() !== (student.portfolioTitle || '').trim() ||
      portfolioSummary.trim() !== (student.portfolioSummary || '').trim()
    )
  }, [
    student, firstName, lastName, dateOfBirth, email, phone, department, semester,
    status, gpa, attendanceRate, placementStatus, offerCount, imageUrl, githubUrl,
    linkedinUrl, portfolioUrl, portfolioTitle, portfolioSummary
  ])

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      )
      if (!confirmDiscard) return
    }
    onClose()
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required fields.')
      return
    }

    const confirmSave = window.confirm('Are you sure you want to save these profile modifications?')
    if (!confirmSave) return

    setLoading(true)
    try {
      const payload: Partial<Student> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth,
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        semester: Number(semester) || 1,
        status: status,
        gpa: Number(gpa) || 0,
        attendanceRate: Number(attendanceRate) || 100,
        placementStatus: placementStatus,
        offerCount: Number(offerCount) || 0,
        imageUrl: imageUrl.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        portfolioTitle: portfolioTitle.trim(),
        portfolioSummary: portfolioSummary.trim(),
      }

      const changedBy = user?.email || user?.displayName || 'Authorized staff'
      await onSave(payload, changedBy)
      onClose()
    } catch (err: any) {
      console.error('Failed to update student profile:', err)
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
        className="vault-glass p-6 rounded-2xl border border-vault-border max-w-2xl w-full space-y-4 text-left my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
          <div>
            <h3 className="text-lg font-black text-vault-cyan">Student Profile Editor</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage and correct student information dynamically.</p>
          </div>
          <button onClick={handleCancel} className="text-slate-400 hover:text-vault-fg cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-white/5 pb-1 gap-1 shrink-0">
          {[
            { id: 'personal', label: 'Personal & Contact', icon: User },
            { id: 'academic', label: 'Academic & Placement', icon: GraduationCap },
            { id: 'portfolio', label: 'Socials & Portfolio', icon: Link2 },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ModalTab)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 rounded-t-lg ${
                  active
                    ? 'border-vault-accent text-vault-accent bg-vault-accent/5'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className={labelCls}>First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelCls}>Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dateOfBirth" className={labelCls}>Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelCls}>Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelCls}>Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className={labelCls}>Avatar Image URL</label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="department" className={labelCls}>Department</label>
                  <input
                    id="department"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="semester" className={labelCls}>Current Semester</label>
                  <input
                    id="semester"
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="status" className={labelCls}>Academic Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Student['status'])}
                    className={inputCls}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="GRADUATED">GRADUATED</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gpa" className={labelCls}>CGPA (0.00 - 10.00)</label>
                  <input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="attendanceRate" className={labelCls}>Attendance Rate (%)</label>
                  <input
                    id="attendanceRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={attendanceRate}
                    onChange={(e) => setAttendanceRate(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/5">
                <div>
                  <label htmlFor="placementStatus" className={labelCls}>Placement Status</label>
                  <select
                    id="placementStatus"
                    value={placementStatus}
                    onChange={(e) => setPlacementStatus(e.target.value as Student['placementStatus'])}
                    className={inputCls}
                  >
                    <option value="NOT_STARTED">NOT STARTED</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="INTERVIEWING">INTERVIEWING</option>
                    <option value="PLACED">PLACED</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="offerCount" className={labelCls}>Job Offers Secured</label>
                  <input
                    id="offerCount"
                    type="number"
                    min="0"
                    required
                    value={offerCount}
                    onChange={(e) => setOfferCount(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="githubUrl" className={labelCls}>GitHub URL</label>
                  <input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className={inputCls}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="linkedinUrl" className={labelCls}>LinkedIn URL</label>
                  <input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className={inputCls}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/5">
                <div>
                  <label htmlFor="portfolioTitle" className={labelCls}>Portfolio Heading</label>
                  <input
                    id="portfolioTitle"
                    type="text"
                    value={portfolioTitle}
                    onChange={(e) => setPortfolioTitle(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Lead Systems Engineer Portfolio"
                  />
                </div>
                <div>
                  <label htmlFor="portfolioUrl" className={labelCls}>Published Portfolio URL</label>
                  <input
                    id="portfolioUrl"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className={inputCls}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="portfolioSummary" className={labelCls}>About / Portfolio Summary</label>
                <textarea
                  id="portfolioSummary"
                  rows={4}
                  value={portfolioSummary}
                  onChange={(e) => setPortfolioSummary(e.target.value)}
                  className={`${inputCls} min-h-[90px] resize-none`}
                  placeholder="Summarize profile background..."
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/5 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-xs rounded-xl cursor-pointer font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/90 text-white text-xs rounded-xl cursor-pointer font-bold flex items-center gap-1.5 transition-all disabled:opacity-60 shadow-lg"
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
      </motion.div>
    </div>
  )
}
