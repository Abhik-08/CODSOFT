import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { SemesterRecord } from '../../types/student'

interface Props {
  readonly semesters: SemesterRecord[]
}

export default function CgpaTrendChart({ semesters }: Props) {
  const sorted = [...semesters].sort((a, b) => a.semesterNumber - b.semesterNumber)

  const chartData = sorted.map((sem) => ({
    name: `Sem ${sem.semesterNumber}`,
    SGPA: sem.sgpa,
    CGPA: sem.cgpa,
    Attendance: sem.attendance
  }))

  if (chartData.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={15} className="text-emerald-500" />
          <span>CGPA Trend</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add semester records to see CGPA trends.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
        <TrendingUp size={15} className="text-emerald-500" />
        <span>CGPA Trend & Academic Growth</span>
      </h3>

      <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4 h-[332px]">
        <ResponsiveContainer width="100%" height={300} minWidth={0}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(11,15,25,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800 }} />
            <Line
              type="monotone"
              dataKey="SGPA"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="CGPA"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-3 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase">Latest CGPA</p>
          <p className="text-lg font-black text-vault-accent font-mono">{sorted[sorted.length - 1]?.cgpa.toFixed(2) || '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-3 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase">Best SGPA</p>
          <p className="text-lg font-black text-vault-cyan font-mono">{sorted.length > 0 ? Math.max(...sorted.map(s => s.sgpa)).toFixed(2) : '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-3 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase">Growth</p>
          <p className={`text-lg font-black font-mono ${sorted.length >= 2 ? (sorted[sorted.length - 1].cgpa >= sorted[0].cgpa ? 'text-emerald-500' : 'text-red-500') : 'text-slate-400'}`}>
            {sorted.length >= 2
              ? `${sorted[sorted.length - 1].cgpa >= sorted[0].cgpa ? '+' : ''}${(sorted[sorted.length - 1].cgpa - sorted[0].cgpa).toFixed(2)}`
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
