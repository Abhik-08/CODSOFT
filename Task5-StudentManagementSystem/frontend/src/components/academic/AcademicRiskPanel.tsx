import { AlertTriangle, TrendingUp, Sparkles, AlertCircle, Compass, ListChecks, CheckCircle2 } from 'lucide-react'
import { useRiskDetection } from '../../hooks/useRiskDetection'

interface Props {
  readonly studentId: string
}

export default function AcademicRiskPanel({ studentId }: Props) {
  const { riskReport, loading, error, recalculate } = useRiskDetection(studentId)

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
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold text-left flex items-center gap-2">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    )
  }

  if (!riskReport) return null

  const {
    riskScore,
    riskCategory,
    riskFactors,
    riskReasons,
    interventionSuggestions,
    priorityActions,
    riskTrend,
    lastCalculatedAt
  } = riskReport

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Critical Risk':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'High Risk':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'Moderate Risk':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
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

  // Generate SVG Sparkline points from trend
  const getSparklinePoints = (trend: number[]) => {
    if (!trend || trend.length < 2) return ''
    const width = 120
    const height = 40
    const maxVal = 100
    const minVal = 0
    const step = width / (trend.length - 1)
    
    return trend.map((val, idx) => {
      const x = idx * step
      const y = height - ((val - minVal) / (maxVal - minVal)) * height
      return `${x},${y}`
    }).join(' ')
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-500" />
          <span>EduVault Academic Risk Detection Console</span>
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-[10px] text-slate-500 font-mono">Last Recalculated: {formatCalculatedTime(lastCalculatedAt)}</span>
          <button
            onClick={() => recalculate()}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Recalculate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Score Ring Card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl" />

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
                className="stroke-red-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 * (1 - (riskScore || 0) / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {riskScore}
              </span>
              <span className="text-[9px] font-black uppercase text-slate-400 mt-1 block">Risk Index</span>
            </div>
          </div>

          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${getCategoryColor(riskCategory)}`}>
            {riskCategory}
          </span>
        </div>

        {/* Risk Factors & Trend Card */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-6 space-y-6">
          <div>
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-red-500" />
              <span>Top Trigger Factors</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {riskFactors && riskFactors.length > 0 ? (
                riskFactors.map((f) => (
                  <span key={f} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {f}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs">No critical triggers registered. Performance remains stable.</span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/5 pt-4 flex items-center justify-between">
            <div>
              <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <TrendingUp size={13} className="text-red-500" />
                <span>Risk Index History</span>
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Sliding calculation history window</p>
            </div>
            {riskTrend && riskTrend.length >= 2 ? (
              <div className="flex items-center gap-4">
                <svg className="w-32 h-10 overflow-visible">
                  <polyline
                    fill="none"
                    stroke="var(--color-vault-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={getSparklinePoints(riskTrend)}
                  />
                </svg>
                <span className="text-xs font-mono font-black text-slate-600 dark:text-slate-400">
                  {riskTrend.at(0)}% → {riskTrend.at(-1)}%
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Insufficient trend points.</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Risk Reasons */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
            <Compass size={14} className="text-red-500" />
            <span>Root Causes & Warnings</span>
          </h4>
          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-350 font-medium">
            {riskReasons?.map((r) => (
              <li key={r} className="flex gap-2">
                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Actions */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
            <ListChecks size={14} className="text-emerald-500" />
            <span>Priority Intervention Tasks</span>
          </h4>
          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-350 font-medium">
            {priorityActions?.map((a) => (
              <li key={a} className="flex gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Intervention Suggestions */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 md:col-span-2">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles size={14} className="text-red-500" />
            <span>Academic Improvement Guidelines</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interventionSuggestions?.map((s, i) => (
              <div key={s} className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl flex items-center gap-3">
                <span className="h-5 w-5 bg-red-500/10 text-red-500 font-mono text-[10px] font-bold rounded-lg flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-350 font-semibold">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
