import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, CalendarCheck, Check, ClipboardList, GraduationCap, UserRound, Pencil } from 'lucide-react'
import { studentService } from '../../services/studentService'
import { useAcademicProfile } from '../../hooks/useAcademicProfile'
import type { Student, Grade, Attendance } from '../../types/student'
import StudentProfileEditModal from '../../components/students/StudentProfileEditModal'

// Academic tab components
import SemesterTimeline from '../../components/academic/SemesterTimeline'
import SubjectTable from '../../components/academic/SubjectTable'
import CgpaTrendChart from '../../components/academic/CgpaTrendChart'
import CertificatesPanel from '../../components/academic/CertificatesPanel'
import ProjectsPanel from '../../components/academic/ProjectsPanel'
import AchievementsPanel from '../../components/academic/AchievementsPanel'
import SkillsPanel from '../../components/academic/SkillsPanel'
import PlacementStatusCard from '../../components/academic/PlacementStatusCard'
import PlacementIntelligencePanel from '../../components/academic/PlacementIntelligencePanel'
import AcademicRiskPanel from '../../components/academic/AcademicRiskPanel'
import { apiClient } from '../../services/apiClient'

type TabKey = 'personal' | 'semesters' | 'subjects' | 'cgpa' | 'certificates' | 'projects' | 'achievements' | 'skills' | 'placement' | 'placement-intelligence' | 'academic-risk' | 'history'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'personal', label: 'Personal' },
  { key: 'semesters', label: 'Semesters' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'cgpa', label: 'CGPA Trend' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'projects', label: 'Projects' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'skills', label: 'Skills' },
  { key: 'placement', label: 'Placement' },
  { key: 'placement-intelligence', label: 'Placement Intel' },
  { key: 'academic-risk', label: 'Academic Risk' },
  { key: 'history', label: 'Edit History' },
]


export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [showEditModal, setShowEditModal] = useState(false)

  // Academic profile hook
  const academic = useAcademicProfile(id)

  // Grade modal states
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [courseId, setCourseId] = useState('')
  const [score, setScore] = useState('90')
  const [gradeSemester, setGradeSemester] = useState('Spring 2026')

  // Attendance modal states
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0])
  const [attStatus, setAttStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>('PRESENT')
  const [attRemarks, setAttRemarks] = useState('')

  // Success toast states
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  const fetchStudentDetails = async () => {
    if (!id) return
    try {
      const data = await studentService.getById(id)
      setStudent(data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch student details:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to fetch student details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (updatedData: Partial<Student>, changedBy: string) => {
    if (!id || !student) return
    try {
      setLoading(true)
      const updatedStudent = await studentService.updateWithHistory(id, updatedData, student, changedBy)
      setStudent(updatedStudent)
      
      try {
        await apiClient.post(`/students/${id}/placement-intelligence/recalculate`)
        await apiClient.post(`/students/${id}/academic-risk/recalculate`)
      } catch (err) {
        console.error('Failed to trigger recalculation after profile update:', err)
      }
      
      triggerToast('Student profile updated successfully!')
    } catch (err: any) {
      console.error('Failed to save student profile:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentDetails()
  }, [id])

  const handleAddGradeSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!student || !id) return

    const scoreNum = Number(score)
    let gradeLetter = 'F'
    if (scoreNum >= 90) gradeLetter = 'A'
    else if (scoreNum >= 80) gradeLetter = 'B'
    else if (scoreNum >= 70) gradeLetter = 'C'
    else if (scoreNum >= 60) gradeLetter = 'D'

    const newGrade: Grade = {
      id: 'g_' + Date.now(),
      courseId,
      courseName,
      score: scoreNum,
      gradeLetter,
      semester: gradeSemester,
      dateRecorded: new Date().toISOString().split('T')[0]
    }

    const updatedGrades = [...(student.grades || []), newGrade]
    const totalScore = updatedGrades.reduce((sum, g) => sum + g.score, 0)
    const newGpa = Number(((totalScore / updatedGrades.length) / 10).toFixed(2))

    try {
      setLoading(true)
      await studentService.update(id, {
        grades: updatedGrades,
        gpa: newGpa
      })
      setShowGradeModal(false)
      // Reset form
      setCourseName('')
      setCourseId('')
      setScore('90')
      await fetchStudentDetails()
      try {
        await apiClient.post(`/students/${id}/placement-intelligence/recalculate`)
        await apiClient.post(`/students/${id}/academic-risk/recalculate`)
      } catch (err) {
        console.error('Failed to trigger recalculation on grade add:', err)
      }
      triggerToast('Academic grade added successfully!')
    } catch (err) {
      console.error('Failed to add grade:', err)
      setLoading(false)
    }
  }

  const handleAttendanceSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!student || !id) return

    // Do NOT include `remarks` key when empty — Firestore rejects explicit `undefined` values.
    const newRecord: Attendance = {
      date: attDate,
      status: attStatus,
      ...(attRemarks.trim() ? { remarks: attRemarks.trim() } : {})
    }

    const updatedAttendance = [...(student.attendance || []), newRecord]
    const presentCount = updatedAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
    const newAttendanceRate = Number(((presentCount / updatedAttendance.length) * 100).toFixed(1))

    try {
      setLoading(true)
      await studentService.update(id, {
        attendance: updatedAttendance,
        attendanceRate: newAttendanceRate
      })
      setShowAttendanceModal(false)
      // Reset form
      setAttDate(new Date().toISOString().split('T')[0])
      setAttStatus('PRESENT')
      setAttRemarks('')
      await fetchStudentDetails()
      try {
        await apiClient.post(`/students/${id}/placement-intelligence/recalculate`)
        await apiClient.post(`/students/${id}/academic-risk/recalculate`)
      } catch (err) {
        console.error('Failed to trigger recalculation on attendance add:', err)
      }
      triggerToast('Attendance record recorded successfully!')
    } catch (err) {
      console.error('Failed to record attendance:', err)
      setLoading(false)
    }
  }

  const inputCls = "field-surface w-full rounded-xl bg-white dark:bg-white/5 px-3 py-2 text-sm text-vault-fg focus:outline-none"
  const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1"
  const studentInitials = student ? `${student.firstName[0] || ''}${student.lastName[0] || ''}` : 'NA'
  const attendanceRate = student?.attendanceRate ?? (
    student?.attendance?.length
      ? Number(((student.attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length / student.attendance.length) * 100).toFixed(1))
      : 0
  )

  if (loading && !student) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded" />
        <div className="vault-glass p-8 rounded-xl border border-vault-border space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-white/5 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded" />
              <div className="h-3 w-36 bg-slate-200 dark:bg-white/5 rounded" />
              <div className="h-3 w-40 bg-slate-200 dark:bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Tab Content Renderer ──────────────────────────────────────────

  const renderTabContent = () => {
    if (!student || !id) return null

    switch (activeTab) {
      case 'semesters':
        return <SemesterTimeline semesters={academic.semesters} onAdd={academic.addSemester} onUpdate={academic.updateSemester} onDelete={academic.deleteSemester} />
      case 'subjects':
        return <SubjectTable subjects={academic.subjects} onAdd={academic.addSubject} onUpdate={academic.updateSubject} onDelete={academic.deleteSubject} />
      case 'cgpa':
        return <CgpaTrendChart semesters={academic.semesters} />
      case 'certificates':
        return <CertificatesPanel certificates={academic.certificates} onAdd={academic.addCertificate} onUpdate={academic.updateCertificate} onDelete={academic.deleteCertificate} />
      case 'projects':
        return <ProjectsPanel projects={academic.projects} onAdd={academic.addProject} onUpdate={academic.updateProject} onDelete={academic.deleteProject} />
      case 'achievements':
        return <AchievementsPanel achievements={academic.achievements} onAdd={academic.addAchievement} onUpdate={academic.updateAchievement} onDelete={academic.deleteAchievement} />
      case 'skills':
        return <SkillsPanel skills={academic.skills} onAdd={academic.addSkill} onUpdate={academic.updateSkill} onDelete={academic.deleteSkill} />
      case 'placement':
        return <PlacementStatusCard studentId={id} currentStatus={student.placementStatus || 'NOT_STARTED'} currentOfferCount={student.offerCount || 0} />
      case 'placement-intelligence':
        return <PlacementIntelligencePanel studentId={id} />
      case 'academic-risk':
        return <AcademicRiskPanel studentId={id} />
      case 'history':
        return renderHistoryTab()
      default:
        return renderPersonalTab()
    }
  }

  const renderHistoryTab = () => {
    if (!student) return null
    const historyList = academic.history || []
    
    const formatTimestamp = (ts: any) => {
      if (!ts) return 'Just now'
      if (typeof ts.toDate === 'function') {
        return ts.toDate().toLocaleString()
      }
      if (ts instanceof Date) {
        return ts.toLocaleString()
      }
      if (ts.seconds !== undefined) {
        return new Date(ts.seconds * 1000).toLocaleString()
      }
      return String(ts)
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList size={15} className="text-vault-accent" />
          <span>Profile Change Logs</span>
        </h3>
        {historyList.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No profile change records logged yet.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-vault-accent/20 space-y-4 text-left">
            {historyList.map((record, index) => (
              <motion.div
                key={record.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <div className="absolute -left-[31px] top-3 h-3 w-3 rounded-full bg-vault-accent border-2 border-white dark:border-[#0b0f19]" />
                <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        Changed field: <span className="text-vault-cyan">{record.fieldChanged}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                        By {record.changedBy} • {formatTimestamp(record.changedAt || record.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Previous Value</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono break-all mt-1">
                        {record.oldValue === '' ? <span className="text-slate-400 italic">None</span> : record.oldValue}
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Updated Value</p>
                      <p className="text-xs font-semibold text-vault-accent font-mono break-all mt-1">
                        {record.newValue === '' ? <span className="text-slate-400 italic">Cleared</span> : record.newValue}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderPersonalTab = () => {
    if (!student) return null
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <UserRound size={15} className="text-vault-cyan" />
            <span>Personal & Contact Info</span>
          </h3>
          <div className="space-y-3 text-sm">
            {[
              ['Name', `${student.firstName} ${student.lastName}`],
              ['Email', student.email],
              ['Phone', student.phone || 'Not provided'],
              ['Department', student.department],
              ['Semester', String(student.semester)],
              ['Enrollment', student.enrollmentNumber],
              ['DOB', student.dateOfBirth || 'Not provided'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-2 last:border-0">
                <span className="text-slate-500 dark:text-slate-400 font-bold">{label}</span>
                <span className="text-right text-slate-800 dark:text-slate-200 font-semibold break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={15} className="text-vault-accent" />
            <span>Portfolio & Socials</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold">GitHub</span>
              <span className="text-right font-semibold truncate max-w-[200px]">
                {student.githubUrl ? (
                  <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="text-vault-cyan hover:underline break-all">
                    {student.githubUrl}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold">LinkedIn</span>
              <span className="text-right font-semibold truncate max-w-[200px]">
                {student.linkedinUrl ? (
                  <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-vault-cyan hover:underline break-all">
                    {student.linkedinUrl}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Portfolio Heading</span>
              <span className="text-right text-slate-800 dark:text-slate-200 font-semibold break-all">
                {student.portfolioTitle || 'Not provided'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-2">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Portfolio Link</span>
              <span className="text-right font-semibold truncate max-w-[200px]">
                {student.portfolioUrl ? (
                  <a href={student.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-vault-cyan hover:underline break-all">
                    {student.portfolioUrl}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-left">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Portfolio Summary</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg italic mt-1 whitespace-pre-line leading-relaxed border border-slate-200 dark:border-white/5">
                {student.portfolioSummary || 'No portfolio summary registered.'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap size={15} className="text-vault-accent" />
            <span>Academic Grades</span>
          </h3>
          {student.grades && student.grades.length > 0 ? (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {student.grades.map((grade) => (
                <div key={grade.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-800 dark:text-white truncate">{grade.courseName}</p>
                    <span className="text-[10px] font-black text-vault-accent bg-vault-accent/10 border border-vault-accent/20 px-2 py-0.5 rounded-lg">{grade.gradeLetter}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{grade.courseId} / Score {grade.score} / {grade.semester}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No grades registered for this student yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck size={15} className="text-vault-emerald" />
            <span>Attendance Record</span>
          </h3>
          {student.attendance && student.attendance.length > 0 ? (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {student.attendance.map((record, idx) => {
                const getStatusClass = (s: string) => {
                  if (s === 'PRESENT') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  if (s === 'ABSENT') return 'bg-red-500/10 text-red-600 dark:text-red-400'
                  if (s === 'LATE') return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                  return 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                }

                return (
                  <div key={`${record.date}-${idx}`} className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs">
                    <span className="font-mono text-slate-600 dark:text-slate-300">{record.date}</span>
                    {record.remarks && <span className="text-[10px] text-slate-500 italic max-w-[120px] truncate">{record.remarks}</span>}
                    <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-lg ${getStatusClass(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No attendance records generated yet.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard/students" className="inline-flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-vault-accent transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Registry</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-vault-destructive/10 border border-vault-destructive/20 text-vault-destructive rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="vault-glass rounded-2xl border border-vault-border overflow-hidden">
        <div className="p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 bg-white/55 dark:bg-white/[0.02]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-16 w-16 rounded-2xl bg-vault-accent/10 border border-vault-accent/25 flex items-center justify-center font-black text-vault-accent text-xl shrink-0">
              {studentInitials}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono px-2 py-1 bg-slate-100 dark:bg-white/5 text-vault-cyan rounded-lg border border-slate-200 dark:border-white/10">
                ID: {id || 'unknown'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-2 text-left text-slate-900 dark:text-white truncate">
                {student ? `${student.firstName} ${student.lastName}` : 'Student Not Found'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-left text-sm font-medium">
                {student ? `${student.department} / Semester ${student.semester}` : 'This student record does not exist.'}
              </p>
            </div>
          </div>
          {student && (
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-vault-fg rounded-xl transition-colors border border-slate-200 dark:border-white/10 cursor-pointer text-xs font-black"
              >
                <Pencil size={15} />
                <span>Edit Profile</span>
              </button>
              <button 
                onClick={() => setShowAttendanceModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-vault-fg rounded-xl transition-colors border border-slate-200 dark:border-white/10 cursor-pointer text-xs font-black"
              >
                <CalendarCheck size={15} />
                <span>Record Attendance</span>
              </button>
              <button 
                onClick={() => setShowGradeModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-vault-accent hover:bg-vault-accent/90 text-white rounded-xl transition-colors shadow-lg cursor-pointer text-xs font-black"
              >
                <GraduationCap size={15} />
                <span>Add Grade</span>
              </button>
            </div>
          )}
        </div>

        {student ? (
          <div className="p-6 lg:p-8 space-y-6 text-left">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">CGPA</p>
                <p className="mt-2 text-2xl font-black text-vault-accent font-mono">{student.gpa.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance</p>
                <p className="mt-2 text-2xl font-black text-vault-cyan font-mono">{attendanceRate}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Grades</p>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">{student.grades?.length || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</p>
                <p className="mt-2 text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase">{student.status}</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 dark:border-white/5 overflow-x-auto">
              <div className="flex gap-0 min-w-max">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-vault-accent text-vault-accent'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-8 text-center py-12">
            <p className="text-slate-400 text-sm">No student data found for this ID.</p>
          </div>
        )}
      </div>

      {/* Add Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="vault-glass p-6 rounded-2xl border border-vault-border max-w-md w-full space-y-4 text-left">
            <h3 className="text-lg font-black text-vault-accent">Add Academic Grade</h3>
            <form onSubmit={handleAddGradeSubmit} className="space-y-3">
              <div>
                <label htmlFor="courseName" className={labelCls}>Course Name</label>
                <input 
                  id="courseName"
                  type="text" 
                  required 
                  value={courseName} 
                  onChange={e => setCourseName(e.target.value)} 
                  className={inputCls}
                  placeholder="e.g. Database Systems" 
                />
              </div>
              <div>
                <label htmlFor="courseId" className={labelCls}>Course ID</label>
                <input 
                  id="courseId"
                  type="text" 
                  required 
                  value={courseId} 
                  onChange={e => setCourseId(e.target.value)} 
                  className={inputCls}
                  placeholder="e.g. CS-302" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="score" className={labelCls}>Score (0-100)</label>
                  <input 
                    id="score"
                    type="number" 
                    min="0" 
                    max="100" 
                    required 
                    value={score} 
                    onChange={e => setScore(e.target.value)} 
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="gradeSemester" className={labelCls}>Semester</label>
                  <input 
                    id="gradeSemester"
                    type="text" 
                    required 
                    value={gradeSemester} 
                    onChange={e => setGradeSemester(e.target.value)} 
                    className={inputCls}
                    placeholder="e.g. Spring 2026" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowGradeModal(false)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/90 text-white text-sm rounded-xl cursor-pointer font-bold"
                >
                  Add Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="vault-glass p-6 rounded-2xl border border-vault-border max-w-md w-full space-y-4 text-left">
            <h3 className="text-lg font-black text-vault-emerald">Record Attendance</h3>
            <form onSubmit={handleAttendanceSubmit} className="space-y-3">
              <div>
                <label htmlFor="attDate" className={labelCls}>Date</label>
                <input 
                  id="attDate"
                  type="date" 
                  required 
                  value={attDate} 
                  onChange={e => setAttDate(e.target.value)} 
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="attStatus" className={labelCls}>Status</label>
                <select 
                  id="attStatus"
                  value={attStatus} 
                  onChange={e => setAttStatus(e.target.value as any)} 
                  className={inputCls}
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                  <option value="EXCUSED">EXCUSED</option>
                </select>
              </div>
              <div>
                <label htmlFor="attRemarks" className={labelCls}>Remarks (Optional)</label>
                <input 
                  id="attRemarks"
                  type="text" 
                  value={attRemarks} 
                  onChange={e => setAttRemarks(e.target.value)} 
                  className={inputCls}
                  placeholder="e.g. Medical excuse" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAttendanceModal(false)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-vault-emerald hover:bg-vault-emerald/90 text-white text-sm rounded-xl cursor-pointer font-bold"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toasts */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 vault-glass border border-emerald-500/25 bg-white/95 dark:bg-[#061811]/95 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-xs border-l-4 border-l-vault-accent max-w-sm text-left"
          >
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Check size={12} className="text-vault-accent" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-white leading-none">Detail Success</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Profile Edit Modal */}
      {showEditModal && student && (
        <StudentProfileEditModal
          student={student}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

    </div>
  )
}
