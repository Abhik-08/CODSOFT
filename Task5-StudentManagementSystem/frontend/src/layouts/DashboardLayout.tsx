import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useStudents } from '../hooks/useStudents'
import { motion, AnimatePresence } from 'motion/react'
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  BarChart3, 
  Brain, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react'
import { EduVaultLogo, EduVaultLogoMark } from '../components/common'
import { UserProfileSettingsModal } from '../components/dashboard'

export default function DashboardLayout() {
  const { user, logout } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const { students } = useStudents()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/dashboard/':
        return 'Console Overview'
      case '/dashboard/students':
        return 'Student Registry'
      case '/dashboard/portfolio':
        return 'Portfolio Studio'
      case '/dashboard/analytics':
        return 'Analytics Hub'
      case '/dashboard/ai':
        return 'AI Insights Engine'
      default:
        if (location.pathname.startsWith('/dashboard/students/')) {
          return 'Student Dossier'
        }
        return 'Intelligence Console'
    }
  }

  const isDashboardPath = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout error', err)
    }
  }

  const isActive = (path: string) => location.pathname === path

  // Calculate statistics dynamically from the current student cohort
  const totalStudents = students.length || 0
  const avgGpa = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + s.gpa, 0) / totalStudents).toFixed(2)
    : "3.65"
  
  const placementReadyCount = students.filter(s => s.gpa >= 8.5).length
  const placementRate = totalStudents > 0 ? Math.round((placementReadyCount / totalStudents) * 100) : 89

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Student Registry', path: '/dashboard/students', icon: Users },
    { name: 'Portfolio Studio', path: '/dashboard/portfolio', icon: UserCircle },
    { name: 'Analytics Hub', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'AI Engine', path: '/dashboard/ai', icon: Brain },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vault-bg text-vault-fg transition-colors duration-200 font-sans">
      
      {/* Collapsible Sidebar Navigation */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full border-r border-slate-200 dark:border-vault-border bg-white/95 dark:bg-[#0a1422]/90 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 transition-colors duration-200 relative z-20 shadow-sm"
      >
        <div>
          {/* Header branding & toggle */}
          <div className="flex items-center justify-between mb-5 px-1.5 pt-2">
            <div className="overflow-hidden">
              {isCollapsed ? (
                <div className="flex justify-center">
                  <EduVaultLogoMark size={48} />
                </div>
              ) : (
                <EduVaultLogo showText={true} iconSize={62} textSize="text-xl font-black" />
              )}
            </div>
            
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg border border-slate-200 dark:border-vault-border/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-vault-fg"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={14} />
              </button>
            )}
          </div>

          {/* Expand Toggle when collapsed */}
          {isCollapsed && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl border border-slate-200 dark:border-vault-border/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-vault-fg"
                title="Expand Sidebar"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-2 relative">
            <AnimatePresence>
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center relative rounded-xl transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 ${
                      isCollapsed ? 'justify-center p-3' : 'space-x-3.5 px-4 py-3'
                    } ${
                      active
                        ? 'bg-vault-accent/10 dark:bg-vault-accent/15 text-vault-accent font-extrabold border border-vault-accent/25 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-vault-fg hover:bg-slate-100/80 dark:hover:bg-white/5 font-bold'
                    }`}
                  >
                    {/* Active Sliding indicator bar */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-vault-accent"
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      />
                    )}
                    <Icon size={isCollapsed ? 20 : 18} className={`${active ? 'text-vault-accent' : ''}`} />
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="truncate text-xs tracking-wide"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                )
              })}
            </AnimatePresence>
          </nav>
        </div>

        {/* Floating User Profile Card & Sign Out button */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-white/5">
          <motion.button 
            layout
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden text-left cursor-pointer transition-colors"
            title="Open Profile Settings"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-vault-accent to-vault-cyan overflow-hidden flex items-center justify-center font-black text-white text-sm shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL.startsWith('localstorage://') ? (localStorage.getItem(`avatar_user_${user.uid}`) || '') : user.photoURL}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%232563eb" opacity="0.15"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="12" fill="%232563eb">${user?.displayName?.[0] || 'U'}</text></svg>`;
                  }}
                />
              ) : (
                <span>{user?.displayName?.[0] || 'U'}</span>
              )}
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="truncate flex-1 text-left"
              >
                <p className="text-xs font-black truncate text-slate-800 dark:text-white">{user?.displayName || 'Academic Lead'}</p>
                <span className="text-[9px] text-vault-cyan font-bold font-mono tracking-wide uppercase mt-0.5 block">{user?.role || 'Intelligence Lead'}</span>
              </motion.div>
            )}
          </motion.button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center mt-3 rounded-xl text-vault-destructive hover:bg-vault-destructive/10 transition-all font-bold cursor-pointer text-xs ${
              isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-4 py-2.5'
            }`}
            title="Sign Out"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-vault-bg">
        
        {/* Command Center Header Ribbon */}
        <header className="h-18 border-b border-slate-200 dark:border-vault-border bg-white/85 dark:bg-[#0a1422]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors duration-200 z-10">
          
          {/* Header title & section locator */}
          <div className="flex items-center space-x-4">
            <div className="text-left">
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {getPageTitle()}
              </h1>
              <p className="hidden sm:block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Student operations workspace</p>
            </div>
          </div>

          {/* Top Analytics Ribbon statistics - Rendered on dashboard path only */}
          {isDashboardPath && (
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-right">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Cohort Size</span>
                <span className="text-xs font-black text-slate-800 dark:text-white font-mono mt-0.5 block">{totalStudents}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Avg CGPA</span>
                <span className="text-xs font-black text-vault-accent font-mono mt-0.5 block">{avgGpa}</span>
              </div>
              <div className="text-right hidden xs:block">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Attendance</span>
                <span className="text-xs font-black text-vault-cyan font-mono mt-0.5 block">94.2%</span>
              </div>
              <div className="text-right hidden md:block">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Placement Ready</span>
                <span className="text-xs font-black text-vault-accent font-mono mt-0.5 block">{placementRate}%</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Portfolios</span>
                <span className="text-xs font-black text-violet-400 font-mono mt-0.5 block">92%</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="ml-3 h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-vault-accent hover:border-vault-accent/40 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Navbar profile icon button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="ml-3 h-9 w-9 overflow-hidden inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:border-vault-accent/40 transition-colors cursor-pointer"
            title="Profile Settings"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL.startsWith('localstorage://') ? (localStorage.getItem(`avatar_user_${user.uid}`) || '') : user.photoURL}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%232563eb" opacity="0.15"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="12" fill="%232563eb">${user?.displayName?.[0] || 'U'}</text></svg>`;
                }}
              />
            ) : (
              <span className="font-black text-xs">{user?.displayName?.[0] || 'U'}</span>
            )}
          </button>

        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[linear-gradient(180deg,rgba(37,99,235,0.04),transparent_220px)] dark:bg-[linear-gradient(180deg,rgba(96,165,250,0.06),transparent_240px)]">
          <Outlet />
        </div>
      </main>

      {/* User Profile Settings Modal */}
      {showSettingsModal && (
        <UserProfileSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  )
}
