import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Users,
  RefreshCw,
  AlertCircle,
  Lock,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { userManagementService, SUPER_ADMIN_EMAIL } from '../../services/userManagementService'
import type { ManagedUser } from '../../services/userManagementService'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users')
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [auditLoading, setAuditLoading] = useState(false)

  // Permanent delete modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<ManagedUser | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // User Management State
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeDropdownUid, setActiveDropdownUid] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STUDENT'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Audit Logs Filters
  const [auditSearchQuery, setAuditSearchQuery] = useState('')
  const [auditActionFilter, setAuditActionFilter] = useState('ALL')
  const [auditPage, setAuditPage] = useState(1)
  const auditPageSize = 10

  const navigate = useNavigate()
  const { user: currentActor, isAdmin } = useAuth()
  const actorObj = {
    uid: currentActor?.uid || '',
    email: currentActor?.email || '',
    displayName: currentActor?.displayName || 'Admin Console'
  }

  // Click outside dropdown handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownUid(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Gate — only admins can access
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAdmin, navigate])

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const logs = await userManagementService.getAuditLogs()
      setAuditLogs(logs)
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setAuditLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await userManagementService.getAllUsers()
      setUsers(data)
    } catch (err: any) {
      setError('Failed to load users. Please try again.')
      console.error('UserManagementPage load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
    loadAuditLogs()
  }, [loadUsers, loadAuditLogs])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handlePromote = async (user: ManagedUser) => {
    setActionLoading(user.uid)
    setActiveDropdownUid(null)
    try {
      await userManagementService.promoteToAdmin(user.uid, user.email, actorObj)
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, role: 'ADMIN' } : u))
      showSuccess(`${user.displayName || user.email} promoted to Admin.`)
      loadAuditLogs()
    } catch (err: any) {
      console.error('Promotion error:', err)
      setError('Failed to promote user.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDemote = async (user: ManagedUser) => {
    setActionLoading(user.uid)
    setActiveDropdownUid(null)
    try {
      await userManagementService.demoteToStudent(user.uid, user.email, actorObj)
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, role: 'STUDENT' } : u))
      showSuccess(`${user.displayName || user.email} demoted to Student.`)
      loadAuditLogs()
    } catch (err: any) {
      console.error('Demotion error:', err)
      setError('Failed to demote user.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (user: ManagedUser) => {
    setActionLoading(user.uid)
    setActiveDropdownUid(null)
    const newActive = !user.isActive
    try {
      await userManagementService.setUserActive(user.uid, user.email, newActive, actorObj)
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, isActive: newActive } : u))
      showSuccess(`${user.displayName || user.email} ${newActive ? 'enabled' : 'disabled'}.`)
      loadAuditLogs()
    } catch (err: any) {
      console.error('Toggle status error:', err)
      setError('Failed to update user status.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!deleteTargetUser) return
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" exactly to confirm.')
      return
    }

    setActionLoading(deleteTargetUser.uid)
    const target = deleteTargetUser
    setDeleteTargetUser(null)
    setDeleteConfirmText('')

    try {
      await userManagementService.deleteUser(target.uid, target.email, actorObj)
      setUsers(prev => prev.filter(u => u.uid !== target.uid))
      showSuccess(`${target.displayName || target.email} permanently deleted.`)
      loadAuditLogs()
    } catch (err) {
      console.error('Delete user error:', err)
      setError('Failed to delete user.')
    } finally {
      setActionLoading(null)
    }
  }

  const isSuperAdmin = (email: string) => email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  const isActioning = (uid: string) => actionLoading === uid  // Filter logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && u.isActive) ||
      (statusFilter === 'DISABLED' && !u.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, statusFilter])

  // Audit Logs filter & pagination logic
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = 
      (log.action || '').toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      (log.targetUser?.email || '').toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      (log.performedBy?.email || '').toLowerCase().includes(auditSearchQuery.toLowerCase())

    const matchesAction = auditActionFilter === 'ALL' || log.action === auditActionFilter

    return matchesSearch && matchesAction
  })

  const totalAuditPages = Math.ceil(filteredAuditLogs.length / auditPageSize) || 1
  const paginatedAuditLogs = filteredAuditLogs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize)

  useEffect(() => {
    setAuditPage(1)
  }, [auditSearchQuery, auditActionFilter])

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent flex items-center gap-2.5">
            <ShieldCheck className="text-vault-accent shrink-0" size={28} />
            <span>User Management</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Manage platform users, roles, and administrative console controls.
          </p>
        </div>
        <button
          type="button"
          onClick={activeTab === 'users' ? loadUsers : loadAuditLogs}
          disabled={loading || auditLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading || auditLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Status banners */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-lg animate-fadeIn">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-lg animate-fadeIn">
          <UserCheck size={15} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-vault-accent' },
          { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: 'text-vault-cyan' },
          { label: 'Students', value: users.filter(u => u.role === 'STUDENT').length, color: 'text-emerald-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-left">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-vault-accent text-vault-fg font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Users Directory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-vault-accent text-vault-fg font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* User Management Panel */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {activeTab === 'users' ? (
          <>
            {/* Search & Filters Row */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/10">
              <div className="relative flex items-center w-full max-w-md rounded-md bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-350 dark:hover:border-slate-700">
                <Search size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or institutional email..."
                  className="w-full bg-transparent pl-11 pr-4 py-2.5 text-xs text-vault-fg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="field-surface text-xs font-bold px-3 py-2 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STUDENT">STUDENT</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="field-surface text-xs font-bold px-3 py-2 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

            {/* Table/Content container */}
            {(() => {
              if (loading) {
                return (
                  <div className="p-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                    <Users size={36} className="opacity-30 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading Platform Users...</p>
                  </div>
                )
              }
              if (paginatedUsers.length === 0) {
                return (
                  <div className="p-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500 text-center">
                    <Users size={36} className="opacity-30 mb-2" />
                    <p className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-white">No Users Found</p>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed mt-1">
                      Your current search query or filter options didn't yield any matched user records.
                    </p>
                  </div>
                )
              }
              return (
                <div className="overflow-x-auto relative">
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-550 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                        {['User', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3.5 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                      {paginatedUsers.map((u) => {
                        const superAdmin = isSuperAdmin(u.email)
                        const actioning = isActioning(u.uid)
                        const dropdownOpen = activeDropdownUid === u.uid

                        return (
                          <tr
                            key={u.uid}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors duration-150 group"
                          >
                            {/* User Column */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-vault-accent/15 to-vault-cyan/15 border border-vault-accent/20 flex items-center justify-center font-bold text-xs text-vault-accent shrink-0">
                                  {(u.displayName || u.email)?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate flex items-center gap-1.5">
                                    {u.displayName || 'Unknown User'}
                                    {superAdmin && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded">
                                        👑 Super Admin
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Role Column */}
                            <td className="px-5 py-3.5">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border font-mono ${
                                u.role === 'ADMIN'
                                  ? 'bg-vault-accent/10 text-vault-accent border-vault-accent/20'
                                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              }`}>
                                {u.role}
                              </span>
                            </td>

                            {/* Status Column */}
                            <td className="px-5 py-3.5">
                              {superAdmin ? (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono inline-flex items-center gap-0.5">
                                  <Lock size={9} />
                                  Protected
                                </span>
                              ) : (
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border font-mono ${
                                  u.isActive
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                  {u.isActive ? 'Active' : 'Disabled'}
                                </span>
                              )}
                            </td>

                            {/* Last Login / Provider Column */}
                            <td className="px-5 py-3.5 font-mono text-slate-500 font-semibold text-[10px]">
                              {u.provider?.includes('google') ? 'Google Account' : 'Email/Password'}
                            </td>

                            {/* Actions Column */}
                            <td className="px-5 py-3.5 relative">
                              {superAdmin ? (
                                <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold italic">No actions</span>
                              ) : (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActiveDropdownUid(dropdownOpen ? null : u.uid)
                                    }}
                                    disabled={actioning}
                                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 transition-colors cursor-pointer disabled:opacity-50"
                                    title="More Options"
                                  >
                                    <MoreVertical size={14} />
                                  </button>

                                  {/* Dropdown Menu Popup */}
                                  {dropdownOpen && (
                                    <div
                                      ref={dropdownRef}
                                      className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-35 text-left animate-fadeIn"
                                    >
                                      {u.role === 'STUDENT' ? (
                                        <button
                                          type="button"
                                          onClick={() => handlePromote(u)}
                                          className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer flex items-center gap-1.5"
                                        >
                                          <ShieldCheck size={11} className="text-vault-accent" />
                                          Promote to Admin
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleDemote(u)}
                                          className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer flex items-center gap-1.5"
                                        >
                                          <ShieldOff size={11} className="text-orange-500" />
                                          Demote to Student
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleToggleActive(u)}
                                        className={`w-full text-left px-3 py-1.5 text-[10px] font-bold cursor-pointer flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-900 ${
                                          u.isActive 
                                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' 
                                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                        }`}
                                      >
                                        {u.isActive ? (
                                          <>
                                            <UserX size={11} />
                                            Disable User
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck size={11} />
                                            Enable User
                                          </>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteTargetUser(u)
                                          setActiveDropdownUid(null)
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-red-550 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-900"
                                      >
                                        <UserX size={11} className="text-red-500" />
                                        Delete User
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            {/* Table Pagination Footer */}
            {filteredUsers.length > pageSize && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} Users
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Search & Filters Row for Audit Logs */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/10">
              <div className="relative flex items-center w-full max-w-md rounded-md bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-350 dark:hover:border-slate-700">
                <Search size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Search logs by action, details, target or actor email..."
                  className="w-full bg-transparent pl-11 pr-4 py-2.5 text-xs text-vault-fg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="field-surface text-xs font-bold px-3 py-2 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="ALL">All Actions</option>
                  <option value="User Created">User Created</option>
                  <option value="User Disabled">User Disabled</option>
                  <option value="User Enabled">User Enabled</option>
                  <option value="User Promoted">User Promoted</option>
                  <option value="User Demoted">User Demoted</option>
                  <option value="User Deleted">User Deleted</option>
                </select>
              </div>
            </div>

            {/* Table/Content container for Audit Logs */}
            {(() => {
              if (auditLoading) {
                return (
                  <div className="p-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                    <RefreshCw size={36} className="opacity-30 animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest">Loading Audit Logs...</p>
                  </div>
                )
              }
              if (paginatedAuditLogs.length === 0) {
                return (
                  <div className="p-16 flex flex-col items-center gap-3 text-slate-405 dark:text-slate-500 text-center">
                    <Users size={36} className="opacity-30 mb-2" />
                    <p className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-white">No Logs Found</p>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed mt-1">
                      No matching audit records were found for the current search or filters.
                    </p>
                  </div>
                )
              }
              return (
                <div className="overflow-x-auto relative">
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-550 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                        {['Action', 'Target User', 'Performed By', 'Timestamp', 'Details'].map(h => (
                          <th key={h} className="px-5 py-3.5 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                      {paginatedAuditLogs.map((log) => {
                        let actionBadgeColor = 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        if (log.action === 'User Created') actionBadgeColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        else if (log.action === 'User Enabled') actionBadgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        else if (log.action === 'User Disabled') actionBadgeColor = 'bg-orange-500/10 text-orange-550 border-orange-500/20'
                        else if (log.action === 'User Promoted') actionBadgeColor = 'bg-vault-accent/10 text-vault-accent border-vault-accent/20'
                        else if (log.action === 'User Demoted') actionBadgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        else if (log.action === 'User Deleted') actionBadgeColor = 'bg-red-500/10 text-red-500 border-red-500/20'

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors duration-150">
                            <td className="px-5 py-3.5">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border font-mono ${actionBadgeColor}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300">
                                {log.targetUser?.email || 'N/A'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-505 dark:text-slate-400 font-mono text-[10px]">
                              {log.performedBy?.email || 'System'}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 font-mono text-[10px]">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                              {log.details}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            {/* Pagination Footer for Audit Logs */}
            {filteredAuditLogs.length > auditPageSize && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  Showing {(auditPage - 1) * auditPageSize + 1}-{Math.min(auditPage * auditPageSize, filteredAuditLogs.length)} of {filteredAuditLogs.length} Logs
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuditPage(prev => Math.max(1, prev - 1))}
                    disabled={auditPage === 1}
                    className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditPage(prev => Math.min(totalAuditPages, prev + 1))}
                    disabled={auditPage === totalAuditPages}
                    className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full shadow-2xl p-6 relative">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              Confirm Permanent Deletion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This action is <span className="font-bold text-red-500">permanent</span> and cannot be undone. 
              The user record for <span className="font-bold text-slate-800 dark:text-slate-200">{deleteTargetUser.displayName || deleteTargetUser.email}</span> will be permanently removed from the system.
            </p>
            <form onSubmit={handleDeleteUser} className="mt-4 space-y-3">
              <label htmlFor="deleteConfirmInput" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Type <span className="font-mono text-red-550 bg-red-500/10 px-1 py-0.5 rounded">DELETE</span> to confirm:
              </label>
              <input
                id="deleteConfirmInput"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs font-bold text-vault-fg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetUser(null)
                    setDeleteConfirmText('')
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Delete User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

