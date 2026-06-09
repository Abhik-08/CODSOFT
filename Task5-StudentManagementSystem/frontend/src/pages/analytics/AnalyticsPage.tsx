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
import { Award, Calendar, GraduationCap, Building2, TrendingUp } from 'lucide-react'

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

export default function AnalyticsPage() {
  // 1. CGPA Trend over Semesters
  const cgpaTrendData = [
    { name: 'Sem 1', cgpa: 7.82 },
    { name: 'Sem 2', cgpa: 8.04 },
    { name: 'Sem 3', cgpa: 7.95 },
    { name: 'Sem 4', cgpa: 8.21 },
    { name: 'Sem 5', cgpa: 8.35 },
    { name: 'Sem 6', cgpa: 8.42 },
    { name: 'Sem 7', cgpa: 8.58 },
    { name: 'Sem 8', cgpa: 8.65 }
  ]

  // 2. Department Size Distribution
  const departmentData = [
    { name: 'Comp Sci', students: 480, fill: '#34d399' },
    { name: 'Elec Eng', students: 310, fill: '#0ea5e9' },
    { name: 'Mech Eng', students: 240, fill: '#a855f7' },
    { name: 'Civil Eng', students: 160, fill: '#f43f5e' },
    { name: 'Bio Tech', students: 120, fill: '#fb7185' }
  ]

  // 3. Attendance Trend (Monthly)
  const attendanceData = [
    { name: 'Jan', rate: 93.4 },
    { name: 'Feb', rate: 94.1 },
    { name: 'Mar', rate: 93.8 },
    { name: 'Apr', rate: 94.6 },
    { name: 'May', rate: 95.2 },
    { name: 'Jun', rate: 94.9 }
  ]

  // 4. Placement Readiness segments
  const placementData = [
    { name: 'Placement Ready', value: 72, fill: '#10b981' },
    { name: 'Ongoing Training', value: 18, fill: '#0ea5e9' },
    { name: 'Requires Support', value: 10, fill: '#f43f5e' }
  ]

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
              <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">Computer Science</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: CGPA Trend */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-vault-accent/30 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">CGPA Trend Profile</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">8-Semester historical average performance curve.</p>
            </div>
            <TrendingUp size={16} className="text-vault-accent" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cgpaTrendData} margin={{ left: -25, bottom: 0, right: 10 }}>
                <defs>
                  <linearGradient id="areaTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-vault-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis domain={[6, 9]} stroke="#64748b" fontSize={9} tickLine={false} />
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
            <ResponsiveContainer width="100%" height="100%">
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ left: -20, bottom: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis domain={[90, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
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
              <ResponsiveContainer width="100%" height="100%">
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
    </div>
  )
}
