import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, X, GraduationCap } from 'lucide-react'
import type { SemesterRecord } from '../../types/student'

interface Props {
  readonly semesters: SemesterRecord[]
  readonly onAdd: (data: Omit<SemesterRecord, 'id' | 'createdAt'>) => Promise<void>
  readonly onUpdate: (id: string, data: Partial<SemesterRecord>) => Promise<void>
  readonly onDelete: (id: string) => Promise<void>
}

const inputCls = "field-surface w-full rounded-xl bg-white dark:bg-white/5 px-3 py-2 text-sm text-vault-fg focus:outline-none"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1"

export default function SemesterTimeline({ semesters, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SemesterRecord | null>(null)
  const [semNum, setSemNum] = useState('1')
  const [sgpa, setSgpa] = useState('')
  const [cgpa, setCgpa] = useState('')
  const [attendance, setAttendance] = useState('100')
  const [academicYear, setAcademicYear] = useState('')
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setSemNum('1'); setSgpa(''); setCgpa(''); setAttendance('100'); setAcademicYear(''); setRemarks('')
    setEditing(null)
  }

  const openAdd = () => { resetForm(); setShowModal(true) }
  const openEdit = (sem: SemesterRecord) => {
    setEditing(sem)
    setSemNum(String(sem.semesterNumber))
    setSgpa(String(sem.sgpa))
    setCgpa(String(sem.cgpa))
    setAttendance(String(sem.attendance))
    setAcademicYear(sem.academicYear)
    setRemarks(sem.remarks || '')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = {
        semesterNumber: Number(semNum),
        sgpa: Number(sgpa),
        cgpa: Number(cgpa),
        attendance: Number(attendance),
        academicYear,
        ...(remarks.trim() ? { remarks: remarks.trim() } : {})
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
    if (!globalThis.confirm('Delete this semester record?')) return
    await onDelete(id)
  }

  const sorted = [...semesters].sort((a, b) => a.semesterNumber - b.semesterNumber)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap size={15} className="text-vault-accent" />
          <span>Semester History</span>
        </h3>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-vault-accent hover:bg-vault-accent/90 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors">
          <Plus size={12} /> Add Semester
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No semester records added yet.</p>
      ) : (
        <div className="relative pl-6 border-l-2 border-vault-accent/20 space-y-4">
          {sorted.map((sem) => (
            <motion.div
              key={sem.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="absolute -left-[31px] top-3 h-3 w-3 rounded-full bg-vault-accent border-2 border-white dark:border-[#0b0f19]" />
              <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4 group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Semester {sem.semesterNumber}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">{sem.academicYear}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(sem)} className="p-1 rounded-lg hover:bg-vault-accent/10 text-slate-400 hover:text-vault-accent transition-colors cursor-pointer"><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(sem.id!)} className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">SGPA</p>
                    <p className="text-sm font-black text-vault-accent font-mono">{sem.sgpa.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">CGPA</p>
                    <p className="text-sm font-black text-vault-cyan font-mono">{sem.cgpa.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Attendance</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{sem.attendance}%</p>
                  </div>
                </div>
                {sem.remarks && (
                  <p className="text-[10px] text-slate-500 italic mt-2">{sem.remarks}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="vault-glass p-6 rounded-2xl border border-vault-border max-w-md w-full space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-vault-accent">{editing ? 'Edit Semester' : 'Add Semester'}</h3>
                <button onClick={() => { setShowModal(false); resetForm() }} className="text-slate-400 hover:text-vault-fg cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="sem-num" className={labelCls}>Semester #</label><input id="sem-num" type="number" min="1" max="12" required value={semNum} onChange={e => setSemNum(e.target.value)} className={inputCls} /></div>
                  <div><label htmlFor="sem-year" className={labelCls}>Academic Year</label><input id="sem-year" type="text" required value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="2025-26" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label htmlFor="sem-sgpa" className={labelCls}>SGPA</label><input id="sem-sgpa" type="number" step="0.01" min="0" max="10" required value={sgpa} onChange={e => setSgpa(e.target.value)} className={inputCls} /></div>
                  <div><label htmlFor="sem-cgpa" className={labelCls}>CGPA</label><input id="sem-cgpa" type="number" step="0.01" min="0" max="10" required value={cgpa} onChange={e => setCgpa(e.target.value)} className={inputCls} /></div>
                  <div><label htmlFor="sem-att" className={labelCls}>Attendance %</label><input id="sem-att" type="number" step="0.1" min="0" max="100" required value={attendance} onChange={e => setAttendance(e.target.value)} className={inputCls} /></div>
                </div>
                <div><label htmlFor="sem-remarks" className={labelCls}>Remarks (Optional)</label><input id="sem-remarks" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Dean's List" className={inputCls} /></div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/90 text-white text-sm rounded-xl cursor-pointer font-bold disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Semester'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
