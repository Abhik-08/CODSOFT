import React, { useState } from 'react';
import { studentService } from '../../services/studentService';
import type { Student, SemesterData } from '../../types/student';

type SemesterInput = {
  id: string;
  semesterName: string;
  gpa: number;
  courses: string[];
};

interface Props {
  readonly student: Student;
  readonly onClose: () => void;
  readonly onUpdated: (student: Student) => void;
}

export default function StudentEditForm({ student, onClose, onUpdated }: Props) {
  const [firstName, setFirstName] = useState(student.firstName);
  const [lastName, setLastName] = useState(student.lastName);
  const [email, setEmail] = useState(student.email);
  const [department, setDepartment] = useState(student.department);
  const [semester, setSemester] = useState(String(student.semester));
  const [semesters, setSemesters] = useState<SemesterInput[]>(
    (student.semesters ?? []).map((s, i) => ({
      id: `s_${Date.now()}_${i}`,
      semesterName: s.semesterName,
      gpa: s.gpa,
      courses: s.courses?.slice() ?? [],
    }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSemester = () => {
    setSemesters([
      ...semesters,
      {
        id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        semesterName: '',
        gpa: 0,
        courses: [],
      },
    ]);
  };

  const handleRemoveSemester = (index: number) => {
    setSemesters(semesters.filter((_, i) => i !== index));
  };

  const handleSemesterChange = (index: number, field: keyof SemesterInput, value: string | number | string[]) => {
    const updated = semesters.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setSemesters(updated);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const semesterPayload: SemesterData[] = semesters
        .filter((s) => s.semesterName.trim())
        .map((s) => ({
          semesterName: s.semesterName.trim(),
          gpa: Number(s.gpa),
          courses: s.courses.filter((c) => c.trim()),
        }));

      const updated = await studentService.update(student.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        department: department.trim(),
        semester: Number(semester),
        ...(semesterPayload.length ? { semesters: semesterPayload } : {}),
      });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error('Failed to update student:', err);
      setError(err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="vault-glass p-6 rounded-xl border border-vault-border max-w-2xl w-full space-y-4 text-left my-8">
        <h3 className="text-xl font-bold text-vault-cyan">Edit Student</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editFirstName" className="block text-xs text-slate-400 mb-1">First Name</label>
              <input
                id="editFirstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-900 border border-vault-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-accent"
              />
            </div>
            <div>
              <label htmlFor="editLastName" className="block text-xs text-slate-400 mb-1">Last Name</label>
              <input
                id="editLastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-900 border border-vault-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-accent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="editEmail" className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              id="editEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-vault-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editDepartment" className="block text-xs text-slate-400 mb-1">Department</label>
              <input
                id="editDepartment"
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-vault-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-accent"
              />
            </div>
            <div>
              <label htmlFor="editCurrentSemester" className="block text-xs text-slate-400 mb-1">Current Semester</label>
              <input
                id="editCurrentSemester"
                type="number"
                min="1"
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-900 border border-vault-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-accent"
              />
            </div>
          </div>

          {/* Semester repeatable section */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-vault-accent">Semesters</h4>
            {semesters.map((s, idx) => (
              <div key={s.id} className="border border-vault-border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Semester {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSemester(idx)}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`semName-${s.id}`} className="block text-xs text-slate-400 mb-1">Name</label>
                    <input
                      id={`semName-${s.id}`}
                      type="text"
                      value={s.semesterName}
                      onChange={(e) => handleSemesterChange(idx, 'semesterName', e.target.value)}
                      placeholder="e.g. Spring 2026"
                      className="w-full bg-slate-900 border border-vault-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-vault-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor={`semGpa-${s.id}`} className="block text-xs text-slate-400 mb-1">GPA</label>
                    <input
                      id={`semGpa-${s.id}`}
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={s.gpa}
                      onChange={(e) => handleSemesterChange(idx, 'gpa', e.target.value)}
                      className="w-full bg-slate-900 border border-vault-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-vault-accent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`semCourses-${s.id}`} className="block text-xs text-slate-400 mb-1">Courses (comma separated)</label>
                  <input
                    id={`semCourses-${s.id}`}
                    type="text"
                    value={s.courses.join(', ')}
                    onChange={(e) =>
                      handleSemesterChange(
                        idx,
                        'courses',
                        e.target.value.split(',').map((c) => c.trim())
                      )
                    }
                    placeholder="e.g. CS101, MATH201"
                    className="w-full bg-slate-900 border border-vault-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-vault-accent"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSemester}
              className="px-3 py-1 bg-vault-accent hover:bg-vault-accent/80 text-white rounded text-sm cursor-pointer"
            >
              + Add Semester
            </button>
          </div>

          {error && (
            <p className="text-sm text-vault-destructive">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-vault-border hover:bg-vault-border/80 text-vault-fg text-sm rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/80 text-white text-sm rounded cursor-pointer"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
