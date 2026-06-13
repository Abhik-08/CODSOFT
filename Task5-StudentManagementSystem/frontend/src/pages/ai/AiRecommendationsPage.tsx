import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  Brain,
  AlertTriangle,
  Send,
  ShieldAlert,
  UserCheck,
  Database,
  X,
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { useStudents } from '../../hooks/useStudents'
import type { Student } from '../../types/student'

import { useAiChat } from '../../hooks/useAiChat'
import type { ChatMessage } from '../../types/ai'

interface AtRiskStudent extends Student {
  attendanceRate: number
  riskLevel: 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factor: string
}

const getGeminiModelBadge = (mod: string, original: string) => {
  if (mod.includes('flash-lite')) return 'Gemini Flash Lite'
  if (mod.includes('flash')) return 'Gemini Flash'
  if (mod.includes('pro')) return 'Gemini Pro'
  return `Gemini ${original}`
}

const getGroqModelBadge = (mod: string, original: string) => {
  if (mod.includes('llama-3.3-70b')) return 'Groq Llama 70B'
  if (mod.includes('llama-3.1-8b')) return 'Groq Llama 8B'
  if (mod.includes('deepseek')) return 'Groq DeepSeek'
  if (mod.includes('qwq')) return 'Groq Qwen QWQ'
  return `Groq ${original}`
}

export default function AiRecommendationsPage() {
  const { students, loading } = useStudents()
  const [advisoryModalStudent, setAdvisoryModalStudent] = useState<AtRiskStudent | null>(null)
  const [advisoryNotes, setAdvisoryNotes] = useState('')
  const [advisorySentStatus, setAdvisorySentStatus] = useState(false)

  // AI Copilot Integration
  const {
    messages,
    sendMessage,
    isTyping,
    error: chatError,
    clearChat,
    retryMessage
  } = useAiChat()
  const [inputValue, setInputValue] = useState('')

  const getModelBadgeText = (providerName?: string, modelName?: string) => {
    if (!providerName || !modelName) return null
    const prov = providerName.toLowerCase()
    const mod = modelName.toLowerCase()
    
    if (prov.includes('gemini')) {
      return getGeminiModelBadge(mod, modelName)
    }
    if (prov.includes('groq')) {
      return getGroqModelBadge(mod, modelName)
    }
    return `${providerName} (${modelName})`
  }
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  const getMessageStyle = (m: ChatMessage) => {
    const base = 'p-2.5 rounded-xl text-xs leading-normal font-semibold shadow-sm w-full'
    if (m.sender === 'user') {
      return `${base} bg-vault-cyan text-white rounded-tr-none`
    }
    if (m.isError) {
      return `${base} bg-red-500/10 border border-red-500/20 text-red-500 rounded-tl-none`
    }
    return `${base} bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-250 rounded-tl-none`
  }

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Calculate dynamic risk lists
  const atRiskStudents = useMemo(() => {
    if (!students) return []
    return students.filter((s) => {
      const totalAttendance = s.attendance?.length || 0
      const present = s.attendance?.filter(
        a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'EXCUSED'
      ).length || 0
      const attendanceRate = totalAttendance > 0 ? (present / totalAttendance) * 100 : 92
      
      return s.gpa < 6.75 || attendanceRate < 60 || s.status === 'SUSPENDED'
    }).map((s) => {
      const totalAttendance = s.attendance?.length || 0
      const present = s.attendance?.filter(
        a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'EXCUSED'
      ).length || 0
      const attendanceRate = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 90
      
      let riskLevel: 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
      let factor = 'GPA Registry Entry'
      
      if (s.gpa < 6 || attendanceRate < 50 || s.status === 'SUSPENDED') {
        riskLevel = 'CRITICAL'
        if (s.status === 'SUSPENDED') {
          factor = 'Disciplinary Suspended'
        } else if (s.gpa < 6) {
          factor = 'Critically Low CGPA'
        } else {
          factor = 'Poor Attendance'
        }
      } else if (s.gpa < 6.75 || attendanceRate < 60) {
        riskLevel = 'HIGH'
        if (s.gpa < 6.75) {
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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    sendMessage(inputValue)
    setInputValue('')
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-white/5 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-[300px] bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
          <div className="lg:col-span-5 h-[300px] bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5" />
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
          <Sparkles size={12} className="animate-pulse" />
          <span>AI Insights Engine</span>
        </div>
      </div>


      {/* Bottom Row: At-Risk student registry & Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Academic Risk Registry Table (7 columns) */}
        <div className="lg:col-span-7 vault-glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-md text-left flex flex-col justify-between h-[480px]">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="text-red-500 animate-pulse" size={15} />
              <span>Academic Risk Registry Detection</span>
            </h3>
            <p className="text-[10px] text-slate-400">Students requiring academic intervention (CGPA &lt; 6.75 or Attendance &lt; 60%).</p>
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

        {/* AI Copilot Panel (5 columns) */}
        <div className="lg:col-span-5 vault-glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-md text-left flex flex-col h-[480px] justify-between">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3.5">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Brain size={15} className="text-vault-accent animate-pulse" />
                <span>AI Academic Copilot</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">Real-time educational registry assistant</p>
            </div>
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="px-2.5 py-1 text-[10px] font-black bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-250 dark:border-white/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dialog Container */}
          <div className="flex-1 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded-xl p-4 overflow-y-auto my-3 space-y-4 pr-2 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-450 dark:text-slate-400 select-none">
                <MessageSquare className="text-vault-accent/40 mb-3" size={32} />
                <p className="font-extrabold text-slate-750 dark:text-white text-xs">AI Academic Copilot</p>
                <p className="text-[10.5px] leading-relaxed mt-2 font-semibold text-slate-400 dark:text-slate-500 max-w-[240px]">
                  Ask questions about students, placement readiness, academic risk, skills, certifications, projects, and portfolio development.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex gap-2 ${m.sender === 'user' ? 'justify-end ml-auto' : 'justify-start mr-auto'} max-w-[85%]`}
                >
                  {m.sender === 'ai' && (
                    <div className="h-6.5 w-6.5 rounded-lg bg-vault-accent/15 border border-vault-accent/30 text-vault-accent flex items-center justify-center shrink-0">
                      <Brain size={11} />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className={getMessageStyle(m)}>
                      {m.text}
                    </div>
                    {m.sender === 'ai' && !m.isError && (m.providerName || m.modelName) && (
                      <div className="flex items-center justify-between px-1 text-[9px] font-bold text-slate-450 dark:text-slate-400 font-mono">
                        <span className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 px-1.5 py-0.5 rounded text-vault-accent">
                          {getModelBadgeText(m.providerName, m.modelName)}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(m.text)
                            alert('Response copied to clipboard!')
                          }}
                          className="hover:text-vault-accent cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                    {m.isError && (
                      <button
                        onClick={() => retryMessage(m.id)}
                        className="px-1 text-left text-[9px] font-bold text-red-500 hover:text-red-400 cursor-pointer underline transition-colors"
                      >
                        Retry Generation
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex gap-2 justify-start animate-fadeIn">
                <div className="h-6.5 w-6.5 rounded-lg bg-vault-accent/15 border border-vault-accent/30 text-vault-accent flex items-center justify-center shrink-0">
                  <Brain size={11} />
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-slate-400 rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {chatError && (
              <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl animate-fadeIn">
                <AlertCircle size={14} className="shrink-0" />
                <span className="font-semibold">{chatError}</span>
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
              placeholder="Ask Academic Copilot..."
              className="flex-1 bg-transparent border-0 text-xs px-2.5 py-1.5 text-slate-850 dark:text-white placeholder-slate-450 focus:outline-none font-bold"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-2 bg-vault-accent hover:opacity-95 text-white rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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

    </div>
  )
}
