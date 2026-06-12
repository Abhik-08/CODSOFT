import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Pencil, Trash2, X, BookOpen } from 'lucide-react'
import type { SubjectRecord } from '../../types/student'

interface Props {
  readonly subjects: SubjectRecord[]
  readonly onAdd: (data: Omit<SubjectRecord, 'id' | 'createdAt'>) => Promise<void>
  readonly onUpdate: (id: string, data: Partial<SubjectRecord>) => Promise<void>
  readonly onDelete: (id: string) => Promise<void>
}

const inputCls = "field-surface w-full rounded-xl bg-white dark:bg-white/5 px-3 py-2 text-sm text-vault-fg focus:outline-none"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1"

function autoGrade(marks: number): string {
  if (marks >= 90) return 'O'
  if (marks >= 80) return 'A+'
  if (marks >= 70) return 'A'
  if (marks >= 60) return 'B+'
  if (marks >= 50) return 'B'
  if (marks >= 40) return 'C'
  return 'F'
}

function gradeColor(grade: string): string {
  if (grade === 'O' || grade === 'A+') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (grade === 'A' || grade === 'B+') return 'text-vault-cyan bg-vault-cyan/10 border-vault-cyan/20'
  if (grade === 'B' || grade === 'C') return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20'
}

export default function SubjectTable({ subjects, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SubjectRecord | null>(null)
  const [subjectName, setSubjectName] = useState('')
  const [subjectCode, setSubjectCode] = useState('')
  const [credits, setCredits] = useState('3')
  const [marks, setMarks] = useState('')
  const [grade, setGrade] = useState('')
  const [semester, setSemester] = useState('1')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setSubjectName(''); setSubjectCode(''); setCredits('3'); setMarks(''); setGrade(''); setSemester('1')
    setEditing(null)
  }

  const openAdd = () => { resetForm(); setShowModal(true) }
  const openEdit = (sub: SubjectRecord) => {
    setEditing(sub)
    setSubjectName(sub.subjectName)
    setSubjectCode(sub.subjectCode)
    setCredits(String(sub.credits))
    setMarks(String(sub.marks))
    setGrade(sub.grade)
    setSemester(String(sub.semester))
    setShowModal(true)
  }

  const handleMarksChange = (val: string) => {
    setMarks(val)
    const num = Number(val)
    if (!isNaN(num) && num >= 0) setGrade(autoGrade(num))
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = {
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim(),
        credits: Number(credits),
        marks: Number(marks),
        grade: grade || autoGrade(Number(marks)),
        semester: Number(semester)
      }
      if (editing?.id) {
        await onUpdate(editing.id, data)
      } else {
        await onAdd(data)
      }
      setShowModal(false)
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!globalThis.confirm('Delete this subject record?')) return
    await onDelete(id)
  }

  // Group subjects by semester
  const grouped = subjects.reduce<Record<number, SubjectRecord[]>>((acc, sub) => {
    const sem = sub.semester || 0
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(sub)
    return acc
  }, {})
  const semKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={15} className="text-vault-cyan" />
          <span>Subject Performance</span>
        </h3>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-vault-cyan hover:bg-vault-cyan/90 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors">
          <Plus size={12} /> Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No subject records added yet.</p>
      ) : (
        <div className="space-y-5">
          {semKeys.map((semNum) => (
            <div key={semNum}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Semester {semNum}</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.03] text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                      <th className="p-3 text-left font-bold">Subject</th>
                      <th className="p-3 text-left font-bold">Code</th>
                      <th className="p-3 text-center font-bold">Credits</th>
                      <th className="p-3 text-center font-bold">Marks</th>
                      <th className="p-3 text-center font-bold">Grade</th>
                      <th className="p-3 text-center font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {grouped[semNum].map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] group">
                        <td className="p-3 font-bold text-slate-800 dark:text-white">{sub.subjectName}</td>
                        <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{sub.subjectCode}</td>
                        <td className="p-3 text-center font-mono">{sub.credits}</td>
                        <td className="p-3 text-center font-mono font-bold">{sub.marks}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${gradeColor(sub.grade)}`}>{sub.grade}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(sub)} className="p-1 rounded-lg hover:bg-vault-accent/10 text-slate-400 hover:text-vault-accent cursor-pointer"><Pencil size={11} /></button>
                            <button onClick={() => handleDelete(sub.id!)} className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 size={11} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="vault-glass p-6 rounded-2xl border border-vault-border max-w-md w-full space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-vault-cyan">{editing ? 'Edit Subject' : 'Add Subject'}</h3>
                <button onClick={() => { setShowModal(false); resetForm() }} className="text-slate-400 hover:text-vault-fg cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="sub-name" className={labelCls}>Subject Name</label><input id="sub-name" type="text" required value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="e.g. Data Structures" className={inputCls} /></div>
                  <div><label htmlFor="sub-code" className={labelCls}>Subject Code</label><input id="sub-code" type="text" required value={subjectCode} onChange={e => setSubjectCode(e.target.value)} placeholder="e.g. CS301" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label htmlFor="sub-credits" className={labelCls}>Credits</label><input id="sub-credits" type="number" min="1" max="10" required value={credits} onChange={e => setCredits(e.target.value)} className={inputCls} /></div>
                  <div><label htmlFor="sub-marks" className={labelCls}>Marks (0-100)</label><input id="sub-marks" type="number" min="0" max="100" required value={marks} onChange={e => handleMarksChange(e.target.value)} className={inputCls} /></div>
                  <div><label htmlFor="sub-grade" className={labelCls}>Grade</label><input id="sub-grade" type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Auto" className={inputCls} /></div>
                </div>
                <div><label htmlFor="sub-sem" className={labelCls}>Semester</label><input id="sub-sem" type="number" min="1" max="12" required value={semester} onChange={e => setSemester(e.target.value)} className={inputCls} /></div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-vault-cyan hover:bg-vault-cyan/90 text-white text-sm rounded-xl cursor-pointer font-bold disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Subject'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
