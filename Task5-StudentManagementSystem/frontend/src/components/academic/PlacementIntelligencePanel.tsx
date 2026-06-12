import { Brain, Sparkles, Award, Target, TrendingUp, AlertCircle, Compass, ListChecks, CheckCircle2 } from 'lucide-react'
import { usePlacementIntelligence } from '../../hooks/usePlacementIntelligence'

interface Props {
  readonly studentId: string
}

export default function PlacementIntelligencePanel({ studentId }: Props) {
  const { placementIntel, loading, error, recalculate } = usePlacementIntelligence(studentId)

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse text-left">
        <div className="h-6 w-48 bg-slate-200 dark:bg-white/5 rounded-lg" />
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-white/5" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded" />
              <div className="h-3 w-64 bg-slate-200 dark:bg-white/5 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-200/50 dark:bg-white/5 rounded-xl" />
            <div className="h-32 bg-slate-200/50 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-vault-destructive/10 border border-vault-destructive/20 text-vault-destructive rounded-xl text-sm font-semibold text-left">
        <AlertCircle className="inline mr-2" size={16} />
        {error}
      </div>
    )
  }

  if (!placementIntel) return null

  const {
    placementScore,
    placementTier,
    confidenceLevel,
    lastCalculatedAt,
    academicReadinessScore,
    technicalReadinessScore,
    careerReadinessScore,
    consistencyReadinessScore,
    industryReadinessScore,
    strengths,
    weaknesses,
    skillGaps,
    careerGaps,
    projectGaps,
    certificationGaps,
    recommendations,
    careerInsights,
    growthRoadmap
  } = placementIntel

  // Determine tier colors
  const getTierClass = (tier: string) => {
    switch (tier) {
      case 'Elite Candidate':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'High Potential':
        return 'bg-vault-cyan/10 text-vault-cyan border-vault-cyan/20'
      case 'Placement Ready':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      case 'Developing Candidate':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
      default:
        return 'bg-slate-400/10 text-slate-500 border-slate-400/20'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Elite Candidate':
        return <Sparkles size={14} className="text-emerald-500" />
      case 'High Potential':
        return <Award size={14} className="text-vault-cyan" />
      default:
        return <Target size={14} />
    }
  }

  const formatCalculatedTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  // Dimension breakdown items
  const DIMENSIONS = [
    { label: 'Academic Strength', score: academicReadinessScore, color: 'text-vault-accent', bg: 'bg-vault-accent/10', w: '25%' },
    { label: 'Technical Strength', score: technicalReadinessScore, color: 'text-vault-cyan', bg: 'bg-vault-cyan/10', w: '30%' },
    { label: 'Career Readiness', score: careerReadinessScore, color: 'text-yellow-500', bg: 'bg-yellow-500/10', w: '20%' },
    { label: 'Consistency Score', score: consistencyReadinessScore, color: 'text-emerald-500', bg: 'bg-emerald-500/10', w: '15%' },
    { label: 'Industry Readiness', score: industryReadinessScore, color: 'text-purple-500', bg: 'bg-purple-500/10', w: '10%' }
  ]

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Brain size={15} className="text-vault-accent" />
          <span>Placement Intelligence Console</span>
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-[10px] text-slate-500 font-mono">Last Evaluated: {formatCalculatedTime(lastCalculatedAt)}</span>
          <button
            onClick={() => recalculate()}
            className="px-3 py-1 bg-vault-accent hover:bg-vault-accent/90 text-white font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Recalculate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SCORE RING CARD (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-vault-accent/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-vault-cyan/5 rounded-full blur-2xl" />

          {/* SVG Progress Ring */}
          <div className="relative flex items-center justify-center mb-4">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-slate-100 dark:stroke-white/5"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-vault-accent transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 62}
                strokeDashoffset={2 * Math.PI * 62 * (1 - placementScore / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800 dark:text-white font-mono leading-none">{placementScore}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider">Score / 100</span>
            </div>
          </div>

          <div className="space-y-3 z-10 w-full">
            <div className={`mx-auto flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase border max-w-fit ${getTierClass(placementTier)}`}>
              {getTierIcon(placementTier)}
              <span>{placementTier}</span>
            </div>

            {/* Confidence Meter */}
            <div className="pt-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                <span>Confidence Level</span>
                <span className="font-mono text-vault-cyan">{confidenceLevel}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-vault-cyan h-full rounded-full transition-all duration-1000"
                  style={{ width: `${confidenceLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CORE DIMENSIONS CARD (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
              <Compass size={14} className="text-vault-cyan" />
              <span>Core Scoring Dimensions</span>
            </h4>
            <div className="space-y-4">
              {DIMENSIONS.map((dim) => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{dim.label} <span className="text-[10px] text-slate-400 font-normal">({dim.w})</span></span>
                    <span className={`font-black font-mono ${dim.color}`}>{dim.score} / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${dim.color.replace('text-', 'bg-')}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* STRENGTHS & WEAKNESSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* STRENGTHS */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>Top Strength Areas</span>
          </h4>
          {strengths && strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((str, idx) => (
                <li key={str} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-emerald-500/[0.02] border border-emerald-500/10 p-2.5 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-[10px] shrink-0">{idx + 1}</span>
                  <span className="font-semibold leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No strengths determined yet.</p>
          )}
        </div>

        {/* WEAKNESSES */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-vault-destructive flex items-center gap-1.5">
            <AlertCircle size={14} />
            <span>Top Improvement Areas</span>
          </h4>
          {weaknesses && weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {weaknesses.map((weak, idx) => (
                <li key={weak} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-vault-destructive/[0.02] border border-vault-destructive/10 p-2.5 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-vault-destructive/10 text-vault-destructive font-bold flex items-center justify-center text-[10px] shrink-0">{idx + 1}</span>
                  <span className="font-semibold leading-relaxed">{weak}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No weaknesses determined yet.</p>
          )}
        </div>

      </div>

      {/* PERSONALIZED RECOMMENDATIONS & ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RECOMMENDATIONS & INSIGHTS (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-4">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
              <ListChecks size={14} className="text-vault-accent" />
              <span>Placement Recommendations</span>
            </h4>
            <div className="space-y-2">
              {recommendations?.map((rec) => (
                <div key={rec} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-vault-accent" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Compass size={14} className="text-vault-cyan" />
              <span>Career Insights</span>
            </h4>
            <div className="space-y-2">
              {careerInsights?.map((ins) => (
                <div key={ins} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  {ins}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROADMAP TIMELINE (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <TrendingUp size={14} className="text-vault-cyan" />
            <span>Growth Roadmap</span>
          </h4>
          <div className="relative pl-4 border-l border-slate-200 dark:border-white/10 space-y-4 pt-2">
            {growthRoadmap?.map((step) => (
              <div key={step} className="relative space-y-1">
                <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-vault-cyan ring-4 ring-white dark:ring-[#0b0f19]" />
                <span className="font-semibold text-xs text-slate-800 dark:text-white leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SKILL GAP ANALYSIS */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
          <Award size={14} className="text-yellow-500" />
          <span>Skill & Academic Gap Analysis</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Technical Gaps', list: skillGaps, border: 'border-vault-cyan/20', color: 'text-vault-cyan' },
            { label: 'Career Presence Gaps', list: careerGaps, border: 'border-vault-accent/20', color: 'text-vault-accent' },
            { label: 'Project Portfolio Gaps', list: projectGaps, border: 'border-yellow-500/20', color: 'text-yellow-500' },
            { label: 'Certification Gaps', list: certificationGaps, border: 'border-purple-500/20', color: 'text-purple-500' }
          ].map((cat) => (
            <div key={cat.label} className={`p-4 bg-slate-50 dark:bg-white/5 rounded-xl border ${cat.border} space-y-2`}>
              <p className={`text-[10px] font-black uppercase tracking-wide ${cat.color}`}>{cat.label}</p>
              {cat.list && cat.list.length > 0 ? (
                <ul className="space-y-1.5">
                  {cat.list.map((item) => (
                    <li key={item} className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed flex items-start gap-1">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No gaps identified.</p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
