import React, { useState, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import {
  Brain,
  AlertTriangle,
  Send,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  X,
  Zap,
  UserCheck,
  Layers,
  ShieldAlert,
  Sliders,
  Check,
  Database
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts'
import { useStudents } from '../../hooks/useStudents'
import type { Student } from '../../types/student'

interface AtRiskStudent extends Student {
  attendanceRate: number
  riskLevel: 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factor: string
}

export default function AiRecommendationsPage() {
  const { students, loading } = useStudents()
  const [advisoryModalStudent, setAdvisoryModalStudent] = useState<AtRiskStudent | null>(null)
  const [advisoryNotes, setAdvisoryNotes] = useState('')
  const [advisorySentStatus, setAdvisorySentStatus] = useState(false)

  // Gemini API Configuration Sandbox State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('eduvault_gemini_key') || '')
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'SANDBOX' | 'LIVE'>(
    localStorage.getItem('eduvault_gemini_key') ? 'LIVE' : 'SANDBOX'
  )

  // Mock Copilot State
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: 'Welcome to the Academic Intelligence Center. Ask me anything about student performance, cohort risk levels, or CGPA distributions.' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  // Calculate dynamic risk lists
  const atRiskStudents = useMemo(() => {
    if (!students) return []
    return students.filter((s) => {
      const totalAttendance = s.attendance?.length || 0
      const present = s.attendance?.filter(
        a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'EXCUSED'
      ).length || 0
      const attendanceRate = totalAttendance > 0 ? (present / totalAttendance) * 100 : 92
      
      return s.gpa < 8 || attendanceRate < 85 || s.status === 'SUSPENDED'
    }).map((s) => {
      const totalAttendance = s.attendance?.length || 0
      const present = s.attendance?.filter(
        a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'EXCUSED'
      ).length || 0
      const attendanceRate = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 90
      
      let riskLevel: 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
      let factor = 'GPA Registry Entry'
      
      if (s.gpa < 7 || attendanceRate < 75 || s.status === 'SUSPENDED') {
        riskLevel = 'CRITICAL'
        if (s.status === 'SUSPENDED') {
          factor = 'Disciplinary Suspended'
        } else if (s.gpa < 7) {
          factor = 'Critically Low CGPA'
        } else {
          factor = 'Poor Attendance'
        }
      } else if (s.gpa < 8 || attendanceRate < 85) {
        riskLevel = 'HIGH'
        if (s.gpa < 8) {
          factor = 'CGPA Support Boundary'
        } else {
          factor = 'Attendance Drift'
        }
      }
      
      return {
        ...s,
        attendanceRate,
        riskLevel,
        factor
      }
    })
  }, [students])

  // Placement stats
  const totalStudents = students?.length || 0
  const placementReadyCount = students?.filter(s => s.gpa >= 8.5).length || 0
  const placementRate = totalStudents > 0 ? Math.round((placementReadyCount / totalStudents) * 100) : 0

  // Risk Score metrics
  const averageRiskScore = useMemo(() => {
    if (totalStudents === 0) return 0
    return Math.round((atRiskStudents.length / totalStudents) * 100)
  }, [atRiskStudents, totalStudents])

  // Forecast data prep
  const forecastData = [
    { name: 'Sem 1', actual: 8.55, forecast: 8.55 },
    { name: 'Sem 2', actual: 8.78, forecast: 8.78 },
    { name: 'Sem 3', actual: 8.95, forecast: 8.95 },
    { name: 'Sem 4', actual: 9.13, forecast: 9.13 },
    { name: 'Sem 5 (F)', actual: null, forecast: 9.3 },
    { name: 'Sem 6 (F)', actual: null, forecast: 9.55 },
  ]

  // Skill gap data
  const skillGapData = [
    { subject: 'ML & Data Sci', actual: 78, target: 90 },
    { subject: 'Fullstack Web', actual: 85, target: 95 },
    { subject: 'Cloud Systems', actual: 64, target: 85 },
    { subject: 'Core Databases', actual: 88, target: 90 },
    { subject: 'DSA Theory', actual: 80, target: 92 },
    { subject: 'System Design', actual: 58, target: 80 },
  ]

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const userMsg = { id: Date.now().toString(), sender: 'user', text: inputValue }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)
    scrollToBottom()

    setTimeout(() => {
      let replyText = `I've analyzed the student database queries. The general registry records indicate standard attendance ratios at 94.2% and an average CGPA benchmark of ${avgGpa}.`
      const lowerInput = inputValue.toLowerCase()

      if (lowerInput.includes('risk') || lowerInput.includes('warning') || lowerInput.includes('at risk')) {
        replyText = `There are currently ${atRiskStudents.length} students flagged in the risk registry (CGPA < 8.0 or Attendance < 85%). Mechanical engineering represents the highest risk segment with standard averages.`
      } else if (lowerInput.includes('gpa') || lowerInput.includes('cgpa') || lowerInput.includes('grade')) {
        replyText = `The current cohort average CGPA is ${avgGpa}. Computer Science has the highest CGPA averages, while Mechanical Engineering requires immediate tutorial counseling.`
      } else if (lowerInput.includes('attendance') || lowerInput.includes('absent')) {
        replyText = "Cohort attendance sits at 94.2% average. Mechanical Engineering department has drifted to 88.5% average attendance, requiring advisory reviews."
      } else if (lowerInput.includes('placement') || lowerInput.includes('ready') || lowerInput.includes('job')) {
        replyText = `Placement readiness is predicted at ${placementRate}% for the graduating batch. Key drivers include portfolio validation and specific industry-sync badges.`
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: replyText }])
      setIsTyping(false)
      scrollToBottom()
    }, 1200)
  }

  // Handle advisory modal
  const handleOpenAdvisoryModal = (student: AtRiskStudent) => {
    setAdvisoryModalStudent(student)
    setAdvisoryNotes(`Dear ${student.firstName},\n\nWe have noticed a drift in your academic metrics (CGPA: ${student.gpa.toFixed(2)}, Attendance: ${student.attendanceRate}%). Let's schedule an academic advisory review this week.`)
    setAdvisorySentStatus(false)
  }

  const handleSendAdvisory = (e: React.SyntheticEvent) => {
    e.preventDefault()
    setAdvisorySentStatus(true)
    setTimeout(() => {
      setAdvisoryModalStudent(null)
      alert(`Academic advisory alert dispatched successfully to ${advisoryModalStudent?.firstName}'s institutional email.`)
    }, 1000)
  }

  const handleSaveApiKey = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (tempApiKey.trim()) {
      localStorage.setItem('eduvault_gemini_key', tempApiKey)
      setApiKey(tempApiKey)
      setApiConnectionStatus('LIVE')
      setIsConfigModalOpen(false)
    }
  }

  const handleResetApiKey = () => {
    localStorage.removeItem('eduvault_gemini_key')
    setApiKey('')
    setApiConnectionStatus('SANDBOX')
  }

  const avgGpa = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + s.gpa, 0) / totalStudents).toFixed(2)
    : "0.00"

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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-white/5 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['skel-1', 'skel-2', 'skel-3', 'skel-4'].map((key) => (
            <div key={key} className="h-28 bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-[300px] bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
          <div className="lg:col-span-4 h-[300px] bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent flex items-center gap-2.5">
            <Brain className="text-vault-accent" />
            <span>Academic Intelligence Center</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Predictive forecasts, cohort risk detection, and automated student advisories.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-vault-accent/10 border border-vault-accent/20 rounded-xl text-[10px] font-bold text-vault-accent font-mono uppercase tracking-wider shadow-sm">
          <Zap size={12} className="animate-pulse" />
          <span>AI Insights Engine</span>
        </div>
      </div>

      {/* Stats and Indicators Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Risk Meter */}
        <div className="vault-glass p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-vault-accent/5 to-vault-accent/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="rgba(148,163,184,0.12)" strokeWidth="4.5" fill="transparent" />
              <motion.circle
                cx="28"
                cy="28"
                r="22"
                stroke={averageRiskScore > 15 ? 'var(--color-vault-accent)' : 'var(--color-vault-cyan)'}
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray="138.2"
                initial={{ strokeDashoffset: 138.2 }}
                animate={{ strokeDashoffset: 138.2 * (1 - averageRiskScore / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-[11px] font-black font-mono">{averageRiskScore}%</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Risk Index</span>
            <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
              {averageRiskScore > 15 ? 'Elevated Drift Risk' : 'Optimal Cohort'}
            </p>
            <span className="text-[9.5px] text-slate-400 font-semibold">Scan registry boundaries</span>
          </div>
        </div>

        {/* KPI 2: Placement Predictor */}
        <div className="vault-glass p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-vault-cyan/5 to-vault-cyan/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="p-3 bg-vault-cyan/15 text-vault-cyan rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placement Predictor</span>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white">{placementRate}% Predictability</h4>
            <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} /> +2.4% vs benchmark
            </span>
          </div>
        </div>

        {/* KPI 3: Attendance Forecast */}
        <div className="vault-glass p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-vault-emerald/5 to-vault-emerald/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="p-3 bg-vault-emerald/15 text-vault-emerald rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Forecast</span>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white">94.8% Projected</h4>
            <span className="text-[9.5px] text-slate-400 font-semibold">CSE stable; Mech alert drift</span>
          </div>
        </div>

        {/* KPI 4: Registry Growth Trend */}
        <div className="vault-glass p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-vault-accent/5 to-vault-accent/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="p-3 bg-vault-accent/15 text-vault-accent rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registry Growth Trend</span>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white">Cohort Expansion</h4>
            <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} /> +4.2% engineering drift
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Forecasts and Skill Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Academic GPA Forecast Chart (7 columns) */}
        <div className="lg:col-span-7 vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp size={14} className="text-vault-cyan" />
                <span>Academic Trend Forecast Model</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Historical averages mapped alongside projected semester parameters.</p>
            </div>
            <span className="text-[9px] font-bold bg-vault-cyan/15 text-vault-cyan px-2 py-0.5 rounded font-mono uppercase">Semester 5-6 Projections</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={forecastData} margin={{ left: -25, bottom: 0, right: 10 }}>
                <defs>
                  <linearGradient id="areaActualForecast" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-vault-cyan)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-vault-cyan)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.12)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis domain={[5, 10]} stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="var(--color-vault-cyan)" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#areaActualForecast)" 
                  connectNulls
                />

                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="var(--color-vault-accent)" 
                  strokeWidth={2} 
                  strokeDasharray="5,5" 
                  dot={{ r: 3.5, strokeWidth: 1 }} 
                  activeDot={{ r: 5 }} 
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Analysis Radar Chart (5 columns) */}
        <div className="lg:col-span-5 vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={14} className="text-vault-accent" />
              <span>Skill Gap & Industry Readiness Radar</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Cohort averages compared to target tier-1 placement thresholds.</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillGapData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.12)" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={8} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(148, 163, 184, 0.3)" fontSize={7} />
                <Radar name="Cohort Average" dataKey="actual" stroke="var(--color-vault-cyan)" fill="var(--color-vault-cyan)" fillOpacity={0.25} />
                <Radar name="Industry Goal" dataKey="target" stroke="var(--color-vault-accent)" fill="var(--color-vault-accent)" fillOpacity={0.08} />
                <Tooltip {...customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 8, marginTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Row: At-Risk student registry & Copilot with Gemini Sandbox settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* At-Risk Student Registry Table (7 columns) */}
        <div className="lg:col-span-7 vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md text-left flex flex-col justify-between h-[480px]">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="text-red-500 animate-pulse" size={15} />
              <span>Academic Risk Registry Detection</span>
            </h3>
            <p className="text-[10px] text-slate-400">Students flagged below benchmark parameters (CGPA &lt; 8.0 or Attendance &lt; 85%).</p>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2.5">
            {atRiskStudents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2">
                <Database size={20} className="opacity-40" />
                <span>No active cohort risk parameters triggered. All models optimal.</span>
              </div>
            ) : (
              atRiskStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="p-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-none">{student.firstName} {student.lastName}</p>
                      <p className="text-[9.5px] text-slate-400 font-semibold mt-1">{student.department} • Sem {student.semester}</p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2.5">
                    <div className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded font-mono text-[9.5px] font-bold">
                      {student.gpa.toFixed(2)} CGPA
                    </div>
                    <div className={`px-2 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                      student.attendanceRate < 85 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                    }`}>
                      {student.attendanceRate}% Attd
                    </div>
                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-lg uppercase font-mono border ${
                      student.riskLevel === 'CRITICAL' 
                        ? 'bg-red-500/15 text-red-500 border-red-500/30'
                        : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                    }`}>
                      {student.riskLevel}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenAdvisoryModal(student)}
                    className="px-3 py-1.5 bg-vault-accent hover:opacity-95 text-white rounded-lg font-bold text-[9.5px] shadow-sm transition-all active:scale-[0.98] cursor-pointer shrink-0"
                  >
                    Send Advisory
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Copilot Panel with Gemini Sandbox settings (5 columns) */}
        <div className="lg:col-span-5 vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md text-left flex flex-col h-[480px] justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Brain size={15} className="text-vault-accent" />
                <span>EduVault Copilot</span>
              </h3>
              
              <button
                onClick={() => {
                  setTempApiKey(apiKey)
                  setIsConfigModalOpen(true)
                }}
                className="p-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-250 dark:border-white/10 text-slate-400 hover:text-vault-fg transition-all cursor-pointer"
                title="Configure Gemini API Settings"
              >
                <Sliders size={12} />
              </button>
            </div>
            
            {/* Gemini Sandbox status bar */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-lg p-2 mt-1.5 text-[9px] font-bold font-mono">
              <span className="text-slate-400">Gemini: {apiConnectionStatus === 'LIVE' ? 'LIVE KEY DEPLOYED' : 'SANDBOX SIMULATOR'}</span>
              <span className="text-slate-400">Rate: 75 t/s • Latency: 180ms</span>
              <span className={`w-1.5 h-1.5 rounded-full ${apiConnectionStatus === 'LIVE' ? 'bg-emerald-500' : 'bg-vault-cyan'} animate-pulse`} />
            </div>
          </div>

          {/* Dialog Container */}
          <div className="flex-1 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl p-4 overflow-y-auto my-3 space-y-3.5 pr-2">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="h-6.5 w-6.5 rounded-full bg-vault-accent/15 border border-vault-accent/30 text-vault-accent flex items-center justify-center shrink-0">
                    <Brain size={11} />
                  </div>
                )}
                <div className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-normal font-semibold ${
                  m.sender === 'user' 
                    ? 'bg-vault-cyan text-white rounded-tr-none shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-250 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="h-6.5 w-6.5 rounded-full bg-vault-accent/15 border border-vault-accent/30 text-vault-accent flex items-center justify-center shrink-0 animate-pulse">
                  <Brain size={11} />
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-slate-400 rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input console */}
          <div className="flex gap-2 items-center border border-slate-200 dark:border-white/5 p-1.5 rounded-xl bg-slate-50/50 dark:bg-white/5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Copilot (e.g. 'Who is at risk?')..."
              className="flex-1 bg-transparent border-0 text-xs px-2.5 py-1.5 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none font-bold"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-vault-accent hover:opacity-95 text-white rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Submit message"
            >
              <Send size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* Advisory Dispatch Modal */}
      {advisoryModalStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-[#090e18] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-left relative"
          >
            <button 
              onClick={() => setAdvisoryModalStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-vault-fg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              <span>Academic Advisory Dispatch</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Configure and send a dynamic educational advisor intervention alert.</p>

            <form onSubmit={handleSendAdvisory} className="mt-4 space-y-4">
              <div className="p-3.5 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl text-xs space-y-1 font-semibold">
                <p className="font-extrabold text-slate-800 dark:text-white mb-1">Recipient Details</p>
                <p className="text-slate-500">Student: {advisoryModalStudent.firstName} {advisoryModalStudent.lastName}</p>
                <p className="text-slate-500">GPA: {advisoryModalStudent.gpa.toFixed(2)} • Attd: {advisoryModalStudent.attendanceRate}%</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="advisory-notes" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Advisory Message Content</label>
                <textarea
                  id="advisory-notes"
                  rows={4}
                  value={advisoryNotes}
                  onChange={(e) => setAdvisoryNotes(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 rounded-xl focus:outline-none focus:border-vault-accent transition-colors"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAdvisoryModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={advisorySentStatus}
                  className="px-4 py-2 bg-gradient-to-r from-vault-accent to-vault-cyan text-white rounded-xl text-xs font-bold shadow-md shadow-vault-accent/15 cursor-pointer flex items-center gap-1.5 hover:opacity-95 transition-opacity"
                >
                  {advisorySentStatus ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Dispatching alert...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={13} />
                      <span>Dispatch Intervention</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Gemini Sandbox Key Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-left relative"
          >
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-vault-fg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="text-vault-accent" size={18} />
              <span>Configure Gemini API Key</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Configure your Gemini API settings to transition out of sandbox testing mode.</p>

            <form onSubmit={handleSaveApiKey} className="mt-4 space-y-4 font-semibold text-xs">
              <div className="space-y-1.5">
                <label htmlFor="tempApiKey" className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 dark:text-slate-400">Gemini API Key (saved locally)</label>
                <input
                  id="tempApiKey"
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full font-mono text-xs px-3 py-2.5 border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 rounded-xl focus:outline-none focus:border-vault-accent transition-colors"
                />
              </div>

              <div className="flex gap-2 justify-between items-center pt-2">
                {apiKey ? (
                  <button
                    type="button"
                    onClick={handleResetApiKey}
                    className="text-red-500 hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    Reset Active Key
                  </button>
                ) : (
                  <span />
                )}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-vault-accent to-vault-cyan text-white rounded-xl text-xs font-bold shadow-md shadow-vault-accent/15 cursor-pointer flex items-center gap-1 hover:opacity-95 transition-opacity"
                  >
                    <Check size={12} />
                    <span>Apply Key</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  )
}
