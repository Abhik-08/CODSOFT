import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useStudents } from '../hooks/useStudents'
import { useAlerts } from '../hooks/useAlerts'
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
  Sun,
  Bell,
  BellDot,
  ShieldCheck
} from 'lucide-react'
import { EduVaultLogo, EduVaultLogoMark } from '../components/common'
import { UserProfileSettingsModal, SmartAlertDrawer } from '../components/dashboard'

export default function DashboardLayout() {
  const { user, logout } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const { students } = useStudents()
  const { unreadCount, hasCriticalAlert } = useAlerts()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false)

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
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STUDENT'] },
    { name: 'Student Registry', path: '/dashboard/students', icon: Users, roles: ['ADMIN'] },
    { name: 'Portfolio Studio', path: '/dashboard/portfolio', icon: UserCircle, roles: ['ADMIN', 'STUDENT'] },
    { name: 'Analytics Hub', path: '/dashboard/analytics', icon: BarChart3, roles: ['ADMIN'] },
    { name: 'AI Engine', path: '/dashboard/ai', icon: Brain, roles: ['ADMIN', 'STUDENT'] },
    { name: 'User Management', path: '/dashboard/admin/users', icon: ShieldCheck, roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user?.role || 'STUDENT'))

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vault-bg text-vault-fg transition-colors duration-200 font-sans">
      
      {/* Collapsible Sidebar Navigation */}
      <motion.aside 
        animate={{ width: isCollapsed ? 72 : 240 }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        className="h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030712] flex flex-col justify-between p-4 shrink-0 transition-colors duration-200 relative z-20"
      >
        <div>
          {/* Header branding & toggle */}
          <div className="flex items-center justify-between mb-6 px-1 pt-1">
            <div className="overflow-hidden">
              {isCollapsed ? (
                <div className="flex justify-center">
                  <EduVaultLogoMark size={40} />
                </div>
              ) : (
                <EduVaultLogo showText={true} iconSize={48} textSize="text-lg font-bold" />
              )}
            </div>
            
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
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
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                title="Expand Sidebar"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
 
          {/* Navigation Links */}
          <nav className="space-y-1 relative">
            <AnimatePresence>
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center relative rounded-md transition-colors duration-150 ${
                      isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
                    } ${
                      active
                        ? 'bg-slate-100 dark:bg-slate-900 text-vault-accent font-semibold border border-slate-200/50 dark:border-slate-800/40 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-medium'
                    }`}
                  >
                    {/* Active Sliding indicator bar */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r bg-vault-accent"
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      />
                    )}
                    <Icon size={isCollapsed ? 18 : 16} className={`${active ? 'text-vault-accent' : ''}`} />
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
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
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center space-x-3 p-2 rounded-md bg-slate-50 dark:bg-[#090f20] hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden text-left cursor-pointer transition-colors"
            title="Open Profile Settings"
          >
            <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-vault-accent to-vault-cyan overflow-hidden flex items-center justify-center font-bold text-white text-xs shrink-0">
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
              <div className="truncate flex-1 text-left">
                <p className="text-xs font-semibold truncate text-slate-850 dark:text-slate-200">{user?.displayName || 'Academic Lead'}</p>
                <span className="text-[9px] text-vault-cyan font-bold font-mono tracking-wide uppercase mt-0.5 block">{user?.role || 'Intelligence Lead'}</span>
              </div>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center mt-2 rounded-md text-vault-destructive hover:bg-red-500/10 transition-colors font-medium cursor-pointer text-xs ${
              isCollapsed ? 'justify-center p-2' : 'space-x-3 px-3 py-2'
            }`}
            title="Sign Out"
          >
            <LogOut size={14} />
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

          {/* Smart Alert Bell Icon */}
          <button
            type="button"
            onClick={() => setIsAlertDrawerOpen(true)}
            className={`ml-3 relative h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 transition-all cursor-pointer hover:border-vault-accent/40 text-slate-600 dark:text-slate-300 hover:text-vault-accent group ${
              hasCriticalAlert ? 'border-red-400 dark:border-red-900/60' : ''
            }`}
            title="Smart Alerts"
          >
            {unreadCount > 0 ? (
              <BellDot 
                size={16} 
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  hasCriticalAlert ? 'text-red-500 animate-[pulse_2s_infinite]' : 'text-vault-accent'
                }`} 
              />
            ) : (
              <Bell size={16} className="transition-transform duration-200 group-hover:scale-110" />
            )}
            
            {/* Unread Count Badge */}
            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[8px] font-black text-white ${
                hasCriticalAlert ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]' : 'bg-vault-accent shadow-[0_0_6px_rgba(37,99,235,0.6)]'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

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

      {/* Smart Alert Drawer */}
      <AnimatePresence>
        {isAlertDrawerOpen && (
          <SmartAlertDrawer isOpen={isAlertDrawerOpen} onClose={() => setIsAlertDrawerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
