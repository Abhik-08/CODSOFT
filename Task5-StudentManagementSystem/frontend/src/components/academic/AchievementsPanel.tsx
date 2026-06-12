import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Pencil, Trash2, X, Trophy } from 'lucide-react'
import type { Achievement } from '../../types/student'

interface Props {
  readonly achievements: Achievement[]
  readonly onAdd: (data: Omit<Achievement, 'id' | 'createdAt'>) => Promise<void>
  readonly onUpdate: (id: string, data: Partial<Achievement>) => Promise<void>
  readonly onDelete: (id: string) => Promise<void>
}

const inputCls = "field-surface w-full rounded-xl bg-white dark:bg-white/5 px-3 py-2 text-sm text-vault-fg focus:outline-none"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1"

export default function AchievementsPanel({ achievements, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => { setTitle(''); setDescription(''); setDate(''); setEditing(null) }
  const openAdd = () => { resetForm(); setShowModal(true) }
  const openEdit = (ach: Achievement) => {
    setEditing(ach); setTitle(ach.title); setDescription(ach.description || ''); setDate(ach.date || '')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const data = {
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(date ? { date } : {})
      }
      if (editing?.id) await onUpdate(editing.id, data); else await onAdd(data)
      setShowModal(false); resetForm()
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!globalThis.confirm('Delete this achievement?')) return
    await onDelete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy size={15} className="text-yellow-500" />
          <span>Achievements</span>
        </h3>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-500/90 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors">
          <Plus size={12} /> Add Achievement
        </button>
      </div>

      {achievements.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No achievements added yet.</p>
      ) : (
        <div className="space-y-2">
          {achievements.map((ach) => (
            <motion.div key={ach.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4 group hover:border-yellow-500/20 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <Trophy size={14} className="text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white">{ach.title}</p>
                {ach.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ach.description}</p>}
                {ach.date && <p className="text-[10px] text-slate-400 font-mono mt-1">{ach.date}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEdit(ach)} className="p-1 rounded-lg hover:bg-vault-accent/10 text-slate-400 hover:text-vault-accent cursor-pointer"><Pencil size={11} /></button>
                <button onClick={() => handleDelete(ach.id ?? '')} className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 size={11} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="vault-glass p-6 rounded-2xl border border-vault-border max-w-md w-full space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-yellow-500">{editing ? 'Edit Achievement' : 'Add Achievement'}</h3>
                <button onClick={() => { setShowModal(false); resetForm() }} className="text-slate-400 hover:text-vault-fg cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><label htmlFor="ach-title" className={labelCls}>Title</label><input id="ach-title" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Hackathon Winner" className={inputCls} /></div>
                <div><label htmlFor="ach-desc" className={labelCls}>Description (Optional)</label><input id="ach-desc" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." className={inputCls} /></div>
                <div><label htmlFor="ach-date" className={labelCls}>Date (Optional)</label><input id="ach-date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold">Cancel</button>
                {(() => {
                  let btnLabel = 'Add'
                  if (submitting) {
                    btnLabel = 'Saving...'
                  } else if (editing) {
                    btnLabel = 'Save'
                  }
                  return <button type="submit" disabled={submitting} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-500/90 text-white text-sm rounded-xl cursor-pointer font-bold disabled:opacity-60">{btnLabel}</button>
                })()}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
