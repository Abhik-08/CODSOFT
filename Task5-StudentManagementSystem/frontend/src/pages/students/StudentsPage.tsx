import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Trash2, Eye, X, AlertCircle, Check, Pencil } from 'lucide-react'
import { useStudents } from '../../hooks/useStudents'
import StudentForm from '../../components/StudentForm'
import type { Student } from '../../types/student'

export default function StudentsPage() {
  const { students, loading, error, addStudent, updateStudent, deleteStudent, bulkDelete } = useStudents()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Edit modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editEnrollmentNumber, setEditEnrollmentNumber] = useState('')
  const [editDateOfBirth, setEditDateOfBirth] = useState('')
  const [editDepartment, setEditDepartment] = useState('Computer Science')
  const [editSemester, setEditSemester] = useState('1')
  const [editStatus, setEditStatus] = useState<Student['status']>('ACTIVE')
  const [editGpa, setEditGpa] = useState('8.5')
  const [editAttendanceRate, setEditAttendanceRate] = useState('100')
  const [editPlacementStatus, setEditPlacementStatus] = useState<Student['placementStatus']>('NOT_STARTED')
  const [editOfferCount, setEditOfferCount] = useState('0')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editGithubUrl, setEditGithubUrl] = useState('')
  const [editLinkedinUrl, setEditLinkedinUrl] = useState('')
  const [editPortfolioUrl, setEditPortfolioUrl] = useState('')
  const [editPortfolioTitle, setEditPortfolioTitle] = useState('')
  const [editPortfolioSummary, setEditPortfolioSummary] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [editFormError, setEditFormError] = useState<string | null>(null)

  // Add form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [department, setDepartment] = useState('Computer Science')
  const [semester, setSemester] = useState('1')
  const [status, setStatus] = useState<Student['status']>('ACTIVE')
  const [gpa, setGpa] = useState('8.5')
  const [phone, setPhone] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [portfolioTitle, setPortfolioTitle] = useState('')
  const [portfolioSummary, setPortfolioSummary] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Toast
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map(s => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (!globalThis.confirm(`Are you sure you want to remove the ${selectedIds.length} selected student records?`)) return
    try {
      const count = selectedIds.length
      await bulkDelete(selectedIds)
      setSelectedIds([])
      triggerToast(`${count} student records deleted.`)
    } catch (err) {
      console.error('Bulk delete error:', err)
    }
  }

  const getLastActivity = (id: string) => {
    const hours = ((id.codePointAt(0) || 0) + (id.codePointAt(id.length - 1) || 0)) % 11 + 1
    const mins = (id.codePointAt(1) || 0) % 60
    return `${hours}h ${mins}m ago`
  }

  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = !query || (
      s.firstName.toLowerCase().includes(query) ||
      s.lastName.toLowerCase().includes(query) ||
      s.enrollmentNumber.toLowerCase().includes(query) ||
      s.department.toLowerCase().includes(query)
    )
    const matchesDept = deptFilter === 'ALL' || s.department === deptFilter
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
    return matchesSearch && matchesDept && matchesStatus
  })

  const handleAddStudent = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !enrollmentNumber || !dateOfBirth) {
      setFormError('Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    setFormError(null)
    try {
      await addStudent({
        firstName,
        lastName,
        email,
        enrollmentNumber,
        dateOfBirth,
        department,
        semester: Number(semester),
        status,
        gpa: Number(gpa) || 8,
        imageUrl: '',
        phone,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        portfolioTitle,
        portfolioSummary
      })
      setIsAddModalOpen(false)
      resetForm()
      triggerToast('Student profile registered successfully!')
    } catch (err: any) {
      console.error('Firestore add student error:', err)
      setFormError('Failed to register student. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (student: Student) => {
    setEditingStudent(student)
    setEditFirstName(student.firstName)
    setEditLastName(student.lastName)
    setEditEmail(student.email)
    setEditEnrollmentNumber(student.enrollmentNumber)
    setEditDateOfBirth(student.dateOfBirth || '')
    setEditDepartment(student.department)
    setEditSemester(String(student.semester))
    setEditStatus(student.status)
    setEditGpa(String(student.gpa))
    setEditAttendanceRate(String(student.attendanceRate ?? 100))
    setEditPlacementStatus(student.placementStatus || 'NOT_STARTED')
    setEditOfferCount(String(student.offerCount ?? 0))
    setEditImageUrl(student.imageUrl || '')
    setEditPhone(student.phone || '')
    setEditGithubUrl(student.githubUrl || '')
    setEditLinkedinUrl(student.linkedinUrl || '')
    setEditPortfolioUrl(student.portfolioUrl || '')
    setEditPortfolioTitle(student.portfolioTitle || '')
    setEditPortfolioSummary(student.portfolioSummary || '')
    setEditFormError(null)
    setIsEditModalOpen(true)
  }

  const handleUpdateStudent = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    if (!editFirstName || !editLastName || !editEmail || !editEnrollmentNumber) {
      setEditFormError('Please fill in all required fields.')
      return
    }
    setIsEditSubmitting(true)
    setEditFormError(null)
    try {
      await updateStudent(editingStudent.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        enrollmentNumber: editEnrollmentNumber,
        dateOfBirth: editDateOfBirth,
        department: editDepartment,
        semester: Number(editSemester),
        status: editStatus,
        gpa: Number(editGpa) || editingStudent.gpa,
        attendanceRate: Number(editAttendanceRate) || 100,
        placementStatus: editPlacementStatus,
        offerCount: Number(editOfferCount) || 0,
        imageUrl: editImageUrl,
        phone: editPhone,
        githubUrl: editGithubUrl,
        linkedinUrl: editLinkedinUrl,
        portfolioUrl: editPortfolioUrl,
        portfolioTitle: editPortfolioTitle,
        portfolioSummary: editPortfolioSummary
      })
      setIsEditModalOpen(false)
      setEditingStudent(null)
      triggerToast(`${editFirstName} ${editLastName}'s profile updated successfully!`)
    } catch (err: any) {
      console.error('Update student error:', err)
      setEditFormError('Failed to update student. Please try again.')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!globalThis.confirm('Are you sure you want to remove this student from the registry?')) return
    try {
      await deleteStudent(id)
      triggerToast('Student record removed successfully.')
    } catch (err: any) {
      console.error('Firestore delete student error:', err)
    }
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setEnrollmentNumber('')
    setDateOfBirth('')
    setDepartment('Computer Science')
    setSemester('1')
    setStatus('ACTIVE')
    setGpa('8.5')
    setPhone('')
    setGithubUrl('')
    setLinkedinUrl('')
    setPortfolioUrl('')
    setPortfolioTitle('')
    setPortfolioSummary('')
    setFormError(null)
  }

  const getStatusStyle = (s: Student['status']) => {
    switch (s) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
      case 'SUSPENDED':
        return 'bg-red-500/10 text-red-500 border border-red-500/20'
      case 'GRADUATED':
        return 'bg-vault-cyan/10 text-vault-cyan border border-vault-cyan/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    }
  }

  const DEPARTMENTS = [
    'Computer Science',
    'Information Technology',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Data Science',
    'Electronics & Communication',
  ]

  const renderRegistryContent = () => {
    if (loading) {
      return (
        <div className="p-6 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 opacity-50">
            {['hdr-w6', 'hdr-w28a', 'hdr-w28b', 'hdr-w28c', 'hdr-w8', 'hdr-w12', 'hdr-w20', 'hdr-w16', 'hdr-w18'].map((key) => {
              const w = key.replace('hdr-', '');
              return <div key={key} className={`h-4 ${w} bg-slate-200 dark:bg-white/5 rounded animate-pulse`} />;
            })}
          </div>
          {['skel-row-1', 'skel-row-2', 'skel-row-3', 'skel-row-4'].map((rowKey) => (
            <div key={rowKey} className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-white/5 last:border-none">
              <div className="h-4 w-4 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
              <div className="flex items-center gap-3 flex-1 ml-4">
                <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-[140px]">
                  <div className="h-3.5 bg-slate-200 dark:bg-white/5 rounded animate-pulse w-full" />
                  <div className="h-2.5 bg-slate-200 dark:bg-white/5 rounded animate-pulse w-[80%]" />
                </div>
              </div>
              {['col-w28a', 'col-w28b', 'col-w8', 'col-w12', 'col-w20', 'col-w16'].map((key) => {
                const w = key.replace(/^col-/, '');
                return <div key={key} className={`h-4 ${w} bg-slate-200 dark:bg-white/5 rounded animate-pulse mx-4`} />;
              })}
              <div className="h-8 w-20 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse ml-4" />
            </div>
          ))}
        </div>
      )
    }

    if (filteredStudents.length > 0) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 dark:border-slate-700 text-vault-accent focus:ring-vault-accent accent-vault-accent cursor-pointer h-3.5 w-3.5"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                  />
                </th>
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Enrollment No.</th>
                <th className="p-4 font-bold">Department</th>
                <th className="p-4 text-center font-bold">Sem</th>
                <th className="p-4 text-center font-bold">CGPA</th>
                <th className="p-4 font-bold">Last Activity</th>
                <th className="p-4 text-center font-bold">Status</th>
                <th className="p-4 text-center pr-6 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors duration-150 group">
                  <td className="p-4 pl-6">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 dark:border-slate-800 text-vault-accent focus:ring-vault-accent accent-vault-accent cursor-pointer h-3.5 w-3.5"
                      checked={selectedIds.includes(student.id)}
                      onChange={() => handleSelectRow(student.id)}
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-vault-accent/10 border border-vault-accent/20 overflow-hidden flex items-center justify-center font-bold text-vault-accent text-xs shrink-0">
                      {student.imageUrl ? (
                        <img
                          src={student.imageUrl.startsWith('localstorage://') ? (localStorage.getItem(`avatar_student_${student.id}`) || '') : student.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%232563eb" opacity="0.15"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="12" fill="%232563eb">${student.firstName[0] || ''}${student.lastName[0] || ''}</text></svg>`;
                          }}
                        />
                      ) : (
                        <span>{student.firstName[0]}{student.lastName[0]}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-slate-805 dark:text-slate-200 leading-none">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 font-semibold">{student.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-400 font-medium">{student.enrollmentNumber}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{student.department}</td>
                  <td className="p-4 text-center text-slate-700 dark:text-slate-300 font-mono font-medium">{student.semester}</td>
                  <td className="p-4 text-center font-mono">
                    <span className="font-bold text-vault-accent bg-vault-accent/10 px-2 py-0.5 rounded border border-vault-accent/20">
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-semibold font-mono text-[10px]">
                    {getLastActivity(student.id)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${getStatusStyle(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 text-center pr-6">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/dashboard/students/${student.id}`)}
                        className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-vault-accent transition-colors cursor-pointer"
                        title="Edit Student Profile"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove Student Record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-40 h-40 flex items-center justify-center"
        >
          <div className="absolute w-28 h-28 rounded-full bg-vault-accent/5 blur-[25px] animate-pulse" />
          <div className="absolute w-20 h-20 rounded-full bg-vault-cyan/5 blur-[15px] animate-pulse delay-700" />
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible relative z-10">
            <defs>
              <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-vault-accent)" />
                <stop offset="100%" stopColor="var(--color-vault-cyan)" />
              </linearGradient>
            </defs>
            <motion.circle cx="100" cy="100" r="65" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="1.5" strokeDasharray="6 8" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 24, ease: "linear" }} />
            <motion.circle cx="100" cy="100" r="50" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" strokeDasharray="4 6" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 16, ease: "linear" }} />
            <g transform="translate(65, 55)">
              <motion.g animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                <path d="M 0 10 A 35 10 0 0 0 70 10 A 35 10 0 0 0 0 10 Z M 0 10 L 0 25 A 35 10 0 0 0 70 25 L 70 10 Z" fill="url(#dbGrad)" opacity="0.9" />
                <ellipse cx="35" cy="10" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.4" />
              </motion.g>
              <motion.g animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}>
                <path d="M 0 32 A 35 10 0 0 0 70 32 A 35 10 0 0 0 0 32 Z M 0 32 L 0 47 A 35 10 0 0 0 70 47 L 70 32 Z" fill="url(#dbGrad)" opacity="0.75" />
                <ellipse cx="35" cy="32" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.3" />
              </motion.g>
              <g>
                <path d="M 0 54 A 35 10 0 0 0 70 54 A 35 10 0 0 0 0 54 Z M 0 54 L 0 69 A 35 10 0 0 0 70 69 L 70 54 Z" fill="url(#dbGrad)" opacity="0.6" />
                <ellipse cx="35" cy="54" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.2" />
              </g>
            </g>
            <motion.circle cx="45" cy="80" r="3" fill="var(--color-vault-accent)" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3.5 }} />
            <motion.circle cx="160" cy="110" r="2.5" fill="var(--color-vault-cyan)" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4.2 }} />
          </svg>
        </motion.div>
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
            {searchQuery ? 'No Matching Records Found' : 'No Students Added Yet'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
            {searchQuery
              ? 'Refine your search parameters or check the spelling matches.'
              : 'Start building your academic intelligence database by registering your first student.'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan hover:opacity-95 text-white rounded-xl font-bold text-xs shadow-md shadow-vault-accent/15 cursor-pointer transition-all duration-200"
        >
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Student Registry Console
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Manage, search, register and update student academic intelligence profiles.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true) }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan hover:opacity-95 text-white rounded-xl transition-all shadow-md shadow-vault-accent/10 hover:shadow-vault-accent/20 cursor-pointer font-extrabold text-xs"
        >
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-vault-destructive/10 border border-vault-destructive/20 text-vault-destructive rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registry Panel */}
      <div className="bg-white dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/10">
          <div className="relative flex items-center w-full max-w-md rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-350 dark:hover:border-slate-700">
            <Search size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, enrollment, or department..."
              className="w-full bg-transparent pl-11 pr-4 py-2.5 text-xs text-vault-fg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl animate-fadeIn text-xs font-bold">
                <span>{selectedIds.length} Selected</span>
                <button onClick={handleBulkDelete} className="hover:underline cursor-pointer flex items-center gap-1 font-black text-red-500">
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>
            )}

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="field-surface text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field-surface text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="GRADUATED">GRADUATED</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        {renderRegistryContent()}
      </div>

      {/* ── ADD STUDENT MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-left relative my-8"
          >
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-vault-fg transition-colors cursor-pointer" aria-label="Close">
              <X size={16} />
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={20} className="text-vault-accent" />
              <span>Register Student Profile</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Register a new academic profile directly to the database registry.</p>
            <StudentForm
              isEdit={false}
              fName={firstName} setFName={setFirstName}
              lName={lastName} setLName={setLastName}
              em={email} setEm={setEmail}
              enroll={enrollmentNumber} setEnroll={setEnrollmentNumber}
              dob={dateOfBirth} setDob={setDateOfBirth}
              dept={department} setDept={setDepartment}
              sem={semester} setSem={setSemester}
              st={status} setSt={setStatus}
              cgpa={gpa} setCgpa={setGpa}
              phone={phone} setPhone={setPhone}
              githubUrl={githubUrl} setGithubUrl={setGithubUrl}
              linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl}
              portfolioUrl={portfolioUrl} setPortfolioUrl={setPortfolioUrl}
              portfolioTitle={portfolioTitle} setPortfolioTitle={setPortfolioTitle}
              portfolioSummary={portfolioSummary} setPortfolioSummary={setPortfolioSummary}
              formErr={formError}
              submitting={isSubmitting}
              onCancel={() => setIsAddModalOpen(false)}
              onSubmit={handleAddStudent}
            />
          </motion.div>
        </div>
      )}

      {/* ── EDIT STUDENT MODAL ── */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-left relative my-8"
          >
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-vault-fg transition-colors cursor-pointer" aria-label="Close">
              <X size={16} />
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Pencil size={18} className="text-vault-accent" />
              <span>Edit Student Profile</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Editing: <span className="text-vault-accent font-bold">{editingStudent.firstName} {editingStudent.lastName}</span> · {editingStudent.enrollmentNumber}
            </p>
            <StudentForm
              isEdit={true}
              fName={editFirstName} setFName={setEditFirstName}
              lName={editLastName} setLName={setEditLastName}
              em={editEmail} setEm={setEditEmail}
              enroll={editEnrollmentNumber} setEnroll={setEditEnrollmentNumber}
              dob={editDateOfBirth} setDob={setEditDateOfBirth}
              dept={editDepartment} setDept={setEditDepartment}
              sem={editSemester} setSem={setEditSemester}
              st={editStatus} setSt={setEditStatus}
              cgpa={editGpa} setCgpa={setEditGpa}
              attendanceRate={editAttendanceRate} setAttendanceRate={setEditAttendanceRate}
              placementStatus={editPlacementStatus} setPlacementStatus={setEditPlacementStatus}
              offerCount={editOfferCount} setOfferCount={setEditOfferCount}
              imageUrl={editImageUrl} setImageUrl={setEditImageUrl}
              phone={editPhone} setPhone={setEditPhone}
              githubUrl={editGithubUrl} setGithubUrl={setEditGithubUrl}
              linkedinUrl={editLinkedinUrl} setLinkedinUrl={setEditLinkedinUrl}
              portfolioUrl={editPortfolioUrl} setPortfolioUrl={setEditPortfolioUrl}
              portfolioTitle={editPortfolioTitle} setPortfolioTitle={setEditPortfolioTitle}
              portfolioSummary={editPortfolioSummary} setPortfolioSummary={setEditPortfolioSummary}
              formErr={editFormError}
              submitting={isEditSubmitting}
              onCancel={() => setIsEditModalOpen(false)}
              onSubmit={handleUpdateStudent}
            />
          </motion.div>
        </div>
      )}

      {/* Toast */}
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
              <p className="font-extrabold text-slate-800 dark:text-white leading-none">Registry Success</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
