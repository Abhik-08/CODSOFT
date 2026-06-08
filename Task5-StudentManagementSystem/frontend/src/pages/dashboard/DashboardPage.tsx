import { useState, useEffect } from 'react'
import { useStudents } from '../../hooks/useStudents'
import { motion, AnimatePresence } from 'motion/react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Building2,
  CheckCircle2,
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
      <path d={pathData} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Custom Bar Shape Component to resolve inline definition warnings
const CustomBar = (props: any) => {
  const { index, ...rest } = props
  const fill = index % 2 === 0 ? 'var(--color-vault-accent)' : 'var(--color-vault-cyan)'
  return <Rectangle {...rest} fill={fill} radius={[4, 4, 0, 0]} />
}

// Micro-interaction: Metric Count Up animation
const AnimatedCount = ({ value, duration = 1.2, prefix = "", suffix = "" }: { value: number | string, duration?: number, prefix?: string, suffix?: string }) => {
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

// Rotating AI Ticker Ribbon Component
const SmartInsightTicker = () => {
  const insights = [
    "Computer Science leads cohort CGPA averages this month.",
    "Student digital portfolio completion increased by 12% in the last week.",
    "Attention warning boundaries: 2 students require immediate academic counseling.",
    "Cohort attendance average improved by 4.2% across engineering departments."
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
      <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md bg-vault-accent/15 text-vault-accent font-bold text-[9px] tracking-wider uppercase font-mono shadow-sm">
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
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate"
          >
            {insights[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { students, loading } = useStudents()

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-white/5 rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-white/5 rounded-lg" />
          </div>
          <div className="h-6 w-36 bg-slate-200 dark:bg-white/5 rounded-lg" />
        </div>
        
        {/* Ticker Ticker */}
        <div className="h-11 w-full bg-slate-200 dark:bg-white/5 rounded-xl" />

        {/* KPI Row Skeletons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['kpi-sk-1', 'kpi-sk-2', 'kpi-sk-3', 'kpi-sk-4', 'kpi-sk-5', 'kpi-sk-6'].map((key) => (
            <div key={key} className="h-28 bg-slate-200/60 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5" />
          ))}
        </div>

        {/* Grid charts Skeletons */}
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
  const avgGpa = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + s.gpa, 0) / totalStudents).toFixed(2)
    : "0.00"

  // Group by department
  const deptMap: { [key: string]: number[] } = {}
  students.forEach(s => {
    if (!deptMap[s.department]) deptMap[s.department] = []
    deptMap[s.department].push(s.gpa)
  })

  const departments = Object.keys(deptMap)
  const totalDepts = departments.length || 0

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

  // Students requiring attention (CGPA < 8)
  const attentionStudents = students.filter(s => s.gpa < 8)
  const placementReadyCount = students.filter(s => s.gpa >= 8.5).length
  const placementRate = totalStudents > 0 ? Math.round((placementReadyCount / totalStudents) * 100) : 0

  // Skill calculations
  const skills = ["Machine Learning", "Fullstack Development", "Cloud Architecting", "Embedded Systems"]
  const mostCommonSkill = skills[0]

  // Order students for Top list
  const topStudents = [...students]
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 4)

  // Recharts Data Prep
  // 1. GPA Area Chart
  const gpaChartData = [...students]
    .sort((a, b) => a.gpa - b.gpa)
    .map(s => ({
      name: `${s.firstName} ${s.lastName[0]}.`,
      gpa: s.gpa
    }))

  // 2. Department Count Bar Chart
  const deptChartData = departments.map(dept => ({
    name: dept.split(' ')[0], // abbreviation
    count: deptMap[dept].length
  }))

  // 3. GPA Segmentation Pie Chart
  const eliteCount = students.filter(s => s.gpa >= 9).length
  const standardCount = students.filter(s => s.gpa >= 8 && s.gpa < 9).length
  const supportCount = students.filter(s => s.gpa < 8).length

  const segmentationData = [
    { name: 'Elite (>= 9.0)', value: eliteCount, fill: '#34d399' },
    { name: 'Standard (8.0-9.0)', value: standardCount, fill: '#06b6d4' },
    { name: 'Support (< 8.0)', value: supportCount, fill: '#f43f5e' }
  ]

  // 4. Semester Avg Line Chart
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-vault-fg to-vault-fg/75 bg-clip-text text-transparent">
            Student Success Command Center
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Actionable intelligence metrics, cohort diagnostics, and predictive insights.</p>
        </div>
        <div className="px-4 py-2 bg-vault-emerald/10 border border-vault-emerald/20 text-vault-emerald rounded-xl text-xs font-bold font-mono">
          SYSTEM ACTIVE: {activeStudents}/{totalStudents} COHORTS LOGGED
        </div>
      </div>

      {/* Smart Insight Ribbon */}
      <SmartInsightTicker />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* KPI 1: Total Enrolled */}
        <motion.div
          whileHover={{ y: -3 }}
          className="vault-glass p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between h-28 hover:border-vault-cyan/30 shadow-sm transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cohort Size</span>
            <Users size={16} className="text-vault-cyan" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                <AnimatedCount value={totalStudents} />
              </h3>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> +4.8%</span>
            </div>
            <Sparkline points={[1220, 1235, 1250, 1248, 1265, 1280]} stroke="var(--color-vault-cyan)" />
          </div>
        </motion.div>

        {/* KPI 2: Average CGPA */}
        <motion.div
          whileHover={{ y: -3 }}
          className="vault-glass p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between h-28 hover:border-vault-accent/30 shadow-sm transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average CGPA</span>
            <GraduationCap size={16} className="text-vault-accent" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                <AnimatedCount value={avgGpa} />
              </h3>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> +1.2%</span>
            </div>
            <Sparkline points={[3.52, 3.55, 3.58, 3.6, 3.62, 3.65]} stroke="var(--color-vault-accent)" />
          </div>
        </motion.div>

        {/* KPI 3: Departments */}
        <motion.div
          whileHover={{ y: -3 }}
          className="vault-glass p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between h-28 hover:border-vault-cyan/30 shadow-sm transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Departments</span>
            <Building2 size={16} className="text-vault-cyan" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                <AnimatedCount value={totalDepts} />
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Stable</span>
            </div>
            <Sparkline points={[3, 3, 4, 4, 4, 4]} stroke="var(--color-vault-cyan)" />
          </div>
        </motion.div>

        {/* KPI 4: Placement Readiness */}
        <motion.div
          whileHover={{ y: -3 }}
          className="vault-glass p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between h-28 hover:border-vault-accent/30 shadow-sm transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Ready</span>
            <Award size={16} className="text-vault-accent" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                <AnimatedCount value={placementRate} suffix="%" />
              </h3>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> +3.1%</span>
            </div>
            <Sparkline points={[82, 84, 85, 86, 88, 89]} stroke="var(--color-vault-accent)" />
          </div>
        </motion.div>

        {/* KPI 5: Attendance */}
        <motion.div
          whileHover={{ y: -3 }}
          className="vault-glass p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between h-28 hover:border-vault-cyan/30 shadow-sm transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attendance Avg</span>
            <Calendar size={16} className="text-vault-cyan" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                <AnimatedCount value={94.2} suffix="%" />
              </h3>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> +0.4%</span>
            </div>
            <Sparkline points={[93.1, 93.5, 93.8, 94, 94.2]} stroke="var(--color-vault-cyan)" />
          </div>
        </motion.div>

        {/* KPI 6: Active Students */}
        <motion.div
          whileHover={{ y: -3 }}
          className="vault-glass p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between h-28 hover:border-vault-accent/30 shadow-sm transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Registry</span>
            <CheckCircle2 size={16} className="text-vault-accent" />
          </div>
          <div className="flex justify-between items-end text-left">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                <AnimatedCount value={activeStudents} />
              </h3>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5"><TrendingUp size={10} /> +2.3%</span>
            </div>
            <Sparkline points={[1190, 1205, 1220, 1218, 1235, 1250]} stroke="var(--color-vault-accent)" />
          </div>
        </motion.div>

      </div>

      {/* Main Grid: charts and insights */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column (8 Columns on desktop): Charts */}
        <div className="xl:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: CGPA Trend */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-lg transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-left">CGPA Trend Profile</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gpaChartData} margin={{ left: -25, bottom: 0, right: 10 }}>
                    <defs>
                      <linearGradient id="areaGpa" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--color-vault-accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.2)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[5, 10]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--vault-card)', borderColor: 'var(--vault-border)' }} />
                    <Area type="monotone" dataKey="gpa" stroke="var(--color-vault-accent)" strokeWidth={2} fillOpacity={1} fill="url(#areaGpa)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 2: Department Distribution */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-lg transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-left">Department Size</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ left: -25, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.2)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--vault-card)', borderColor: 'var(--vault-border)' }} />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                      shape={<CustomBar />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 3: Student Segmentation */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-lg transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-left">GPA Segment Distribution</h4>
              <div className="h-56 w-full flex items-center justify-between">
                <div className="w-[50%] h-full">
                  <ResponsiveContainer width="100%" height="100%">
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
                      <Tooltip contentStyle={{ backgroundColor: 'var(--vault-card)', borderColor: 'var(--vault-border)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-[50%] space-y-2 text-xs text-left">
                  {segmentationData.map((seg) => (
                    <div key={seg.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: seg.fill }} />
                      <span className="text-slate-400 truncate">{seg.name}</span>
                      <span className="font-bold ml-auto">{seg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Chart 4: Semester Averages */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-lg transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-left">GPA Semester Progression</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={semesterData} margin={{ left: -25, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.2)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[5, 10]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--vault-card)', borderColor: 'var(--vault-border)' }} />
                    <Line type="monotone" dataKey="averageGpa" stroke="var(--color-vault-accent)" strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>

          {/* Section 4: Analytics Storytelling & Cohort Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* Storytelling Card 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left relative overflow-hidden group hover:border-vault-cyan/30 transition-all duration-300"
            >
              {/* Subtle spotlight glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-vault-cyan/5 to-vault-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-vault-cyan animate-pulse" />
                <span>Academic Performance Narrative</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold text-vault-cyan uppercase font-mono tracking-wider block">Observation</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Average CGPA increased 4.2%</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider block">Cause</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Computer Science cohort improved performance</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-extrabold text-vault-accent uppercase font-mono tracking-wider block">Recommendation</span>
                  <p className="text-xs text-slate-600 dark:text-slate-350 mt-0.5 leading-relaxed font-semibold">Focus mentorship on Mechanical students</p>
                </div>
              </div>
            </motion.div>

            {/* Storytelling Card 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left relative overflow-hidden group hover:border-vault-accent/30 transition-all duration-300"
            >
              {/* Subtle spotlight glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-vault-cyan/5 to-vault-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-vault-accent animate-pulse" />
                <span>Placement Cohort Diagnostics</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold text-vault-accent uppercase font-mono tracking-wider block">Observation</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Placement readiness score reached 89.4%</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider block">Cause</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Portfolio Studio generated 92% active student portfolio badges</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-extrabold text-vault-cyan uppercase font-mono tracking-wider block">Recommendation</span>
                  <p className="text-xs text-slate-650 dark:text-slate-350 mt-0.5 leading-relaxed font-semibold">Export portfolio packages to recruiting agency pipelines</p>
                </div>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Right Column (4 Columns on desktop): Insights Panel & Top list */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Insights Panel */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-vault-accent animate-pulse" />
              <span>AI Insights Panel</span>
            </h4>
            
            <div className="space-y-4">
              
              {/* Insight 1: Best Dept */}
              <div className="p-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl flex items-start gap-3">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Leading Department</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    <span className="font-semibold text-vault-accent">{bestDept}</span> has the highest cohort average of <span className="font-bold font-mono text-[11px]">{bestDeptGpa.toFixed(2)} CGPA</span>.
                  </p>
                </div>
              </div>

              {/* Insight 2: Worst Dept */}
              <div className="p-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl flex items-start gap-3">
                <div className="p-1.5 bg-red-500/10 text-red-500 rounded-lg">
                  <TrendingDown size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Needs Academic Focus</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    <span className="font-semibold text-red-400">{worstDept}</span> has standard progression averages at <span className="font-bold font-mono text-[11px]">{worstDeptGpa.toFixed(2)} CGPA</span>.
                  </p>
                </div>
              </div>

              {/* Insight 3: Core Skill */}
              <div className="p-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl flex items-start gap-3">
                <div className="p-1.5 bg-cyan-500/10 text-cyan-500 rounded-lg">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Placement Target Skill</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Active badges point to <span className="font-semibold text-vault-cyan">{mostCommonSkill}</span> as the dominant certification vector.
                  </p>
                </div>
              </div>

              {/* Insight 4: Attention Trigger */}
              <div className="p-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl flex items-start gap-3">
                <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Attention Required</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    <span className="font-semibold text-yellow-500">{attentionStudents.length} students</span> are currently performing below an 8.0 CGPA warning boundary.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Top Students Section */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Top Academic Performers</span>
              <ArrowUpRight size={14} className="text-slate-500" />
            </h4>
            
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {topStudents.map((student, idx) => (
                <div key={student.id} className={`flex items-center gap-3 py-3 ${idx === 0 ? 'pt-0' : ''} ${idx === topStudents.length - 1 ? 'pb-0' : ''}`}>
                  <div className="h-8 w-8 rounded-full bg-vault-accent/10 border border-vault-accent/30 flex items-center justify-center font-bold text-vault-accent text-[10px]">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-slate-800 dark:text-white">{student.firstName} {student.lastName}</p>
                    <p className="text-[10px] text-slate-550 dark:text-slate-400 truncate mt-0.5">{student.department}</p>
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
