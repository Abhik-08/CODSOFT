import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Pencil, Trash2, X, Zap } from 'lucide-react'
import type { Skill } from '../../types/student'

interface Props {
  readonly skills: Skill[]
  readonly onAdd: (data: Omit<Skill, 'id' | 'createdAt'>) => Promise<void>
  readonly onUpdate: (id: string, data: Partial<Skill>) => Promise<void>
  readonly onDelete: (id: string) => Promise<void>
}

const inputCls = "field-surface w-full rounded-xl bg-white dark:bg-white/5 px-3 py-2 text-sm text-vault-fg focus:outline-none"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1"

const CATEGORIES = ['Technical', 'Soft Skills', 'Tools', 'Languages'] as const

const categoryColors: Record<string, string> = {
  'Technical': 'text-vault-accent bg-vault-accent/10 border-vault-accent/20',
  'Soft Skills': 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  'Tools': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  'Languages': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
}

export default function SkillsPanel({ skills, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Skill['category']>('Technical')
  const [proficiency, setProficiency] = useState('80')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => { setName(''); setCategory('Technical'); setProficiency('80'); setEditing(null) }
  const openAdd = () => { resetForm(); setShowModal(true) }
  const openEdit = (skill: Skill) => {
    setEditing(skill); setName(skill.name); setCategory(skill.category); setProficiency(String(skill.proficiency ?? 80))
    setShowModal(true)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const data = { name: name.trim(), category, proficiency: Number(proficiency) }
      if (editing?.id) await onUpdate(editing.id, data); else await onAdd(data)
      setShowModal(false); resetForm()
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => { if (!globalThis.confirm('Delete this skill?')) return; await onDelete(id) }

  // Group by category
  const grouped = CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Zap size={15} className="text-vault-accent" />
          <span>Skills</span>
        </h3>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-vault-accent hover:bg-vault-accent/90 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors">
          <Plus size={12} /> Add Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
      ) : (
        <div className="space-y-5">
          {CATEGORIES.map((cat) => {
            const items = grouped[cat]
            if (items.length === 0) return null
            return (
              <div key={cat}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <motion.div key={skill.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${categoryColors[cat]} transition-colors`}
                    >
                      <span>{skill.name}</span>
                      {skill.proficiency != null && (
                        <span className="text-[9px] opacity-60 font-mono">{skill.proficiency}%</span>
                      )}
                      <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                        <button onClick={() => openEdit(skill)} className="p-0.5 rounded hover:bg-white/20 cursor-pointer"><Pencil size={9} /></button>
                        <button onClick={() => handleDelete(skill.id!)} className="p-0.5 rounded hover:bg-white/20 cursor-pointer"><Trash2 size={9} /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="vault-glass p-6 rounded-2xl border border-vault-border max-w-md w-full space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-vault-accent">{editing ? 'Edit Skill' : 'Add Skill'}</h3>
                <button onClick={() => { setShowModal(false); resetForm() }} className="text-slate-400 hover:text-vault-fg cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><label htmlFor="skill-name" className={labelCls}>Skill Name</label><input id="skill-name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. React.js" className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="skill-cat" className={labelCls}>Category</label>
                    <select id="skill-cat" value={category} onChange={e => setCategory(e.target.value as Skill['category'])} className={inputCls}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label htmlFor="skill-prof" className={labelCls}>Proficiency %</label><input id="skill-prof" type="number" min="0" max="100" value={proficiency} onChange={e => setProficiency(e.target.value)} className={inputCls} /></div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/90 text-white text-sm rounded-xl cursor-pointer font-bold disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Save' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
