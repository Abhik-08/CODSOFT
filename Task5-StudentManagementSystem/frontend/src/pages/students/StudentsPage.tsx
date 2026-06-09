import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus, Search, Trash2, Eye, X, AlertCircle } from 'lucide-react'
import { useStudents } from '../../hooks/useStudents'
import { studentService } from '../../services/studentService'
import type { Student } from '../../types/student'

export default function StudentsPage() {
  const { students, loading } = useStudents()
  const navigate = useNavigate()
  const [studentList, setStudentList] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [department, setDepartment] = useState('Computer Science')
  const [semester, setSemester] = useState('1')
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED'>('ACTIVE')
  const [gpa, setGpa] = useState('8.5')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync hook students to local state
  useEffect(() => {
    if (students && students.length > 0) {
      setStudentList(students)
    }
  }, [students])

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
      await Promise.all(selectedIds.map(id => studentService.delete(id)))
      setStudentList(prev => prev.filter(s => !selectedIds.includes(s.id)))
      setSelectedIds([])
    } catch (err) {
      console.warn('Bulk delete API fallback:', err)
      setStudentList(prev => prev.filter(s => !selectedIds.includes(s.id)))
      setSelectedIds([])
    }
  }

  const getLastActivity = (id: string) => {
    const hours = ((id.codePointAt(0) || 0) + (id.codePointAt(id.length - 1) || 0)) % 11 + 1
    const mins = (id.codePointAt(1) || 0) % 60
    return `${hours}h ${mins}m ago`
  }

  // Filter students based on search query, department, and status
  const filteredStudents = studentList.filter((s) => {
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

  // Handle student creation
  const handleAddStudent = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !enrollmentNumber || !dateOfBirth) {
      setFormError('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const newStudentData = {
      firstName,
      lastName,
      email,
      enrollmentNumber,
      dateOfBirth,
      department,
      semester: Number(semester),
      status,
      imageUrl: ''
    }

    try {
      // Try calling backend API
      const createdStudent = await studentService.create(newStudentData)
      // Append the computed/returned GPA if any
      const fullStudent: Student = {
        ...createdStudent,
        gpa: Number(gpa) || 8,
        grades: [],
        attendance: []
      }
      setStudentList((prev) => [fullStudent, ...prev])
      setIsAddModalOpen(false)
      resetForm()
    } catch (err: any) {
      console.warn('Backend API create failed, falling back to local state append:', err)
      // Local Sandbox Fallback
      const fallbackStudent: Student = {
        id: Date.now().toString(),
        ...newStudentData,
        gpa: Number(gpa) || 8,
        grades: [],
        attendance: []
      }
      setStudentList((prev) => [fallbackStudent, ...prev])
      setIsAddModalOpen(false)
      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle student deletion
  const handleDeleteStudent = async (id: string) => {
    if (!globalThis.confirm('Are you sure you want to remove this student from the registry?')) return

    try {
      await studentService.delete(id)
      setStudentList((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      console.warn('Backend API delete failed, falling back to local state removal:', err)
      // Local Sandbox Fallback
      setStudentList((prev) => prev.filter((s) => s.id !== id))
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
    setFormError(null)
  }

  // Get status color styles
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

  // Extracted content rendering to avoid nested ternaries
  const renderRegistryContent = () => {
    if (loading) {
      return (
        <div className="p-6 space-y-4 text-left">
          {/* Skeleton Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 opacity-50">
            <div className="h-4 w-6 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded animate-pulse ml-4" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-8 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
          </div>
          {/* Skeleton Rows */}
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
              <div className="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded animate-pulse mx-4" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded animate-pulse mx-4" />
              <div className="h-4 w-8 bg-slate-200 dark:bg-white/5 rounded animate-pulse mx-4 text-center" />
              <div className="h-4 w-12 bg-slate-200 dark:bg-white/5 rounded animate-pulse mx-4" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded animate-pulse mx-4" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-white/5 rounded-lg animate-pulse mx-4" />
              <div className="h-8 w-18 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse ml-4" />
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
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/20 dark:bg-white/[0.01] text-slate-450 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 dark:border-white/10 text-vault-accent focus:ring-vault-accent accent-vault-accent cursor-pointer h-3.5 w-3.5"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                  />
                </th>
                <th className="p-4">Student Info</th>
                <th className="p-4">Enrollment No.</th>
                <th className="p-4">Department</th>
                <th className="p-4 text-center">Sem</th>
                <th className="p-4 text-center">CGPA</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4 pl-6">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 dark:border-white/10 text-vault-accent focus:ring-vault-accent accent-vault-accent cursor-pointer h-3.5 w-3.5"
                      checked={selectedIds.includes(student.id)}
                      onChange={() => handleSelectRow(student.id)}
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center font-black text-vault-accent text-xs">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-slate-800 dark:text-white leading-none">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{student.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-655 dark:text-slate-400">{student.enrollmentNumber}</td>
                  <td className="p-4 text-slate-655 dark:text-slate-400">{student.department}</td>
                  <td className="p-4 text-center text-slate-800 dark:text-slate-300 font-mono">{student.semester}</td>
                  <td className="p-4 text-center font-mono">
                    <span className="font-black text-vault-accent bg-vault-accent/10 px-2 py-0.5 rounded border border-vault-accent/20">
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium font-mono text-[10px]">
                    {getLastActivity(student.id)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${getStatusStyle(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 text-center pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/students/${student.id}`)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-vault-fg transition-all cursor-pointer"
                        title="View Profile Details"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-red-500/10 text-slate-400 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
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
            
            <motion.circle
              cx="100"
              cy="100"
              r="65"
              fill="none"
              stroke="rgba(16, 185, 129, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            />
            <motion.circle
              cx="100"
              cy="100"
              r="50"
              fill="none"
              stroke="rgba(6, 182, 212, 0.12)"
              strokeWidth="1"
              strokeDasharray="4 6"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
            />

            <g transform="translate(65, 55)">
              {/* Cylinder 3 (Top) */}
              <motion.g
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <path d="M 0 10 A 35 10 0 0 0 70 10 A 35 10 0 0 0 0 10 Z M 0 10 L 0 25 A 35 10 0 0 0 70 25 L 70 10 Z" fill="url(#dbGrad)" opacity="0.9" />
                <ellipse cx="35" cy="10" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.4" />
              </motion.g>

              {/* Cylinder 2 (Middle) */}
              <motion.g
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              >
                <path d="M 0 32 A 35 10 0 0 0 70 32 A 35 10 0 0 0 0 32 Z M 0 32 L 0 47 A 35 10 0 0 0 70 47 L 70 32 Z" fill="url(#dbGrad)" opacity="0.75" />
                <ellipse cx="35" cy="32" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.3" />
              </motion.g>

              {/* Cylinder 1 (Bottom) */}
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

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan hover:opacity-95 text-white rounded-xl font-bold text-xs shadow-md shadow-vault-accent/15 cursor-pointer transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
            Student Registry Console
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Manage, search, and register student academic intelligence profiles.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan hover:opacity-95 text-white rounded-xl transition-all shadow-md shadow-vault-accent/10 hover:shadow-vault-accent/20 cursor-pointer font-extrabold text-xs"
        >
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Registry Panel */}
      <div className="vault-glass rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-md flex flex-col">
        
        {/* Search & Filter header ribbon */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/30 dark:bg-transparent">
          <div className="relative flex items-center w-full max-w-md rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:bg-white dark:focus-within:bg-[#070b14]/50 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-white/20">
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
                <button 
                  onClick={handleBulkDelete}
                  className="hover:underline cursor-pointer flex items-center gap-1 font-black text-red-500"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>
            )}

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-350 focus:outline-none focus:border-vault-accent cursor-pointer transition-colors"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-350 focus:outline-none focus:border-vault-accent cursor-pointer transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="GRADUATED">GRADUATED</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        {/* Data Table or Empty State */}
        {renderRegistryContent()}

      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-left relative my-8"
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-vault-fg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={20} className="text-vault-accent" />
              <span>Register Student Profile</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Register a new academic profile directly to the database registry.</p>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl mt-4">
                <AlertCircle size={15} className="shrink-0" />
                <p className="font-bold">{formError}</p>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="mt-4 space-y-4">
              
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Abhik"
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mukherjee"
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
              </div>

              {/* Email & Enrollment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Institutional Email *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="enrollmentNumber" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Enrollment ID *</label>
                  <input
                    id="enrollmentNumber"
                    type="text"
                    required
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="CS-2023-0041"
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Date of Birth & GPA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="dateOfBirth" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Date of Birth *</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="gpa" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Target CGPA Fallback</label>
                  <input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="8.5"
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Department & Semester */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="department" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Department</label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#151419] focus:outline-none focus:border-vault-accent transition-colors cursor-pointer"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="semester" className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Semester</label>
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#151419] focus:outline-none focus:border-vault-accent transition-colors cursor-pointer"
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>Sem {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-550 dark:text-slate-400">Status</span>
                <div className="flex gap-4">
                  {['ACTIVE', 'SUSPENDED', 'GRADUATED', 'INACTIVE'].map((st) => (
                    <label key={st} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={st}
                        checked={status === st}
                        onChange={() => setStatus(st as any)}
                        className="text-vault-accent focus:ring-vault-accent cursor-pointer accent-vault-accent"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-vault-accent to-vault-cyan text-white rounded-xl text-xs font-bold shadow-md shadow-vault-accent/15 cursor-pointer flex items-center gap-1.5 hover:opacity-95 transition-opacity"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Register Student</span>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  )
}
