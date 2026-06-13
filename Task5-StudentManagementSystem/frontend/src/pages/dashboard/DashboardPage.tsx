import { useState, useEffect } from 'react'
import { useStudents } from '../../hooks/useStudents'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Calendar,
  AlertCircle,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  Rectangle
} from 'recharts'

// Custom Sparkline Component
const Sparkline = ({ points, stroke }: { points: number[], stroke: string }) => {
  if (!points || points.length === 0) return null
  const width = 120
  const height = 30
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const pathData = points
    .map((p, index) => {
      const x = (index / (points.length - 1)) * width
      const y = height - ((p - min) / range) * (height - 6) - 3
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg className="w-24 h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <path d={pathData} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Custom Bar Shape Component
const CustomBar = (props: any) => {
  const { index, ...rest } = props
  const fill = index % 2 === 0 ? 'var(--color-vault-accent)' : 'var(--color-vault-cyan)'
  return <Rectangle {...rest} fill={fill} radius={[4, 4, 0, 0]} />
}

// Micro-interaction: Metric Count Up animation
const AnimatedCount = ({ value, duration = 1, prefix = "", suffix = "" }: { value: number | string, duration?: number, prefix?: string, suffix?: string }) => {
  const numericVal = Number(value)
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    if (Number.isNaN(numericVal)) return
    let start = 0
    const end = numericVal
    if (start === end) {
      setCount(end)
      return
    }
    
    const isDecimal = !Number.isInteger(end)
    const totalFrames = 60
    const frameDuration = (duration * 1000) / totalFrames
    const increment = (end - start) / totalFrames

    let frame = 0
    const timer = setInterval(() => {
      frame++
      if (frame >= totalFrames) {
        setCount(end)
        clearInterval(timer)
      } else {
        const current = start + increment * frame
        setCount(isDecimal ? Number(current.toFixed(2)) : Math.floor(current))
      }
    }, frameDuration)

    return () => clearInterval(timer)
  }, [numericVal, duration])

  if (Number.isNaN(numericVal)) return <span>{prefix}{value}{suffix}</span>
  return <span>{prefix}{count}{suffix}</span>
}

// Rotating AI Ticker Ribbon
const SmartInsightTicker = ({ bestDept, bestDeptGpa, metrics }: { bestDept: string, bestDeptGpa: number, metrics: any }) => {
  const insights = [
    `${bestDept} leads cohort CGPA averages with an average of ${bestDeptGpa.toFixed(2)} CGPA.`,
    `A total of ${metrics?.portfolioCompletionPercentage ?? 0}% of the cohort has completed their digital portfolios.`,
    `Academic warning: ${metrics?.riskStudents ?? 0} students currently require immediate academic counseling.`,
    `Cohort overall average attendance is standing at ${metrics?.averageAttendance ?? 0}%.`
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % insights.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [insights.length])

  return (
    <div className="vault-glass px-4 py-2.5 rounded-xl border border-vault-accent/15 dark:border-vault-accent/10 flex items-center gap-2.5 bg-gradient-to-r from-vault-accent/5 to-vault-cyan/5 overflow-hidden min-h-11 shadow-sm text-left">
      <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-lg bg-vault-accent/15 text-vault-accent font-bold text-[9px] tracking-wider uppercase font-mono shadow-sm">
        <Sparkles size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
        <span>Platform Insight</span>
      </div>
      <div className="flex-1 relative h-5 flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
          >
            {insights[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

import { useAuth } from '../../hooks/useAuth'

export default function DashboardPage() {
  const { user: currentUser } = useAuth()
  const { students, loading, error: studentsError } = useStudents()
  const { topSkill, lastUpdated, error: statsError } = useDashboardStats()
  const { metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && currentUser?.role === 'STUDENT') {
      const myStudent = students.find(s => s.email?.toLowerCase() === currentUser.email?.toLowerCase())
      if (myStudent) {
        navigate(`/dashboard/students/${myStudent.id}`, { replace: true })
      }
    }
  }, [students, loading, currentUser, navigate])

  // Format the live last-updated timestamp
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Syncing...'

  const combinedError = studentsError || statsError || metricsError
  const isPageLoading = loading || metricsLoading

  if (isPageLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-white/5 rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-white/5 rounded-lg" />
          </div>
          <div className="h-6 w-36 bg-slate-200 dark:bg-white/5 rounded-lg" />
        </div>
        
        <div className="h-11 w-full bg-slate-200 dark:bg-white/5 rounded-xl" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['kpi-sk-1', 'kpi-sk-2', 'kpi-sk-3', 'kpi-sk-4'].map((key) => (
            <div key={key} className="h-28 bg-slate-200/60 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5" />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
              <div className="h-64 bg-slate-200/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
            </div>
          </div>
          <div className="xl:col-span-4 h-[500px] bg-slate-200/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
        </div>
      </div>
    )
  }

  // Calculate stats dynamically from current database
  const totalStudents = students.length || 0
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length || 0

  // Group by department
  const deptMap: { [key: string]: number[] } = {}
  students.forEach(s => {
    if (!deptMap[s.department]) deptMap[s.department] = []
    deptMap[s.department].push(s.gpa)
  })

  const departments = Object.keys(deptMap)

  let bestDept = "N/A"
  let bestDeptGpa = 0
  let worstDept = "N/A"
  let worstDeptGpa = 10

  departments.forEach(dept => {
    const gpas = deptMap[dept]
    const avg = gpas.reduce((sum, g) => sum + g, 0) / gpas.length
    if (avg > bestDeptGpa) {
      bestDept = dept
      bestDeptGpa = avg
    }
    if (avg < worstDeptGpa) {
      worstDept = dept
      worstDeptGpa = avg
    }
  })

  // Calculate attendance dynamically from student records
  const attendanceStats = students.map(s => {
    if (s.attendanceRate !== undefined && s.attendanceRate !== null) {
      return s.attendanceRate
    }
    if (!s.attendance || s.attendance.length === 0) return 100 // no records = assume 100%
    const presentCount = s.attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
    return (presentCount / s.attendance.length) * 100
  })

  // Students requiring attention (CGPA < 6.75 or Attendance < 60%)
  const attentionStudents = students.filter((s, idx) => {
    const attRate = attendanceStats[idx]
    return s.gpa < 6.75 || attRate < 60 || s.status === 'SUSPENDED'
  })
  // mostCommonSkill derived live from Firestore portfolio collection via useDashboardStats hook
  const mostCommonSkill = topSkill

  // Order students for Top list
  const topStudents = [...students]
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 4)

  // Recharts Data Prep
  const gpaChartData = [...students]
    .sort((a, b) => a.gpa - b.gpa)
    .map(s => ({
      name: `${s.firstName} ${s.lastName[0]}.`,
      gpa: s.gpa
    }))

  const deptChartData = departments.map(dept => ({
    name: dept.split(' ')[0], // abbreviation
    count: deptMap[dept].length
  }))

  const eliteCount = students.filter(s => s.gpa >= 9).length
  const standardCount = students.filter(s => s.gpa >= 7.5 && s.gpa < 9).length
  const supportCount = students.filter(s => s.gpa < 7.5).length

  const segmentationData = [
    { name: 'Elite (>= 9.0)', value: eliteCount, fill: '#34d399' },
    { name: 'Standard (7.5-9.0)', value: standardCount, fill: '#06b6d4' },
    { name: 'Support (< 7.5)', value: supportCount, fill: '#f43f5e' }
  ]

  const semMap: { [key: number]: number[] } = {}
  students.forEach(s => {
    if (!semMap[s.semester]) semMap[s.semester] = []
    semMap[s.semester].push(s.gpa)
  })
  const semesterData = Object.keys(semMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(sem => ({
      name: `Sem ${sem}`,
      averageGpa: Number.parseFloat((semMap[sem].reduce((sum, g) => sum + g, 0) / semMap[sem].length).toFixed(2))
    }))

  // Custom premium Recharts Tooltip styling
  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: 'rgba(11, 15, 25, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 'bold',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
    },
    itemStyle: { color: 'var(--color-vault-accent)' },
    labelStyle: { color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }
  }

  if (totalStudents === 0 || metrics?.cohortSize === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-md min-h-[400px]">
        <Users className="text-vault-accent mb-4 opacity-40 animate-pulse" size={48} />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">No Cohorts Logged</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm leading-relaxed font-semibold">
          The student registry is currently empty. Please import student records or register new students to activate command center diagnostics.
        </p>
        <button
          onClick={() => navigate('/dashboard/students')}
          className="mt-6 px-4 py-2 bg-vault-accent hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Add Students
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Firestore Error Banner */}
      {combinedError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>Firestore sync error: {combinedError} — Showing last known data.</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Student Success Command Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-medium">Actionable intelligence metrics, cohort diagnostics, and predictive insights.</p>
        </div>
        <div className="text-right">
          <div className="px-3 py-1.5 bg-vault-emerald/10 border border-vault-emerald/20 text-vault-emerald rounded-md text-[10px] font-bold font-mono tracking-wider">
            SYSTEM ACTIVE: {activeStudents}/{totalStudents} COHORTS LOGGED
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-550 font-mono font-medium mt-1 block">Live @ {lastUpdatedLabel}</span>
        </div>
      </div>
 
      {/* Smart Insight Ribbon */}
      <SmartInsightTicker bestDept={bestDept} bestDeptGpa={bestDeptGpa} metrics={metrics} />
 
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Cohort Size */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-28 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cohort Size</span>
            <Users size={16} className="text-vault-cyan" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                <AnimatedCount value={metrics?.cohortSize ?? 0} />
              </h3>
              <span className="text-[9.5px] font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> Live</span>
            </div>
            <Sparkline points={[totalStudents - 3, totalStudents - 2, totalStudents - 1, totalStudents]} stroke="var(--color-vault-cyan)" />
          </div>
        </div>
 
        {/* KPI 2: Average CGPA */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-28 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average CGPA</span>
            <GraduationCap size={16} className="text-vault-accent" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                <AnimatedCount value={metrics?.averageCgpa ?? 0} />
              </h3>
              <span className="text-[9.5px] font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> Live</span>
            </div>
            <Sparkline points={students.filter(s => s.gpa > 0).map(s => s.gpa).slice(-6)} stroke="var(--color-vault-accent)" />
          </div>
        </div>
 
        {/* KPI 3: Average Attendance */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-28 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Attendance Avg</span>
            <Calendar size={16} className="text-vault-cyan" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                <AnimatedCount value={metrics?.averageAttendance ?? 0} suffix="%" />
              </h3>
              <span className="text-[9.5px] font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> Live</span>
            </div>
            <Sparkline points={attendanceStats.slice(-6)} stroke="var(--color-vault-cyan)" />
          </div>
        </div>
 
        {/* KPI 4: Placement Readiness */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-28 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Placement Ready</span>
            <Award size={16} className="text-vault-accent" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                <AnimatedCount value={metrics?.placementReadyPercentage ?? 0} suffix="%" />
              </h3>
              <span className="text-[9.5px] font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> Live</span>
            </div>
            <Sparkline points={[Math.max(0, (metrics?.placementReadyPercentage ?? 0) - 2), Math.max(0, (metrics?.placementReadyPercentage ?? 0) - 1), metrics?.placementReadyPercentage ?? 0]} stroke="var(--color-vault-accent)" />
          </div>
        </div>

      </div>

      {/* Main Grid: Charts & Actionable Directives */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column (8 Columns on desktop): Charts */}
        <div className="xl:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: CGPA Trend */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 text-left">CGPA Trend Profile</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height={220} minWidth={0}>
                  <AreaChart data={gpaChartData} margin={{ left: -25, bottom: 0, right: 10 }}>
                    <defs>
                      <linearGradient id="areaGpaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="var(--color-vault-accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.08)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[5, 10]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Area type="monotone" dataKey="gpa" stroke="var(--color-vault-accent)" strokeWidth={2} fillOpacity={1} fill="url(#areaGpaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Department Distribution */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 text-left">Department Size</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height={220} minWidth={0}>
                  <BarChart data={deptChartData} margin={{ left: -25, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.08)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Bar 
                      dataKey="count" 
                      radius={[3, 3, 0, 0]}
                      shape={<CustomBar />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Student Segmentation */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 text-left">GPA Segment Distribution</h4>
              <div className="h-56 w-full grid grid-cols-2 gap-2 items-center">
                <div className="h-full min-w-0">
                  <ResponsiveContainer width="100%" height={220} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={segmentationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      />
                      <Tooltip {...customTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5 text-xs text-left">
                  {segmentationData.map((seg) => (
                    <div key={seg.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.fill }} />
                      <span className="text-slate-400 dark:text-slate-500 font-bold truncate">{seg.name}</span>
                      <span className="font-extrabold ml-auto font-mono text-[11px]">{seg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 4: Semester Averages */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 text-left">GPA Semester Progression</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height={220} minWidth={0}>
                  <LineChart data={semesterData} margin={{ left: -25, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.08)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[5, 10]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Line type="monotone" dataKey="averageGpa" stroke="var(--color-vault-accent)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Columns on desktop): Insights Panel & Top Performers */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Insights Panel */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-vault-accent" />
              <span>AI Insights Panel</span>
            </h4>
            
            <div className="space-y-4">
              
              {/* Insight 1: Best Dept */}
              <div className="p-3 bg-slate-55/60 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 rounded-md flex items-start gap-3">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Leading Department</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                    <span className="font-semibold text-vault-accent">{bestDept}</span> has the highest cohort average of <span className="font-bold font-mono text-[11px] text-vault-accent">{bestDeptGpa.toFixed(2)} CGPA</span>.
                  </p>
                </div>
              </div>

              {/* Insight 2: Worst Dept */}
              <div className="p-3 bg-slate-55/60 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 rounded-md flex items-start gap-3">
                <div className="p-1.5 bg-red-500/10 text-red-500 rounded-md">
                  <TrendingDown size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Needs Academic Focus</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                    <span className="font-semibold text-red-400">{worstDept}</span> has standard progression averages at <span className="font-bold font-mono text-[11px] text-red-400">{worstDeptGpa.toFixed(2)} CGPA</span>.
                  </p>
                </div>
              </div>

              {/* Insight 3: Core Skill */}
              <div className="p-3 bg-slate-55/60 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 rounded-md flex items-start gap-3">
                <div className="p-1.5 bg-cyan-500/10 text-cyan-500 rounded-md">
                  <Award size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Placement Target Skill</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                    Active badges point to <span className="font-semibold text-vault-cyan">{mostCommonSkill}</span> as the dominant certification vector.
                  </p>
                </div>
              </div>

              {/* Insight 4: Attention Trigger */}
              <div className="p-3 bg-slate-55/60 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 rounded-md flex items-start gap-3">
                <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-md">
                  <AlertCircle size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Attention Required</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                    <span className="font-semibold text-yellow-500">{attentionStudents.length} students</span> are currently performing below a 6.75 CGPA or 60% attendance warning boundary.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Top Students Section */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center justify-between">
              <span>Top Academic Performers</span>
              <ArrowUpRight size={14} className="text-slate-400 dark:text-slate-500" />
            </h4>
            
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {topStudents.map((student, idx) => (
                <div key={student.id} className={`flex items-center gap-3 py-3 ${idx === 0 ? 'pt-0' : ''} ${idx === topStudents.length - 1 ? 'pb-0' : ''}`}>
                  <div className="h-8 w-8 rounded-md bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center font-bold text-vault-accent text-[10px] shrink-0">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-slate-800 dark:text-white">{student.firstName} {student.lastName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">{student.department}</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-vault-accent/10 border border-vault-accent/20 text-vault-accent px-2 py-0.5 rounded">
                    {student.gpa.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
