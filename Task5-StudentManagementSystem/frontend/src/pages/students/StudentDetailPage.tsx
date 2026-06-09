import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import type { Student } from '../../types/student'

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const studentRef = doc(db, 'students', id)
    const unsubscribe = onSnapshot(
      studentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setStudent({ id: snapshot.id, ...snapshot.data() } as Student)
        } else {
          setStudent(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Firestore student detail listener error:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded" />
        <div className="vault-glass p-8 rounded-xl border border-vault-border space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-white/5 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded" />
              <div className="h-3 w-36 bg-slate-200 dark:bg-white/5 rounded" />
              <div className="h-3 w-40 bg-slate-200 dark:bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard/students" className="text-sm text-vault-cyan hover:underline">&larr; Back to Registry</Link>
      </div>

      <div className="vault-glass p-8 rounded-xl border border-vault-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-vault-border">
          <div>
            <span className="text-xs font-mono px-2 py-1 bg-vault-border text-vault-cyan rounded">
              ID: {id || 'unknown'}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2">
              {student ? `${student.firstName} ${student.lastName}` : 'Student Not Found'}
            </h2>
            <p className="text-slate-400 mt-1">
              {student ? 'Full academic history and performance index.' : 'This student record does not exist in Firestore.'}
            </p>
          </div>
          {student && (
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-vault-border hover:bg-vault-border/80 text-vault-fg rounded-lg transition-colors border border-vault-border">
                Record Attendance
              </button>
              <button className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/80 text-white rounded-lg transition-colors shadow-lg">
                Add Grade
              </button>
            </div>
          )}
        </div>

        {student ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-vault-cyan">Personal Info</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p><span className="text-slate-500">Name:</span> {student.firstName} {student.lastName}</p>
                <p><span className="text-slate-500">Email:</span> {student.email}</p>
                <p><span className="text-slate-500">Department:</span> {student.department}</p>
                <p><span className="text-slate-500">Semester:</span> {student.semester}</p>
                <p><span className="text-slate-500">Enrollment:</span> {student.enrollmentNumber}</p>
                <p><span className="text-slate-500">DOB:</span> {student.dateOfBirth}</p>
                <p><span className="text-slate-500">Status:</span> {student.status}</p>
                <p><span className="text-slate-500">CGPA:</span> <span className="font-bold text-vault-accent">{student.gpa.toFixed(2)}</span></p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-vault-accent">Academic Grades</h3>
              {student.grades && student.grades.length > 0 ? (
                <div className="space-y-2">
                  {student.grades.map((grade) => (
                    <div key={grade.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 text-sm">
                      <p className="font-bold text-slate-800 dark:text-white">{grade.courseName}</p>
                      <p className="text-xs text-slate-400 mt-1">Score: {grade.score} | Grade: {grade.gradeLetter} | {grade.semester}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No grades registered for this student yet.</p>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-vault-emerald">Attendance Record</h3>
              {student.attendance && student.attendance.length > 0 ? (
                <div className="space-y-1.5">
                  {student.attendance.map((record, idx) => {
                    const getStatusClass = (s: string) => {
                      if (s === 'PRESENT') return 'bg-emerald-500/10 text-emerald-500'
                      if (s === 'ABSENT') return 'bg-red-500/10 text-red-500'
                      if (s === 'LATE') return 'bg-yellow-500/10 text-yellow-500'
                      return 'bg-slate-500/10 text-slate-400'
                    }

                    return (
                      <div key={`${record.date}-${idx}`} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 text-xs">
                        <span className="font-mono text-slate-400">{record.date}</span>
                        <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${getStatusClass(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No attendance records generated yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center py-12">
            <p className="text-slate-400 text-sm">No student data found for this ID.</p>
          </div>
        )}
      </div>
    </div>
  )
}
