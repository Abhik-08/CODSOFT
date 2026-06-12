import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Pencil, Trash2, X, FolderGit2, ExternalLink, GitBranch } from 'lucide-react'
import type { Project } from '../../types/student'

interface Props {
  readonly projects: Project[]
  readonly onAdd: (data: Omit<Project, 'id' | 'createdAt'>) => Promise<void>
  readonly onUpdate: (id: string, data: Partial<Project>) => Promise<void>
  readonly onDelete: (id: string) => Promise<void>
}

const inputCls = "field-surface w-full rounded-xl bg-white dark:bg-white/5 px-3 py-2 text-sm text-vault-fg focus:outline-none"
const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1"

export default function ProjectsPanel({ projects, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [techStack, setTechStack] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => { setTitle(''); setDescription(''); setTechStack(''); setGithubUrl(''); setDemoUrl(''); setEditing(null) }
  const openAdd = () => { resetForm(); setShowModal(true) }
  const openEdit = (proj: Project) => {
    setEditing(proj); setTitle(proj.title); setDescription(proj.description); setTechStack(proj.techStack.join(', ')); setGithubUrl(proj.githubUrl || ''); setDemoUrl(proj.demoUrl || '')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
        ...(githubUrl.trim() ? { githubUrl: githubUrl.trim() } : {}),
        ...(demoUrl.trim() ? { demoUrl: demoUrl.trim() } : {})
      }
      if (editing?.id) await onUpdate(editing.id, data); else await onAdd(data)
      setShowModal(false); resetForm()
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => { if (!globalThis.confirm('Delete this project?')) return; await onDelete(id) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <FolderGit2 size={15} className="text-violet-500" />
          <span>Projects</span>
        </h3>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-500/90 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors">
          <Plus size={12} /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((proj) => (
            <motion.div key={proj.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/75 dark:bg-white/[0.03] p-4 group hover:border-violet-500/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{proj.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.techStack.map((tech) => (
                      <span key={tech} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">{tech}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-vault-fg flex items-center gap-1"><GitBranch size={10} /> GitHub</a>}
                    {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-vault-fg flex items-center gap-1"><ExternalLink size={10} /> Demo</a>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(proj)} className="p-1 rounded-lg hover:bg-vault-accent/10 text-slate-400 hover:text-vault-accent cursor-pointer"><Pencil size={11} /></button>
                  <button onClick={() => handleDelete(proj.id!)} className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 size={11} /></button>
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
                <h3 className="text-lg font-black text-violet-500">{editing ? 'Edit Project' : 'Add Project'}</h3>
                <button onClick={() => { setShowModal(false); resetForm() }} className="text-slate-400 hover:text-vault-fg cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><label htmlFor="proj-title" className={labelCls}>Title</label><input id="proj-title" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AI Chatbot" className={inputCls} /></div>
                <div><label htmlFor="proj-desc" className={labelCls}>Description</label><textarea id="proj-desc" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." className={`${inputCls} min-h-[60px] resize-none`} /></div>
                <div><label htmlFor="proj-tech" className={labelCls}>Tech Stack (comma separated)</label><input id="proj-tech" type="text" required value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, Node.js, Firebase" className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="proj-github" className={labelCls}>GitHub URL</label><input id="proj-github" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className={inputCls} /></div>
                  <div><label htmlFor="proj-demo" className={labelCls}>Demo URL</label><input id="proj-demo" type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://..." className={inputCls} /></div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-vault-fg text-sm rounded-xl cursor-pointer font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-violet-500 hover:bg-violet-500/90 text-white text-sm rounded-xl cursor-pointer font-bold disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Save' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
