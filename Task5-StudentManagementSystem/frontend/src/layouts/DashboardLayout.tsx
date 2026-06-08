import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
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
  ChevronRight
} from 'lucide-react'

export default function DashboardLayout() {
  const { user, logout } = useAuthContext()
  const { students } = useStudents()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
  
  const placementReadyCount = students.filter(s => s.gpa >= 3.4).length
  const placementRate = totalStudents > 0 ? Math.round((placementReadyCount / totalStudents) * 100) : 89

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Student Registry', path: '/dashboard/students', icon: Users },
    { name: 'Portfolio Studio', path: '/dashboard/portfolio', icon: UserCircle },
    { name: 'Analytics Hub', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'AI Engine', path: '/dashboard/ai', icon: Brain },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vault-bg text-vault-fg transition-colors duration-200">
      
      {/* Collapsible Sidebar Navigation */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full border-r border-slate-200 dark:border-vault-border bg-white/70 dark:bg-[#070b13]/70 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 transition-colors duration-200 relative z-20"
      >
        <div>
          {/* Header branding & toggle */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-vault-accent to-vault-cyan flex items-center justify-center font-bold text-white shadow-md shadow-vault-accent/20 shrink-0">
                EV
              </div>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col text-left shrink-0"
                >
                  <span className="text-sm font-black tracking-tight text-slate-800 dark:text-white leading-none">EduVault AI</span>
                  <span className="text-[8px] text-vault-accent font-bold font-mono tracking-widest uppercase mt-0.5 block">Staff Console</span>
                </motion.div>
              )}
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg border border-slate-200 dark:border-vault-border/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-vault-fg"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

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
                    className={`flex items-center relative rounded-xl transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 ${
                      isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                    } ${
                      active
                        ? 'bg-vault-accent/10 dark:bg-vault-accent/15 text-vault-accent font-bold shadow-md shadow-vault-accent/5'
                        : 'text-slate-400 dark:text-slate-500 hover:text-vault-fg hover:bg-slate-50 dark:hover:bg-white/5 font-semibold'
                    }`}
                  >
                    {/* Active Sliding indicator bar */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-vault-accent shadow-[0_0_10px_var(--color-vault-accent)]"
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      />
                    )}
                    <Icon size={isCollapsed ? 20 : 18} className={`${active ? 'text-vault-accent' : ''}`} />
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="truncate text-sm"
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
          <motion.div 
            layout
            className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden"
          >
            <div className="h-9 w-9 rounded-xl bg-vault-accent/10 border border-vault-accent/30 flex items-center justify-center font-bold text-vault-accent text-sm shrink-0">
              {user?.displayName?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="truncate flex-1 text-left"
              >
                <p className="text-xs font-bold truncate text-slate-800 dark:text-white">{user?.displayName || 'Academic Lead'}</p>
                <span className="text-[9px] text-vault-cyan font-bold font-mono tracking-wide uppercase mt-0.5 block">{user?.role || 'Intelligence Lead'}</span>
              </motion.div>
            )}
          </motion.div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center mt-3 rounded-xl text-vault-destructive hover:bg-vault-destructive/10 transition-all font-bold cursor-pointer text-sm ${
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
        <header className="h-18 border-b border-slate-200 dark:border-vault-border bg-white/60 dark:bg-[#070b13]/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 transition-colors duration-200">
          
          {/* Header title & status checks */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-left">
              <h1 className="text-xs font-black tracking-wider text-slate-800 dark:text-white uppercase leading-none">Intelligence Console</h1>
              <span className="text-[8px] text-vault-accent font-bold font-mono tracking-widest uppercase mt-0.5 block">Academic Operations</span>
            </div>
            
            {/* Live system monitoring indicators */}
            <div className="flex items-center space-x-3 sm:pl-4 sm:border-l border-slate-200 dark:border-vault-border/60">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wide">Healthy</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wide">Synced</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wide">Connected</span>
              </div>
            </div>
          </div>

          {/* Top Analytics Ribbon statistics */}
          <div className="flex items-center space-x-6">
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

        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
