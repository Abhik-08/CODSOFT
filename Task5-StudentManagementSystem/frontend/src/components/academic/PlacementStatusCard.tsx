import React, { useState } from 'react'
import { Briefcase } from 'lucide-react'
import type { PlacementStatus } from '../../types/student'
import { placementService } from '../../services/academicProfileService'

interface Props {
  readonly studentId: string
  readonly currentStatus: PlacementStatus
  readonly currentOfferCount: number
}

const STEPS: { status: PlacementStatus; label: string; color: string }[] = [
  { status: 'NOT_STARTED', label: 'Not Started', color: 'bg-slate-400' },
  { status: 'PREPARING', label: 'Preparing', color: 'bg-amber-500' },
  { status: 'INTERVIEWING', label: 'Interviewing', color: 'bg-vault-cyan' },
  { status: 'PLACED', label: 'Placed', color: 'bg-emerald-500' }
]

export default function PlacementStatusCard({ studentId, currentStatus, currentOfferCount }: Props) {
  const [status, setStatus] = useState<PlacementStatus>(currentStatus)
  const [offerCount, setOfferCount] = useState(currentOfferCount)
  const [saving, setSaving] = useState(false)

  const currentIdx = STEPS.findIndex(s => s.status === status)

  const handleUpdate = async (newStatus: PlacementStatus) => {
    setSaving(true)
    try {
      const newOffers = newStatus === 'PLACED' ? Math.max(offerCount, 1) : offerCount
      await placementService.updateStatus(studentId, newStatus, newOffers)
      setStatus(newStatus)
      if (newStatus === 'PLACED' && offerCount < 1) setOfferCount(1)
    } catch (err) {
      console.error('Failed to update placement status:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleOfferChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setOfferCount(val)
    setSaving(true)
    try {
      await placementService.updateStatus(studentId, status, val)
    } catch (err) {
      console.error('Failed to update offer count:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
        <Briefcase size={15} className="text-emerald-500" />
        <span>Placement Status</span>
      </h3>

      <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-5 space-y-5">
        {/* Step Progress */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.status}>
              <button
                onClick={() => handleUpdate(step.status)}
                disabled={saving}
                className={`relative flex flex-col items-center gap-1.5 flex-1 cursor-pointer group disabled:cursor-wait`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black text-white transition-all ${idx <= currentIdx ? step.color : 'bg-slate-200 dark:bg-white/10'} ${idx === currentIdx ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-[#0b0f19] ' + step.color.replace('bg-', 'ring-') + '/30 scale-110' : 'group-hover:scale-105'}`}>
                  {idx + 1}
                </div>
                <span className={`text-[9px] font-bold ${idx <= currentIdx ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${idx < currentIdx ? STEPS[idx + 1].color : 'bg-slate-200 dark:bg-white/10'} transition-colors rounded-full max-w-[40px]`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Offer Count */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Offer Count</p>
            <input
              type="number"
              min="0"
              max="50"
              value={offerCount}
              onChange={handleOfferChange}
              className="mt-1 w-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm font-mono font-bold text-vault-fg focus:outline-none focus:border-vault-accent"
            />
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
            status === 'PLACED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            : status === 'INTERVIEWING' ? 'bg-vault-cyan/10 text-vault-cyan border border-vault-cyan/20'
            : status === 'PREPARING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10'
          }`}>
            {status.replace('_', ' ')}
          </div>
        </div>

        {saving && (
          <p className="text-[10px] text-slate-400 italic">Saving...</p>
        )}
      </div>
    </div>
  )
}
