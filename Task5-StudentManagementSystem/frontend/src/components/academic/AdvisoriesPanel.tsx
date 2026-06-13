import React, { useState } from 'react'
import { Calendar, Plus, Trash2, CheckCircle2, Eye, XCircle, Info, Sparkles, Megaphone } from 'lucide-react'
import { useAdvisories, type Advisory } from '../../hooks/useAdvisories'
import type { Student } from '../../types/student'

interface Props {
  readonly student: Student
  readonly isStaff: boolean
}

export default function AdvisoriesPanel({ student, isStaff }: Props) {
  const { advisories, loading, error, createAdvisory, updateAdvisoryStatus, deleteAdvisory } = useAdvisories(student.id)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<Advisory['type']>('ACADEMIC')
  const [priority, setPriority] = useState<Advisory['priority']>('MEDIUM')
  const [actionError, setActionError] = useState<string | null>(null)

  const handleCreateSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return

    try {
      setActionError(null)
      await createAdvisory({
        title: title.trim(),
        message: message.trim(),
        type,
        priority
      })
      // Reset form
      setTitle('')
      setMessage('')
      setType('ACADEMIC')
      setPriority('MEDIUM')
      setShowCreateForm(false)
    } catch (err: any) {
      setActionError(err.message || 'Failed to create advisory')
    }
  }

  // Auto-Drafting recommendation logic
  const handleAutoDraft = () => {
    setActionError(null)
    const gpa = student.gpa
    const attendance = student.attendanceRate ?? 100
    const pScore = student.placementScore ?? 0

    if (type === 'ATTENDANCE' || (attendance < 75 && type === 'ACADEMIC')) {
      setTitle(`Attendance Warning & Support Recommendation`)
      setMessage(
        `Dear ${student.firstName},\n\nYour current attendance rate is ${attendance}%, which falls below the institutional threshold of 75%. This is negatively impacting your class performance and academic eligibility.\n\nAction Required:\n1. Meet with your course coordinators to discuss missed lectures.\n2. Submit documentation for any excused absences.\n3. Ensure regular presence in all subsequent sessions.`
      )
      setPriority(attendance < 65 ? 'CRITICAL' : 'HIGH')
    } else if (type === 'ACADEMIC' || (gpa < 7 && type === 'SKILL_DEVELOPMENT')) {
      setTitle(`Academic Performance Counseling`)
      setMessage(
        `Dear ${student.firstName},\n\nWe have reviewed your performance metrics. Your CGPA stands at ${gpa.toFixed(2)}. To ensure strong placement eligibility and clear academic progression, we recommend supplementary preparation.\n\nAction Required:\n1. Enroll in peer-tutoring sessions for core subjects.\n2. Dedicate at least 4 hours weekly to academic review.\n3. Schedule a session with the departmental advisor.`
      )
      setPriority(gpa < 6 ? 'CRITICAL' : 'MEDIUM')
    } else if (type === 'PLACEMENT' || (pScore < 60 && type === 'PORTFOLIO')) {
      setTitle(`Placement Readiness Support Directive`)
      setMessage(
        `Dear ${student.firstName},\n\nYour placement readiness index is currently evaluated at ${pScore}/100. To align with tier-1 company requirements, your technical profile needs reinforcement.\n\nAction Required:\n1. Solve at least 3 coding challenges daily on LeetCode/HackerRank.\n2. Attend the upcoming placement preparation mock interview sessions.\n3. Revise data structures and algorithms fundamentals.`
      )
      setPriority(pScore < 40 ? 'CRITICAL' : 'HIGH')
    } else if (type === 'PORTFOLIO') {
      setTitle(`Portfolio & Project Upgrade Advisory`)
      setMessage(
        `Dear ${student.firstName},\n\nYour academic portfolio registry requires immediate enhancement. Having a strong online presence is essential for industrial placement.\n\nAction Required:\n1. Add at least two full-stack or data science projects with clean source code.\n2. Update your README.md files with system architecture and demo links.\n3. Verify that your GitHub and LinkedIn profile links are updated in the registry.`
      )
      setPriority('MEDIUM')
    } else if (type === 'SKILL_DEVELOPMENT') {
      setTitle(`Technical Skill Gap Recommendations`)
      setMessage(
        `Dear ${student.firstName},\n\nBased on your profile, we have identified key technical gaps. Industrial recruiters are prioritizing competencies in modern framework stacks.\n\nAction Required:\n1. Complete certification or learning path for React, Spring Boot, or AWS Cloud.\n2. Build a project utilizing these targeted frameworks.\n3. Add these verified skills to your SMS profile.`
      )
      setPriority('MEDIUM')
    } else if (type === 'CERTIFICATE_RECOMMENDATIONS') {
      setTitle(`Professional Certification Directive`)
      setMessage(
        `Dear ${student.firstName},\n\nWe recommend completing certified credentials to distinguish your professional profile.\n\nAction Required:\n1. Pursue industry-standard credentials (e.g., AWS Certified Cloud Practitioner, Oracle Java, or Google Data Analytics).\n2. Register the certificate links once completed under the Certificates registry tab.`
      )
      setPriority('LOW')
    }
  }

  const getPriorityBadge = (p: Advisory['priority']) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getStatusBadge = (s: Advisory['status']) => {
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'DISMISSED':
        return 'bg-slate-400/10 text-slate-500 border-slate-400/20'
      case 'VIEWED':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getTypeLabel = (t: Advisory['type']) => {
    return t.replaceAll('_', ' ')
  }

  const renderTimeline = () => {
    if (loading && advisories.length === 0) {
      return <div className="py-8 text-center text-sm text-slate-500">Loading advisories timeline...</div>
    }
    if (error) {
      return (
        <div className="p-3 bg-vault-destructive/10 border border-vault-destructive/20 text-vault-destructive rounded-xl text-xs font-semibold">
          {error}
        </div>
      )
    }
    if (advisories.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-8 text-center text-slate-400">
          <Info className="mx-auto mb-2 opacity-50" size={20} />
          <p className="text-sm font-semibold">No active advisories found for this student.</p>
          <p className="text-xs mt-1">Institutional advisors and faculty can issue targeted interventions here.</p>
        </div>
      )
    }
    return (
      <div className="relative pl-6 border-l border-slate-200 dark:border-white/10 space-y-5">
        {advisories.map((adv) => (
          <div key={adv.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-vault-accent border-2 border-white dark:border-[#0b0f19]" />

            <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-vault-cyan">
                    {getTypeLabel(adv.type)}
                  </span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${getPriorityBadge(adv.priority)}`}>
                    {adv.priority}
                  </span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${getStatusBadge(adv.status)}`}>
                    {adv.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  <Calendar size={11} />
                  <span>{adv.createdAt ? new Date(adv.createdAt).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{adv.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {adv.message}
                </p>
              </div>

              {/* INTERACTIVE ACTIONS */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex gap-2">
                  {adv.status === 'PENDING' && (
                    <button
                      onClick={() => adv.id && updateAdvisoryStatus(adv.id, 'VIEWED')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-500 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                    >
                      <Eye size={11} />
                      <span>Mark Viewed</span>
                    </button>
                  )}
                  {(adv.status === 'PENDING' || adv.status === 'VIEWED') && (
                    <>
                      <button
                        onClick={() => adv.id && updateAdvisoryStatus(adv.id, 'COMPLETED')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                      >
                        <CheckCircle2 size={11} />
                        <span>Resolve / Complete</span>
                      </button>
                      <button
                        onClick={() => adv.id && updateAdvisoryStatus(adv.id, 'DISMISSED')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-400/10 hover:bg-slate-400/20 border border-slate-400/20 text-slate-500 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                      >
                        <XCircle size={11} />
                        <span>Dismiss</span>
                      </button>
                    </>
                  )}
                </div>

                {isStaff && adv.id !== undefined && (
                  <button
                    onClick={() => adv.id && deleteAdvisory(adv.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone size={15} className="text-vault-accent" />
          <span>Student Advisory Timeline</span>
        </h3>
        {isStaff && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-vault-accent hover:bg-vault-accent/90 text-white font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Plus size={12} />
            <span>Generate Advisory</span>
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-3 bg-vault-destructive/10 border border-vault-destructive/20 text-vault-destructive rounded-xl text-xs font-semibold">
          {actionError}
        </div>
      )}

      {/* CREATE ADVISORY FORM */}
      {showCreateForm && isStaff && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles size={14} className="text-vault-cyan" />
              <span>Compose Advisory Plan</span>
            </h4>
            <button
              onClick={handleAutoDraft}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 bg-vault-cyan/10 hover:bg-vault-cyan/20 border border-vault-cyan/35 text-vault-cyan rounded-lg text-[10px] font-black uppercase cursor-pointer"
            >
              <Sparkles size={11} />
              <span>Auto-Draft Recommendations</span>
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="advType" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Advisory Type</label>
                <select
                  id="advType"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-vault-fg focus:outline-none"
                >
                  <option value="ACADEMIC">Academic</option>
                  <option value="PLACEMENT">Placement</option>
                  <option value="ATTENDANCE">Attendance</option>
                  <option value="PORTFOLIO">Portfolio</option>
                  <option value="SKILL_DEVELOPMENT">Skill Development</option>
                  <option value="CERTIFICATE_RECOMMENDATIONS">Certificate Recommendations</option>
                </select>
              </div>

              <div>
                <label htmlFor="advPriority" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Severity / Priority</label>
                <select
                  id="advPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-vault-fg focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="advTitle" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Advisory Title</label>
              <input
                id="advTitle"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-vault-fg focus:outline-none"
                placeholder="e.g. Action Required: Attendance Recovery Plan"
              />
            </div>

            <div>
              <label htmlFor="advMessage" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Detailed Message & Directives</label>
              <textarea
                id="advMessage"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-vault-fg focus:outline-none whitespace-pre-wrap"
                placeholder="Write specific, actionable steps for the student..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-xs rounded-xl cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/90 text-white text-xs rounded-xl cursor-pointer font-bold shadow-md"
              >
                Dispatch Advisory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TIMELINE LIST */}
      {renderTimeline()}
    </div>
  )
}
