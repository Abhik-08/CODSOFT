import { useParams, Link } from 'react-router-dom'

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/students" className="text-sm text-vault-cyan hover:underline">&larr; Back to Registry</Link>
      </div>

      <div className="vault-glass p-8 rounded-xl border border-vault-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-vault-border">
          <div>
            <span className="text-xs font-mono px-2 py-1 bg-vault-border text-vault-cyan rounded">
              ID: {id || 'unknown'}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2">Student Profile Detail</h2>
            <p className="text-slate-400 mt-1">Full academic history and performance index.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-vault-border hover:bg-vault-border/80 text-vault-fg rounded-lg transition-colors border border-vault-border">
              Record Attendance
            </button>
            <button className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/80 text-white rounded-lg transition-colors shadow-lg">
              Add Grade
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-vault-cyan">Personal Info</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Name:</span> —</p>
              <p><span className="text-slate-500">Email:</span> —</p>
              <p><span className="text-slate-500">Department:</span> —</p>
              <p><span className="text-slate-500">Semester:</span> —</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-vault-accent">Academic Grades</h3>
            <p className="text-sm text-slate-500">No grades registered for this student yet.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-vault-emerald">Attendance Record</h3>
            <p className="text-sm text-slate-500">No attendance records generated yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
