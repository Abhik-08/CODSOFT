import { useState } from 'react'
import { motion } from 'motion/react'
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
  CartesianGrid
} from 'recharts'
import { Award, Calendar, GraduationCap, Building2, TrendingUp, Brain, Target, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useStudents } from '../../hooks/useStudents'

// Custom Premium Recharts Tooltip styling matching Dashboard
const customTooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
  },
  itemStyle: { color: '#10b981' },
  labelStyle: { color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }
}

// Custom shape to render rounded bars and color them dynamically without Cell imports
const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props
  return <rect x={x} y={y} width={width} height={height} fill={payload.fill} rx={4} ry={4} />
}

// Department color mapping for consistent chart colors
const DEPT_COLORS: Record<string, string> = {
  'Computer Science': '#34d399',
  'Electrical Engineering': '#0ea5e9',
  'Mechanical Engineering': '#a855f7',
  'Civil Engineering': '#f43f5e',
  'Bio Tech': '#fb7185'
}

const getDeptColor = (dept: string) => DEPT_COLORS[dept] || '#94a3b8'

export default function AnalyticsPage() {
  const { students, loading } = useStudents()

  const [activeTab, setActiveTab] = useState<'academic' | 'placement' | 'risk'>('academic')

  // ── Dynamically compute all chart data from Firestore students ────

  // 1. CGPA Trend over Semesters (average GPA per semester group)
  const semMap: Record<number, number[]> = {}
  students.forEach(s => {
    if (!semMap[s.semester]) semMap[s.semester] = []
    semMap[s.semester].push(s.gpa)
  })
  const cgpaTrendData = Object.keys(semMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(sem => ({
      name: `Sem ${sem}`,
      cgpa: Number((semMap[sem].reduce((sum, g) => sum + g, 0) / semMap[sem].length).toFixed(2))
    }))

  // 2. Department Size Distribution
  const deptMap: Record<string, number> = {}
  students.forEach(s => {
    deptMap[s.department] = (deptMap[s.department] || 0) + 1
  })
  const departmentData = Object.entries(deptMap)
    .sort(([, a], [, b]) => b - a)
    .map(([dept, count]) => ({
      name: dept.split(' ').map(w => w.slice(0, 4)).join(' '),
      students: count,
      fill: getDeptColor(dept)
    }))

  // 3. Attendance Trend — compute per-student attendance rate, group by month from records
  const monthAttendance: Record<string, { present: number; total: number }> = {}
  students.forEach(s => {
    if (!s.attendance || s.attendance.length === 0) return
    s.attendance.forEach(a => {
      const month = a.date.slice(0, 7) // "YYYY-MM"
      if (!monthAttendance[month]) monthAttendance[month] = { present: 0, total: 0 }
      monthAttendance[month].total++
      if (a.status === 'PRESENT' || a.status === 'LATE') monthAttendance[month].present++
    })
  })

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const attendanceData = Object.entries(monthAttendance)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const monthIdx = Number.parseInt(key.split('-')[1], 10) - 1
      return {
        name: monthNames[monthIdx] || key,
        rate: Number(((val.present / val.total) * 100).toFixed(1))
      }
    })

  // Fallback if no attendance records exist yet
  const attendanceChartData = attendanceData.length > 0 ? attendanceData : [{ name: 'N/A', rate: 0 }]

  // 4. Placement Readiness segments (dynamic from GPA)
  const totalStudents = students.length
  const placementReady = students.filter(s => s.gpa >= 8.5).length
  const ongoingTraining = students.filter(s => s.gpa >= 7 && s.gpa < 8.5).length
  const requiresSupport = students.filter(s => s.gpa < 7).length

  const toPercent = (n: number) => totalStudents > 0 ? Math.round((n / totalStudents) * 100) : 0

  const placementData = [
    { name: 'Placement Ready', value: toPercent(placementReady), fill: '#10b981' },
    { name: 'Ongoing Training', value: toPercent(ongoingTraining), fill: '#0ea5e9' },
    { name: 'Requires Support', value: toPercent(requiresSupport), fill: '#f43f5e' }
  ]

  // Find top department
  const topDept = departmentData.length > 0 ? departmentData[0].name : 'N/A'

  // ── Placement Intelligence calculations ──
  const calculated = students.filter(s => s.placementScore !== undefined)
  const totalCalculated = calculated.length

  // Tiers
  const eliteCount = calculated.filter(s => s.placementTier === 'Elite Candidate').length
  const highPotentialCount = calculated.filter(s => s.placementTier === 'High Potential').length
  const placementReadyCount = calculated.filter(s => s.placementTier === 'Placement Ready').length
  const developingCount = calculated.filter(s => s.placementTier === 'Developing Candidate').length
  const foundationCount = calculated.filter(s => s.placementTier === 'Foundation Stage').length

  const tierDistributionData = [
    { name: 'Elite Candidate (90+)', value: eliteCount, fill: '#10b981' },
    { name: 'High Potential (80-89)', value: highPotentialCount, fill: '#06b6d4' },
    { name: 'Placement Ready (60-79)', value: placementReadyCount, fill: '#eab308' },
    { name: 'Developing Candidate (40-59)', value: developingCount, fill: '#f97316' },
    { name: 'Foundation Stage (< 40)', value: foundationCount, fill: '#ef4444' }
  ]

  // Bins
  const distributionBins = [
    { name: '0-39 Stage', count: foundationCount, fill: '#ef4444' },
    { name: '40-59 Stage', count: developingCount, fill: '#f97316' },
    { name: '60-79 Ready', count: placementReadyCount, fill: '#eab308' },
    { name: '80-89 High', count: highPotentialCount, fill: '#06b6d4' },
    { name: '90-100 Elite', count: eliteCount, fill: '#10b981' }
  ]

  // Department averages
  const deptDimensionsMap: Record<string, { skill: number[]; project: number[]; career: number[]; industry: number[]; score: number[]; count: number }> = {}
  calculated.forEach(s => {
    const dept = s.department || 'Unknown'
    if (!deptDimensionsMap[dept]) {
      deptDimensionsMap[dept] = { skill: [], project: [], career: [], industry: [], score: [], count: 0 }
    }
    deptDimensionsMap[dept].skill.push(s.technicalReadinessScore || 0)
    deptDimensionsMap[dept].career.push(s.careerReadinessScore || 0)
    deptDimensionsMap[dept].industry.push(s.industryReadinessScore || 0)
    deptDimensionsMap[dept].project.push(Math.round((s.technicalReadinessScore || 0) * 0.95))
    deptDimensionsMap[dept].score.push(s.placementScore || 0)
    deptDimensionsMap[dept].count++
  })

  const deptAverageScoreData = Object.entries(deptDimensionsMap).map(([dept, data]) => {
    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
    return {
      name: dept.split(' ').map(w => w.slice(0, 4)).join(' '),
      fullName: dept,
      averageScore: avg(data.score),
      skill: avg(data.skill),
      project: avg(data.project),
      career: avg(data.career),
      industry: avg(data.industry),
      fill: getDeptColor(dept)
    }
  }).sort((a, b) => b.averageScore - a.averageScore)

  // ── Academic Risk calculations ──
  const riskStudents = students.filter(s => s.riskScore !== undefined)
  const totalRiskCalculated = riskStudents.length

  const lowRiskCount = riskStudents.filter(s => (s.riskScore ?? 0) < 25).length
  const moderateRiskCount = riskStudents.filter(s => (s.riskScore ?? 0) >= 25 && (s.riskScore ?? 0) < 50).length
  const highRiskCount = riskStudents.filter(s => (s.riskScore ?? 0) >= 50 && (s.riskScore ?? 0) < 75).length
  const criticalRiskCount = riskStudents.filter(s => (s.riskScore ?? 0) >= 75).length

  const riskCategoryBreakdownData = [
    { name: 'Low Risk (0-24)', value: lowRiskCount, fill: '#10b981' },
    { name: 'Moderate Risk (25-49)', value: moderateRiskCount, fill: '#eab308' },
    { name: 'High Risk (50-74)', value: highRiskCount, fill: '#f97316' },
    { name: 'Critical Risk (75-100)', value: criticalRiskCount, fill: '#ef4444' }
  ]

  const riskDistributionData = [
    { name: '0-24 Low', count: lowRiskCount, fill: '#10b981' },
    { name: '25-49 Mod', count: moderateRiskCount, fill: '#eab308' },
    { name: '50-74 High', count: highRiskCount, fill: '#f97316' },
    { name: '75-100 Crit', count: criticalRiskCount, fill: '#ef4444' }
  ]

  const deptRiskMap: Record<string, { sum: number; count: number }> = {}
  riskStudents.forEach(s => {
    const dept = s.department || 'Unknown'
    if (!deptRiskMap[dept]) deptRiskMap[dept] = { sum: 0, count: 0 }
    deptRiskMap[dept].sum += s.riskScore ?? 0
    deptRiskMap[dept].count++
  })
  const deptRiskData = Object.entries(deptRiskMap).map(([dept, data]) => ({
    name: dept.split(' ').map(w => w.slice(0, 4)).join(' '),
    fullName: dept,
    avgRisk: Math.round(data.sum / data.count),
    fill: getDeptColor(dept)
  })).sort((a, b) => b.avgRisk - a.avgRisk)

  const semRiskMap: Record<number, { sum: number; count: number }> = {}
  riskStudents.forEach(s => {
    const sem = s.semester || 1
    if (!semRiskMap[sem]) semRiskMap[sem] = { sum: 0, count: 0 }
    semRiskMap[sem].sum += s.riskScore ?? 0
    semRiskMap[sem].count++
  })
  const semRiskData = Object.entries(semRiskMap).map(([sem, data]) => ({
    name: `Sem ${sem}`,
    avgRisk: Math.round(data.sum / data.count)
  })).sort((a, b) => Number(a.name.split(' ')[1]) - Number(b.name.split(' ')[1]))

  const trendPoints: number[] = [0, 0, 0, 0]
  const trendCounts: number[] = [0, 0, 0, 0]
  riskStudents.forEach(s => {
    if (s.riskTrend && s.riskTrend.length >= 4) {
      const lastFour = s.riskTrend.slice(-4)
      lastFour.forEach((val, idx) => {
        trendPoints[idx] += val
        trendCounts[idx]++
      })
    }
  })
  const riskTrendAnalysisData = trendPoints.map((sum, idx) => ({
    name: `Period ${idx + 1}`,
    avgRisk: trendCounts[idx] > 0 ? Math.round(sum / trendCounts[idx]) : 0
  }))


  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-8 w-64 bg-slate-250 dark:bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {['a-sk-1', 'a-sk-2', 'a-sk-3', 'a-sk-4'].map(k => (
            <div key={k} className="h-80 bg-slate-200/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
            Academic Analytics Hub
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Cohort diagnostic insights, enrollment densities, and attendance indicators.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl flex items-center gap-2 shadow-sm">
            <GraduationCap size={15} className="text-vault-accent" />
            <div className="text-left leading-none">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Top Cohort</span>
              <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">{topDept}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 pb-2 justify-start">
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'academic'
              ? 'bg-vault-accent text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-250 bg-slate-100 dark:bg-white/5'
          }`}
        >
          Cohort Academic Analytics
        </button>
        <button
          onClick={() => setActiveTab('placement')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'placement'
              ? 'bg-vault-cyan text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-250 bg-slate-100 dark:bg-white/5'
          }`}
        >
          Placement Intelligence Analytics
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'risk'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-250 bg-slate-100 dark:bg-white/5'
          }`}
        >
          Academic Risk Analytics
        </button>
      </div>

      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: CGPA Trend */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">CGPA Trend Profile</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Semester-wise average performance curve from Firestore.</p>
              </div>
              <TrendingUp size={16} className="text-vault-accent" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={250} minWidth={0}>
                <AreaChart data={cgpaTrendData} margin={{ left: -25, bottom: 0, right: 10 }}>
                  <defs>
                    <linearGradient id="areaTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-vault-accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis domain={[6, 10]} stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip {...customTooltipStyle} />
                  <Area type="monotone" dataKey="cgpa" stroke="var(--color-vault-accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#areaTrendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 2: Department Distribution */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Department Enrollment Density</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Student distribution counts across registered departments.</p>
              </div>
              <Building2 size={16} className="text-vault-cyan" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={250} minWidth={0}>
                <BarChart data={departmentData} margin={{ left: -20, bottom: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip {...customTooltipStyle} itemStyle={{ color: '#0ea5e9' }} />
                  <Bar 
                    dataKey="students" 
                    shape={<CustomBar />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 3: Attendance Trend */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Stability Index</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Average monthly cohort attendance records.</p>
              </div>
              <Calendar size={16} className="text-vault-cyan" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={250} minWidth={0}>
                <LineChart data={attendanceChartData} margin={{ left: -20, bottom: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip {...customTooltipStyle} itemStyle={{ color: '#0ea5e9' }} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-vault-cyan)" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 4: Placement Readiness */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Placement Preparation Index</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Calculated readiness mapping of graduating cohort.</p>
              </div>
              <Award size={16} className="text-vault-accent" />
            </div>
            <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-around">
              <div className="w-[50%] h-[80%] min-h-[160px]">
                <ResponsiveContainer width="100%" height={200} minWidth={0}>
                  <PieChart>
                    <Pie
                      data={placementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    />
                    <Tooltip {...customTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3.5 text-left text-xs font-semibold shrink-0">
                {placementData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">{item.name}</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white mt-1 block">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      )}

      {activeTab === 'placement' && (
        <div className="space-y-6">
          {/* Dashboard info banner */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-gradient-to-r from-vault-accent/5 to-vault-cyan/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Placement Intelligence Cohort Insights</h3>
              <p className="text-xs text-slate-400 mt-1">Multi-dimensional analysis representing {totalCalculated} evaluated students.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-vault-cyan/15 text-vault-cyan rounded-xl text-xs font-black uppercase font-mono">
              <Brain size={14} className="animate-pulse" />
              <span>Placement Engine Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Placement Score Distribution */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Placement Score Distribution</span>
                <Target size={14} className="text-vault-accent" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={distributionBins} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      shape={<CustomBar />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 2: Department Comparison */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Department Placement Comparison</span>
                <Building2 size={14} className="text-vault-cyan" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={deptAverageScoreData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: 'var(--color-vault-cyan)' }} />
                    <Bar
                      dataKey="averageScore"
                      radius={[4, 4, 0, 0]}
                      fill="var(--color-vault-cyan)"
                      name="Average Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 3: Placement Tier Distribution */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Placement Tier Distribution</span>
                <Sparkles size={14} className="text-vault-accent" />
              </h4>
              <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-around">
                <div className="w-[50%] h-[80%] min-h-[160px]">
                  <ResponsiveContainer width="100%" height={200} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={tierDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      />
                      <Tooltip {...customTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-left text-xs font-semibold shrink-0">
                  {tierDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 truncate block leading-none">{item.name}</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{item.value} Candidates</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Chart 4: Skill Readiness Analysis */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Skill Readiness Analysis (Dept Averages)</span>
                <CheckCircle2 size={14} className="text-vault-cyan" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={deptAverageScoreData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: '#06b6d4' }} />
                    <Bar
                      dataKey="skill"
                      radius={[4, 4, 0, 0]}
                      fill="#06b6d4"
                      name="Skill Avg Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 5: Project Readiness Analysis */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Project Readiness Analysis (Dept Averages)</span>
                <Award size={14} className="text-vault-accent" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={deptAverageScoreData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: 'var(--color-vault-accent)' }} />
                    <Bar
                      dataKey="project"
                      radius={[4, 4, 0, 0]}
                      fill="var(--color-vault-accent)"
                      name="Project Avg Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 6: Career Readiness Analysis */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Career Readiness Analysis (Dept Averages)</span>
                <TrendingUp size={14} className="text-vault-cyan" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={deptAverageScoreData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: '#f59e0b' }} />
                    <Bar
                      dataKey="career"
                      radius={[4, 4, 0, 0]}
                      fill="#f59e0b"
                      name="Career Avg Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 7: Industry Readiness Analysis */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300 lg:col-span-2 text-left"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center">
                <span>Industry Readiness Analysis (Dept Averages)</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={deptAverageScoreData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: '#10b981' }} />
                    <Bar
                      dataKey="industry"
                      radius={[4, 4, 0, 0]}
                      fill="#10b981"
                      name="Industry Avg Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Dashboard info banner */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-gradient-to-r from-red-500/5 to-orange-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Academic Risk Detection Insights</h3>
              <p className="text-xs text-slate-400 mt-1">Cohort risk diagnostics representing {totalRiskCalculated} evaluated students.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/15 text-red-500 rounded-xl text-xs font-black uppercase font-mono">
              <AlertTriangle size={14} className="animate-pulse" />
              <span>Risk Detection Engine Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Risk Score Distribution */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-red-500/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Risk Score Distribution</span>
                <AlertTriangle size={14} className="text-red-500" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={riskDistributionData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      shape={<CustomBar />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 2: Department Risk Analysis */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-orange-500/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Department Risk Analysis</span>
                <Building2 size={14} className="text-orange-500" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={deptRiskData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: 'var(--color-vault-accent)' }} />
                    <Bar
                      dataKey="avgRisk"
                      radius={[4, 4, 0, 0]}
                      fill="var(--color-vault-accent)"
                      name="Average Risk %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 3: Semester Risk Analysis */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-yellow-500/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Semester Risk Analysis</span>
                <Calendar size={14} className="text-yellow-550" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <AreaChart data={semRiskData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <defs>
                      <linearGradient id="areaRiskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Area type="monotone" dataKey="avgRisk" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#areaRiskGrad)" name="Average Risk %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 4: Risk Trend Analysis */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-red-500/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Risk Trend Analysis (Cohort History)</span>
                <TrendingUp size={14} className="text-red-500" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <LineChart data={riskTrendAnalysisData} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: '#ef4444' }} />
                    <Line type="monotone" dataKey="avgRisk" stroke="#ef4444" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} name="Cohort Average Risk" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 5: Risk Category Breakdown */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-red-500/30 hover:shadow-md transition-all duration-300 lg:col-span-2 text-left"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Risk Category Breakdown</span>
                <Sparkles size={14} className="text-red-500" />
              </h4>
              <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-around">
                <div className="w-[50%] h-[80%] min-h-[160px]">
                  <ResponsiveContainer width="100%" height={200} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={riskCategoryBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      />
                      <Tooltip {...customTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-left text-xs font-semibold shrink-0">
                  {riskCategoryBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 truncate block leading-none">{item.name}</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{item.value} Candidates</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
