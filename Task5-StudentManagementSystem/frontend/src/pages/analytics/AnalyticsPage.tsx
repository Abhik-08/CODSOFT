export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Academic Analytics</h2>
        <p className="text-slate-400 mt-1">Interactive visualizations, department distributions, and GPA cohorts analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="vault-glass p-6 rounded-xl border border-vault-border h-80 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-vault-cyan">GPA Cohort Trends</h3>
          <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
            [ Line Chart: Performance trends over semesters ]
          </div>
        </div>
        <div className="vault-glass p-6 rounded-xl border border-vault-border h-80 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-vault-accent">Departmental Enrolment Distribution</h3>
          <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
            [ Pie Chart: Student counts across Engineering & Science ]
          </div>
        </div>
      </div>
    </div>
  )
}
