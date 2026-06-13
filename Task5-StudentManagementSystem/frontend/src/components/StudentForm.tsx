import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Student } from '../types/student';

type StudentFormProps = Readonly<{
  isEdit: boolean;
  fName: string;
  setFName: (v: string) => void;
  lName: string;
  setLName: (v: string) => void;
  em: string;
  setEm: (v: string) => void;
  enroll: string;
  setEnroll: (v: string) => void;
  dob: string;
  setDob: (v: string) => void;
  dept: string;
  setDept: (v: string) => void;
  sem: string;
  setSem: (v: string) => void;
  st: Student['status'];
  setSt: (v: Student['status']) => void;
  cgpa: string;
  setCgpa: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  githubUrl: string;
  setGithubUrl: (v: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (v: string) => void;
  portfolioUrl: string;
  setPortfolioUrl: (v: string) => void;
  portfolioTitle: string;
  setPortfolioTitle: (v: string) => void;
  portfolioSummary: string;
  setPortfolioSummary: (v: string) => void;
  attendanceRate?: string;
  setAttendanceRate?: (v: string) => void;
  placementStatus?: Student['placementStatus'];
  setPlacementStatus?: (v: Student['placementStatus']) => void;
  offerCount?: string;
  setOfferCount?: (v: string) => void;
  imageUrl?: string;
  setImageUrl?: (v: string) => void;
  formErr: string | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.SyntheticEvent) => void;
}>;

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science',
  'Electronics & Communication',
];

export default function StudentForm({
  isEdit,
  fName,
  setFName,
  lName,
  setLName,
  em,
  setEm,
  enroll,
  setEnroll,
  dob,
  setDob,
  dept,
  setDept,
  sem,
  setSem,
  st,
  setSt,
  cgpa,
  setCgpa,
  phone,
  setPhone,
  githubUrl,
  setGithubUrl,
  linkedinUrl,
  setLinkedinUrl,
  portfolioUrl,
  setPortfolioUrl,
  portfolioTitle,
  setPortfolioTitle,
  portfolioSummary,
  setPortfolioSummary,
  attendanceRate = '100',
  setAttendanceRate,
  placementStatus = 'NOT_STARTED',
  setPlacementStatus,
  offerCount = '0',
  setOfferCount,
  imageUrl = '',
  setImageUrl,
  formErr,
  submitting,
  onCancel,
  onSubmit,
}: StudentFormProps) {
  const fieldCls = "field-surface w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 placeholder:text-slate-400 focus:outline-none transition-colors";
  const selectCls = "field-surface w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-[#101a2a] focus:outline-none transition-colors cursor-pointer";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400";

  // Use a prefix to avoid id collisions when both Add and Edit forms exist
  const idPrefix = isEdit ? 'edit-' : 'add-';

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {formErr && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
          <AlertCircle size={15} className="shrink-0" />
          <p className="font-bold">{formErr}</p>
        </div>
      )}

      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}firstName`} className={labelCls}>First Name *</label>
          <input id={`${idPrefix}firstName`} type="text" required value={fName} onChange={e => setFName(e.target.value)} placeholder="Abhik" className={fieldCls} />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}lastName`} className={labelCls}>Last Name *</label>
          <input id={`${idPrefix}lastName`} type="text" required value={lName} onChange={e => setLName(e.target.value)} placeholder="Mukherjee" className={fieldCls} />
        </div>
      </div>

      {/* Email & Enrollment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}email`} className={labelCls}>Institutional Email *</label>
          <input id={`${idPrefix}email`} type="email" required value={em} onChange={e => setEm(e.target.value)} placeholder="student@university.edu" className={fieldCls} />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}enrollment`} className={labelCls}>Enrollment ID *</label>
          <input id={`${idPrefix}enrollment`} type="text" required value={enroll} onChange={e => setEnroll(e.target.value)} placeholder="CS-2023-0041" className={`${fieldCls} font-mono`} />
        </div>
      </div>

      {/* DOB & GPA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}dob`} className={labelCls}>Date of Birth {!isEdit && '*'}</label>
          <input id={`${idPrefix}dob`} type="date" required={!isEdit} value={dob} onChange={e => setDob(e.target.value)} className={fieldCls} />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}cgpa`} className={labelCls}>CGPA</label>
          <input id={`${idPrefix}cgpa`} type="number" step="0.01" min="0" max="10" value={cgpa} onChange={e => setCgpa(e.target.value)} placeholder="8.5" className={`${fieldCls} font-mono`} />
        </div>
      </div>

      {/* Department & Semester */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor={`${idPrefix}department`} className={labelCls}>Department</label>
          <select id={`${idPrefix}department`} value={dept} onChange={e => setDept(e.target.value)} className={selectCls}>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}semester`} className={labelCls}>Semester</label>
          <select id={`${idPrefix}semester`} value={sem} onChange={e => setSem(e.target.value)} className={selectCls}>
            {Array.from({ length: 8 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>Sem {i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1">
        <span className={labelCls}>Status</span>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {(['ACTIVE', 'SUSPENDED', 'GRADUATED', 'INACTIVE'] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer transition-colors hover:border-vault-accent/40">
              <input type="radio" name={`${idPrefix}status`} value={s} checked={st === s} onChange={() => setSt(s)} className="text-vault-accent focus:ring-vault-accent cursor-pointer accent-vault-accent" />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Performance & Placement metrics (Only on Edit) */}
      {isEdit && (
        <div className="border-t border-slate-200 dark:border-white/5 pt-4 space-y-4 animate-fadeIn">
          <h4 className="text-xs font-black uppercase tracking-wider text-vault-cyan">Academic & Placement Metrics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor={`${idPrefix}attendanceRate`} className={labelCls}>Attendance Rate (%)</label>
              <input id={`${idPrefix}attendanceRate`} type="number" min="0" max="100" value={attendanceRate} onChange={e => setAttendanceRate?.(e.target.value)} placeholder="100" className={fieldCls} />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${idPrefix}placementStatus`} className={labelCls}>Placement Status</label>
              <select id={`${idPrefix}placementStatus`} value={placementStatus} onChange={e => setPlacementStatus?.(e.target.value as any)} className={selectCls}>
                <option value="NOT_STARTED">Not Started</option>
                <option value="PREPARING">Preparing</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="PLACED">Placed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor={`${idPrefix}offerCount`} className={labelCls}>Job Offers Count</label>
              <input id={`${idPrefix}offerCount`} type="number" min="0" value={offerCount} onChange={e => setOfferCount?.(e.target.value)} placeholder="0" className={fieldCls} />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}imageUrl`} className={labelCls}>Avatar Image URL</label>
            <input id={`${idPrefix}imageUrl`} type="url" value={imageUrl} onChange={e => setImageUrl?.(e.target.value)} placeholder="https://images.unsplash.com/..." className={fieldCls} />
          </div>
        </div>
      )}

      {/* Contact, Socials & Portfolio (Optional) */}
      <div className="border-t border-slate-200 dark:border-white/5 pt-4 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-vault-cyan">Contact & Portfolio (Optional)</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}phone`} className={labelCls}>Phone Number</label>
            <input id={`${idPrefix}phone`} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={fieldCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}portfolioTitle`} className={labelCls}>Portfolio Heading</label>
            <input id={`${idPrefix}portfolioTitle`} type="text" value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} placeholder="e.g. Lead Systems Engineer Portfolio" className={fieldCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}githubUrl`} className={labelCls}>GitHub URL</label>
            <input id={`${idPrefix}githubUrl`} type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className={fieldCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}linkedinUrl`} className={labelCls}>LinkedIn URL</label>
            <input id={`${idPrefix}linkedinUrl`} type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className={fieldCls} />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}portfolioUrl`} className={labelCls}>Portfolio URL</label>
            <input id={`${idPrefix}portfolioUrl`} type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://..." className={fieldCls} />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor={`${idPrefix}portfolioSummary`} className={labelCls}>Portfolio Summary</label>
          <textarea id={`${idPrefix}portfolioSummary`} rows={2} value={portfolioSummary} onChange={e => setPortfolioSummary(e.target.value)} placeholder="Brief summary of professional experience..." className={`${fieldCls} resize-none`} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-vault-accent to-vault-cyan text-white rounded-xl text-xs font-bold shadow-md shadow-vault-accent/15 cursor-pointer flex items-center gap-1.5 hover:opacity-95 transition-opacity disabled:opacity-60">
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEdit ? 'Save Changes' : 'Register Student'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
