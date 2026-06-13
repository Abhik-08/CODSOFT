import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Award, CheckCircle2, ChevronRight, Compass, Flame, BookOpen, FileText, Check, Plus, RefreshCw, Zap, TrendingUp, AlertCircle } from 'lucide-react'
import { roadmapService } from '../../services/roadmapService'
import type { StudentRoadmap } from '../../types/roadmap'

interface ImprovementRoadmapPanelProps {
  studentId: string
}

const ROADMAP_TYPES = [
  { key: 'ACADEMIC', label: 'Academic Growth Roadmap', icon: BookOpen, desc: 'GPA and attendance optimization' },
  { key: 'PLACEMENT', label: 'Placement Readiness Roadmap', icon: Zap, desc: 'Interview prep and placement scoring' },
  { key: 'PORTFOLIO', label: 'Portfolio Enhancement Roadmap', icon: FileText, desc: 'Profile completion and links configuration' },
  { key: 'SKILL', label: 'Skill Development Roadmap', icon: TrendingUp, desc: 'Core programming and missing tools' },
  { key: 'CAREER', label: 'Career Development Roadmap', icon: Compass, desc: 'Specializations and certifications planning' }
]

export default function ImprovementRoadmapPanel({ studentId }: ImprovementRoadmapPanelProps) {
  const [roadmaps, setRoadmaps] = useState<StudentRoadmap[]>([])
  const [activeType, setActiveType] = useState<string>('ACADEMIC')
  const [loading, setLoading] = useState<boolean>(true)
  const [generating, setGenerating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const numStudentId = Number(studentId)

  const fetchRoadmaps = async () => {
    try {
      setLoading(true)
      const data = await roadmapService.getByStudentId(numStudentId)
      setRoadmaps(data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch roadmaps:', err)
      setError('Failed to fetch improvement roadmaps.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmaps()
  }, [studentId])

  const handleGenerate = async (type: string) => {
    try {
      setGenerating(true)
      await roadmapService.generate(numStudentId, type)
      await fetchRoadmaps()
      setError(null)
    } catch (err: any) {
      console.error('Failed to generate roadmap:', err)
      setError('Failed to generate roadmap. Please check backend sync.')
    } finally {
      setGenerating(false)
    }
  }

  const currentRoadmap = roadmaps.find(r => r.roadmapType.toUpperCase() === activeType)

  const calculateProgress = (roadmap: StudentRoadmap) => {
    const curr = roadmap.currentScore || 0
    const target = roadmap.targetScore || 100
    if (target <= 0) return 0
    const raw = (curr / target) * 100
    return Math.min(100, Math.max(0, Math.round(raw)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {ROADMAP_TYPES.map((type) => {
          const Icon = type.icon
          const isActive = activeType === type.key
          const exists = roadmaps.some(r => r.roadmapType.toUpperCase() === type.key)

          return (
            <button
              key={type.key}
              onClick={() => setActiveType(type.key)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                isActive
                  ? 'border-vault-accent bg-vault-accent/5 shadow-md'
                  : 'border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={isActive ? 'text-vault-accent' : 'text-slate-400'} />
                {exists && (
                  <span className="h-2 w-2 rounded-full bg-vault-accent" />
                )}
              </div>
              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">{type.label}</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">{type.desc}</p>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="p-4 bg-vault-destructive/10 border border-vault-destructive/20 text-vault-destructive rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <RefreshCw size={24} className="animate-spin text-vault-accent" />
        </div>
      ) : currentRoadmap ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left"
        >
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Award size={18} className="text-vault-accent" />
                    <span>Roadmap Status Overview</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Estimations and goals personalized using actual performance indexes</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wide border rounded-lg ${getPriorityColor(currentRoadmap.priority)}`}>
                    {currentRoadmap.priority} Priority
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wide border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg">
                    {currentRoadmap.estimatedDuration}
                  </span>
                </div>
              </div>

              {/* Progress and status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Current Position</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{currentRoadmap.currentStatus || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Target Objective</p>
                  <p className="text-sm font-semibold text-vault-accent mt-1">{currentRoadmap.targetStatus || 'N/A'}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Overall Improvement Progress</span>
                  <span className="text-vault-accent">{calculateProgress(currentRoadmap)}% Completed</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-vault-accent to-vault-cyan rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress(currentRoadmap)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Milestones Panel */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={15} className="text-vault-emerald" />
                <span>Roadmap Milestones</span>
              </h3>
              <div className="space-y-3">
                {currentRoadmap.milestones?.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-sm">
                    <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                      <Check size={11} className="text-emerald-500" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Items and Recommendations Sidebars */}
          <div className="space-y-6">
            {/* Action Items */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <Flame size={15} className="text-orange-500" />
                <span>Action Items</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                {currentRoadmap.actionItems?.map((item, idx) => (
                  <li key={idx} className="flex gap-2 leading-relaxed">
                    <ChevronRight size={14} className="text-orange-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <Compass size={15} className="text-vault-cyan" />
                <span>Recommendations</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                {currentRoadmap.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex gap-2 leading-relaxed">
                    <ChevronRight size={14} className="text-vault-cyan shrink-0 mt-0.5" />
                    <span className="font-medium">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Regenerate Action */}
            <button
              onClick={() => handleGenerate(activeType)}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-vault-fg border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer text-xs font-black"
            >
              <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
              <span>Regenerate Roadmap Plan</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="vault-glass p-8 rounded-2xl border border-vault-border text-center space-y-4">
          <p className="text-slate-400 text-sm font-medium">No roadmap generated for this category yet.</p>
          <button
            onClick={() => handleGenerate(activeType)}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vault-accent hover:bg-vault-accent/90 text-white rounded-xl transition-colors shadow-lg cursor-pointer text-xs font-black"
          >
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
            <span>Generate Improvement Plan</span>
          </button>
        </div>
      )}
    </div>
  )
}
