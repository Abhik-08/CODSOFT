import { useState, useEffect } from 'react'
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
import { useAnalytics } from '../../hooks/useAnalytics'
import { roadmapService } from '../../services/roadmapService'
import type { StudentRoadmap } from '../../types/roadmap'

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
  const {
    overview,
    cgpaData,
    attendanceData,
    riskData,
    deptData,
    placementData: placementResData,
    loading: analyticsLoading,
    error
  } = useAnalytics()

  const [activeTab, setActiveTab] = useState<'academic' | 'placement' | 'risk' | 'roadmap'>('academic')
  const [roadmaps, setRoadmaps] = useState<StudentRoadmap[]>([])
  const [roadmapsLoading, setRoadmapsLoading] = useState(false)

  const getRoadmapProgress = (type: string, fallback: number) => {
    const filtered = roadmaps.filter(r => r.roadmapType === type)
    if (filtered.length === 0) return fallback
    const sum = filtered.reduce((acc, r) => {
      const current = r.currentScore ?? 0
      const target = r.targetScore ?? 100
      return acc + (target > 0 ? (current / target) * 100 : 0)
    }, 0)
    return Math.round(sum / filtered.length)
  }

  const getRoadmapCount = (type: string, fallback: number) => {
    const filtered = roadmaps.filter(r => r.roadmapType === type)
    return filtered.length > 0 ? filtered.length : fallback
  }

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setRoadmapsLoading(true)
        const data = await roadmapService.getAll()
        setRoadmaps(data)
      } catch (err) {
        console.error('Failed to fetch roadmaps for analytics:', err)
      } finally {
        setRoadmapsLoading(false)
      }
    }
    fetchRoadmaps()
  }, [])

  const loading = analyticsLoading || roadmapsLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-8 w-64 bg-slate-205 dark:bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {['a-sk-1', 'a-sk-2', 'a-sk-3', 'a-sk-4'].map(k => (
            <div key={k} className="h-80 bg-slate-200/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
        <AlertTriangle size={15} className="shrink-0" />
        <span>Failed to load analytics metrics: {error}</span>
      </div>
    )
  }

  // 1. CGPA Trend over Semesters
  const cgpaTrendData = cgpaData?.progression ?? []

  // 2. Department Size Distribution
  const departmentData = deptData?.enrollment
    ? Object.entries(deptData.enrollment).map(([dept, count]) => ({
        name: dept.split(' ').map(w => w.slice(0, 4)).join(' '),
        students: count,
        fill: getDeptColor(dept)
      }))
    : []

  // 3. Attendance Trend
  const attendanceChartData = attendanceData?.monthlyAttendance ?? [{ name: 'N/A', rate: 0 }]

  // 4. Placement Readiness segments
  const placementData = placementResData?.readiness ?? []

  // Find top department
  const topDept = overview?.topDepartment ?? 'N/A'

  // Placement Intelligence calculations
  const totalCalculated = placementResData?.totalCalculated ?? 0
  const tierDistributionData = placementResData?.tierDistribution ?? []
  const distributionBins = placementResData?.distributionBins ?? []
  const deptAverageScoreData = placementResData?.deptAverageScoreData ?? []

  // Academic Risk calculations
  const totalRiskCalculated = riskData?.riskDistribution.reduce((acc, curr) => acc + curr.count, 0) ?? 0
  const riskCategoryBreakdownData = riskData?.riskCategoryBreakdown ?? []
  const riskDistributionData = riskData?.riskDistribution ?? []
  const deptRiskData = riskData?.departmentRisk ?? []
  const semRiskData = riskData?.semesterRisk ?? []
  const riskTrendAnalysisData = riskData?.riskTrend ?? []


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
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'roadmap'
              ? 'bg-vault-accent text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-250 bg-slate-100 dark:bg-white/5'
          }`}
        >
          Improvement Roadmaps
        </button>
      </div>

      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: CGPA Trend */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">CGPA Trend Profile</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Semester-wise average performance curve from Firestore.</p>
              </div>
              <TrendingUp size={16} className="text-vault-accent" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={250} minWidth={0}>
                <AreaChart data={cgpaTrendData} margin={{ left: -25, bottom: 0, right: 10 }}>
                  <defs>
                    <linearGradient id="areaTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--color-vault-accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.08)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis domain={[6, 10]} stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip {...customTooltipStyle} />
                  <Area type="monotone" dataKey="cgpa" stroke="var(--color-vault-accent)" strokeWidth={2} fillOpacity={1} fill="url(#areaTrendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Department Distribution */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department Enrollment Density</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Student distribution counts across registered departments.</p>
              </div>
              <Building2 size={16} className="text-vault-cyan" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={250} minWidth={0}>
                <BarChart data={departmentData} margin={{ left: -20, bottom: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.08)" />
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
          </div>

          {/* Chart 3: Attendance Trend */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Attendance Stability Index</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Average monthly cohort attendance records.</p>
              </div>
              <Calendar size={16} className="text-vault-cyan" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={250} minWidth={0}>
                <LineChart data={attendanceChartData} margin={{ left: -20, bottom: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.08)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip {...customTooltipStyle} itemStyle={{ color: '#0ea5e9' }} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-vault-cyan)" strokeWidth={2} activeDot={{ r: 5 }} dot={{ strokeWidth: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Placement Readiness */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Placement Preparation Index</h4>
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
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none">{item.name}</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white mt-1 block">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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

      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-gradient-to-r from-vault-accent/5 to-vault-cyan/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">EduVault Improvement Roadmaps Analytics</h3>
              <p className="text-xs text-slate-400 mt-1">Cohort progress, milestones tracking, and skill acquisition indexes.</p>
            </div>
            <div className="px-3 py-1 bg-vault-accent/15 text-vault-accent rounded-xl text-xs font-black uppercase font-mono">
              Roadmaps Tracked: {roadmaps.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Roadmap Progress Analytics */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Roadmap Progress Analytics</span>
                <TrendingUp size={14} className="text-vault-accent" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={[
                    { name: 'Academic', progress: getRoadmapProgress('ACADEMIC', 65) },
                    { name: 'Placement', progress: getRoadmapProgress('PLACEMENT', 72) },
                    { name: 'Portfolio', progress: getRoadmapProgress('PORTFOLIO', 58) },
                    { name: 'Skill', progress: getRoadmapProgress('SKILL', 80) },
                    { name: 'Career', progress: getRoadmapProgress('CAREER', 45) }
                  ]} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Bar
                      dataKey="progress"
                      radius={[4, 4, 0, 0]}
                      shape={<CustomBar />}
                      name="Average Progress %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 2: Improvement Distribution */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Improvement Distribution</span>
                <Target size={14} className="text-vault-cyan" />
              </h4>
              <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-around">
                <div className="w-[50%] h-[80%] min-h-[160px]">
                  <ResponsiveContainer width="100%" height={200} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Academic Growth', value: getRoadmapCount('ACADEMIC', 4), fill: '#34d399' },
                          { name: 'Placement Readiness', value: getRoadmapCount('PLACEMENT', 3), fill: '#0ea5e9' },
                          { name: 'Portfolio Enhancement', value: getRoadmapCount('PORTFOLIO', 2), fill: '#a855f7' },
                          { name: 'Skill Development', value: getRoadmapCount('SKILL', 5), fill: '#f43f5e' },
                          { name: 'Career Development', value: getRoadmapCount('CAREER', 1), fill: '#f59e0b' }
                        ]}
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
                  {[
                    { key: 'ACADEMIC', label: 'Academic Growth', color: '#34d399', fallback: 4 },
                    { key: 'PLACEMENT', label: 'Placement Readiness', color: '#0ea5e9', fallback: 3 },
                    { key: 'PORTFOLIO', label: 'Portfolio Enhancement', color: '#a855f7', fallback: 2 },
                    { key: 'SKILL', label: 'Skill Development', color: '#f43f5e', fallback: 5 },
                    { key: 'CAREER', label: 'Career Development', color: '#f59e0b', fallback: 1 }
                  ].map((type) => {
                    const count = getRoadmapCount(type.key, type.fallback)
                    return (
                      <div key={type.key} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 truncate block leading-none">{type.label}</span>
                          <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{count} Active</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Chart 3: Skill Development Progress */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Skill Development Progress</span>
                <Award size={14} className="text-vault-accent" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <BarChart data={[
                    { name: 'Comp Sci', skillsAvg: 8.5 },
                    { name: 'Electrical', skillsAvg: 5.2 },
                    { name: 'Mechanical', skillsAvg: 4.1 },
                    { name: 'Civil', skillsAvg: 3.2 }
                  ]} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} />
                    <Bar
                      dataKey="skillsAvg"
                      radius={[4, 4, 0, 0]}
                      fill="var(--color-vault-accent)"
                      name="Average Skills Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Chart 4: Placement Growth Trends */}
            <motion.div
              whileHover={{ y: -2 }}
              className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-cyan/30 hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center text-left">
                <span>Placement Growth Trends</span>
                <TrendingUp size={14} className="text-vault-cyan" />
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                  <LineChart data={[
                    { name: 'Month 1', scoreAvg: 62 },
                    { name: 'Month 2', scoreAvg: 68 },
                    { name: 'Month 3', scoreAvg: 74 },
                    { name: 'Month 4', scoreAvg: 81 },
                    { name: 'Month 5', scoreAvg: 85 }
                  ]} margin={{ left: -20, bottom: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[50, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip {...customTooltipStyle} itemStyle={{ color: 'var(--color-vault-cyan)' }} />
                    <Line type="monotone" dataKey="scoreAvg" stroke="var(--color-vault-cyan)" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} name="Placement Score Average" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
