import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Pencil, Trash2, X, Award, ExternalLink } from 'lucide-react'
import type { Certificate } from '../../types/student'

interface Props {
  readonly certificates: Certificate[]
  readonly onAdd: (data: Omit<Certificate, 'id' | 'createdAt'>) => Promise<void>
  readonly onUpdate: (id: string, data: Partial<Certificate>) => Promise<void>
  readonly onDelete: (id: string) => Promise<void>
}

const inputCls = "field-surface w-full rounded-xl bg-white dark:bg-white/5 px-3 py-2 text-sm text-vault-fg focus:outline-none"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1"

export default function CertificatesPanel({ certificates, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [certUrl, setCertUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => { setTitle(''); setIssuer(''); setIssueDate(''); setCertUrl(''); setEditing(null) }
  const openAdd = () => { resetForm(); setShowModal(true) }
  const openEdit = (cert: Certificate) => {
    setEditing(cert); setTitle(cert.title); setIssuer(cert.issuer); setIssueDate(cert.issueDate); setCertUrl(cert.certificateUrl || '')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const data = { title: title.trim(), issuer: issuer.trim(), issueDate, ...(certUrl.trim() ? { certificateUrl: certUrl.trim() } : {}) }
      if (editing?.id) await onUpdate(editing.id, data); else await onAdd(data)
      setShowModal(false); resetForm()
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => { if (!globalThis.confirm('Delete this certificate?')) return; await onDelete(id) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Award size={15} className="text-amber-500" />
          <span>Certificates</span>
        </h3>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-500/90 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors">
          <Plus size={12} /> Add Certificate
        </button>
      </div>

      {certificates.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No certificates added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {certificates.map((cert) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4 group hover:border-amber-500/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{cert.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">{cert.issuer}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{cert.issueDate}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {cert.certificateUrl && (
                    <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 cursor-pointer"><ExternalLink size={11} /></a>
                  )}
                  <button onClick={() => openEdit(cert)} className="p-1 rounded-lg hover:bg-vault-accent/10 text-slate-400 hover:text-vault-accent cursor-pointer"><Pencil size={11} /></button>
                  <button onClick={() => handleDelete(cert.id!)} className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 size={11} /></button>
                </div>
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
                <h3 className="text-lg font-black text-amber-500">{editing ? 'Edit Certificate' : 'Add Certificate'}</h3>
                <button onClick={() => { setShowModal(false); resetForm() }} className="text-slate-400 hover:text-vault-fg cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><label htmlFor="cert-title" className={labelCls}>Title</label><input id="cert-title" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AWS Solutions Architect" className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="cert-issuer" className={labelCls}>Issuer</label><input id="cert-issuer" type="text" required value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="e.g. Amazon" className={inputCls} /></div>
                  <div><label htmlFor="cert-date" className={labelCls}>Issue Date</label><input id="cert-date" type="date" required value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputCls} /></div>
                </div>
                <div><label htmlFor="cert-url" className={labelCls}>Certificate URL (Optional)</label><input id="cert-url" type="url" value={certUrl} onChange={e => setCertUrl(e.target.value)} placeholder="https://..." className={inputCls} /></div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-500 hover:bg-amber-500/90 text-white text-sm rounded-xl cursor-pointer font-bold disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Save' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
