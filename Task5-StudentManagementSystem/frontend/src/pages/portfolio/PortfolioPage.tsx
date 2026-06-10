import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Globe, 
  Download, 
  Play, 
  Check, 
  CheckCircle2, 
  GitBranch,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ArrowLeft,
  ExternalLink,
  Award,
  FileText
} from 'lucide-react'
import { usePortfolios } from '../../hooks/usePortfolios'
import { useStudents } from '../../hooks/useStudents'
import { useAuthContext } from '../../context/AuthContext'
import type { Portfolio, ProjectItem, AchievementItem, CertificateItem } from '../../types/portfolio'

// Define the 5 Premium Themes Styling
const getThemeClass = (theme: string) => {
  const t = theme.toLowerCase()
  switch (t) {
    case 'nexus dark': 
      return {
        bg: 'bg-[#080d19] text-emerald-400 border-emerald-500/20 font-mono',
        card: 'bg-emerald-950/20 border-emerald-500/20 text-slate-355',
        pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        textAccent: 'text-emerald-400',
        button: 'bg-emerald-500 hover:bg-emerald-600 text-[#080d19]',
        avatar: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        title: 'text-emerald-400 font-mono font-black uppercase'
      }
    case 'aurora glass':
      return {
        bg: 'bg-gradient-to-br from-[#120c1f] via-[#1a0e35] to-[#120c1f] text-violet-300 border-violet-500/20 font-sans',
        card: 'backdrop-blur-md bg-white/5 border border-white/10 text-violet-200/90 shadow-lg shadow-violet-950/25',
        pill: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
        textAccent: 'text-pink-400',
        button: 'bg-gradient-to-r from-violet-555 to-pink-500 text-white',
        avatar: 'border-violet-500/30 text-violet-300 bg-violet-500/10',
        title: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300 font-extrabold'
      }
    case 'quantum blue':
      return {
        bg: 'bg-[#09111e] text-cyan-400 border-cyan-500/20 font-sans',
        card: 'bg-cyan-950/15 border border-cyan-500/20 text-slate-300',
        pill: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
        textAccent: 'text-cyan-400',
        button: 'bg-cyan-500 text-black hover:bg-cyan-600',
        avatar: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
        title: 'text-cyan-300 font-black'
      }
    case 'minimal elite':
      return {
        bg: 'bg-white text-stone-900 border-stone-300 font-serif',
        card: 'bg-stone-50 border border-stone-200 text-stone-750 shadow-sm',
        pill: 'bg-stone-100 text-stone-850 border border-stone-300 font-sans',
        textAccent: 'text-stone-900 font-bold',
        button: 'bg-stone-900 text-white hover:bg-stone-800 font-sans',
        avatar: 'border-stone-300 text-stone-700 bg-stone-100',
        title: 'text-stone-900 font-serif italic font-extrabold'
      }
    case 'creative pulse':
      return {
        bg: 'bg-[#0c050f] text-orange-400 border-orange-500/20 font-sans',
        card: 'bg-orange-500/5 border border-orange-555/15 text-orange-200',
        pill: 'bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono',
        textAccent: 'text-orange-400',
        button: 'bg-orange-500 text-black font-extrabold hover:bg-orange-600',
        avatar: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
        title: 'text-orange-400 font-black tracking-wide'
      }
    default:
      return {
        bg: 'bg-[#080d19] text-emerald-400 border-emerald-500/20 font-mono',
        card: 'bg-emerald-950/20 border-emerald-500/20 text-slate-355',
        pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        textAccent: 'text-emerald-400',
        button: 'bg-emerald-500 text-[#080d19]',
        avatar: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        title: 'text-emerald-400 font-mono font-black uppercase'
      }
  }
}

const getGalleryBrowserClass = (theme: string) => {
  const t = theme.toLowerCase()
  switch (t) {
    case 'nexus dark':
      return 'bg-[#0b1329] border-emerald-500/20 text-emerald-400 font-mono'
    case 'aurora glass':
      return 'bg-[#1b1130] border-violet-500/20 text-violet-300'
    case 'quantum blue':
      return 'bg-[#0a182b] border-cyan-500/20 text-cyan-400'
    case 'minimal elite':
      return 'bg-stone-50 border-stone-300 text-stone-900 font-serif'
    default:
      return 'bg-[#1a0c16] border-orange-555/20 text-orange-400'
  }
}

const getGalleryPillClass = (theme: string) => {
  const t = theme.toLowerCase()
  if (t === 'nexus dark') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  if (t === 'aurora glass') return 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
  if (t === 'quantum blue') return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
  if (t === 'minimal elite') return 'bg-stone-100 text-stone-750 border border-stone-250'
  if (t === 'creative pulse') return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
  return 'bg-slate-100 dark:bg-white/10 text-slate-500'
}

// Sub-Component: Live Compiler Preview Panel
interface PreviewProps {
  formTheme: string;
  formStudentId: string | number;
  formTitle: string;
  formSummary: string;
  formSkills: string[];
  formProjects: ProjectItem[];
  formAchievements: AchievementItem[];
  formCertificates: CertificateItem[];
  formGithubUrl?: string;
  formLinkedinUrl?: string;
  formPortfolioName: string;
  formTemplateType: string;
  studentNameResolver: (sId: string | number) => string;
  formAbout?: string;
  formEmail?: string;
  formPhone?: string;
  formSocialLinks?: Record<string, string>;
}

const LivePreviewPanel: React.FC<PreviewProps> = ({
  formTheme,
  formStudentId,
  formTitle,
  formSummary,
  formSkills,
  formProjects,
  formAchievements,
  formCertificates,
  formGithubUrl,
  formLinkedinUrl,
  formPortfolioName,
  formTemplateType,
  studentNameResolver,
  formAbout,
  formEmail,
  formPhone,
  formSocialLinks
}) => {
  const currentPreviewTheme = getThemeClass(formTheme)

  return (
    <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4 flex flex-col h-full justify-between">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        <span>Live Compiler Preview ({formTheme})</span>
      </h3>

      <div className="flex-1 w-full border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg flex flex-col min-h-[440px] bg-[#070b14]/90">
        
        {/* Browser control bar */}
        <div className="h-9 border-b border-slate-150 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-3.5 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <div className="h-5 flex-1 max-w-[250px] rounded bg-slate-200/50 dark:bg-white/5 flex items-center px-2">
            <Globe size={9} className="text-slate-400 shrink-0" />
            <span className="text-[7.5px] text-slate-400 truncate ml-1 font-mono">
              http://localhost:3000/portfolios/{formPortfolioName.toLowerCase().replace(/\s+/g, '-')}
            </span>
          </div>
        </div>

        {/* Dynamic Theme Render Window */}
        <div className={`flex-1 p-5 relative overflow-y-auto flex flex-col justify-between text-left transition-colors duration-300 text-[10px] leading-relaxed ${currentPreviewTheme.bg}`}>
          <div className="space-y-4">
            
            {/* HERO & PROFILE */}
            <div className="pb-3 border-b border-slate-200/20 dark:border-white/5 flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <h4 className={`text-base leading-tight ${currentPreviewTheme.title}`}>
                  {studentNameResolver(formStudentId)}
                </h4>
                <p className="text-[9.5px] opacity-90 font-extrabold uppercase tracking-wide">
                  {formTitle || 'Professional Title Layout'}
                </p>
                <span className={`text-[7.5px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${currentPreviewTheme.pill}`}>
                  {formTemplateType} Template
                </span>
              </div>
              <div className={`h-10 w-10 rounded-full border flex items-center justify-center font-black text-sm shrink-0 ${currentPreviewTheme.avatar}`}>
                {studentNameResolver(formStudentId)[0] || 'U'}
              </div>
            </div>

            {/* SUMMARY SECTION */}
            {formSummary && (
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-50 block">About Me</span>
                <p className="opacity-80 leading-normal font-medium">{formSummary}</p>
              </div>
            )}

            {/* DETAILED BIO SECTION */}
            {formAbout && (
              <div className="space-y-1 pt-1 border-t border-slate-200/10 dark:border-white/5">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-50 block">Detailed Biography</span>
                <p className="opacity-85 leading-normal font-medium whitespace-pre-line">{formAbout}</p>
              </div>
            )}

            {/* SKILLS SECTION */}
            {formSkills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-50 block">Core Competencies</span>
                <div className="flex flex-wrap gap-1">
                  {formSkills.map((sk) => (
                    <span key={sk} className={`text-[8px] font-black px-1.5 py-0.2 rounded ${currentPreviewTheme.pill}`}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS SECTION */}
            {formProjects.length > 0 && (
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-50 block">Featured Project Works</span>
                <div className="space-y-1.5">
                  {formProjects.map((p, idx) => (
                    <div key={`${p.title}-${idx}`} className={`p-2.5 rounded-xl ${currentPreviewTheme.card}`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-[10px] font-black flex items-center gap-1.5">
                          <GitBranch size={9} className="text-vault-cyan" />
                          <span>{p.title}</span>
                        </span>
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noreferrer" className="text-[8px] text-vault-cyan hover:underline flex items-center gap-0.5">
                            <span>Repo</span>
                            <ExternalLink size={7} />
                          </a>
                        )}
                      </div>
                      <p className="text-[8.5px] opacity-75 mt-0.5 leading-normal">{p.description}</p>
                      {p.technologies && (
                        <p className="text-[7.5px] text-slate-400 font-mono mt-1">Stack: {p.technologies}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HONORS & CERTS */}
            {(formAchievements.length > 0 || formCertificates.length > 0) && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/20 dark:border-white/5">
                {/* Achievements preview */}
                {formAchievements.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[7.5px] font-black uppercase tracking-widest opacity-50 block">Honors</span>
                    <div className="space-y-1">
                      {formAchievements.map((ach, idx) => (
                        <div key={`${ach.title}-${idx}`} className="text-[8px]">
                          <p className="font-extrabold flex items-center gap-1 text-slate-200">
                            <Award size={8} className="text-amber-400" />
                            <span>{ach.title}</span>
                          </p>
                          <p className="opacity-60">{ach.issuer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificates preview */}
                {formCertificates.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[7.5px] font-black uppercase tracking-widest opacity-50 block">Certs</span>
                    <div className="space-y-1">
                      {formCertificates.map((c, idx) => (
                        <div key={`${c.name}-${idx}`} className="text-[8px]">
                          <p className="font-extrabold flex items-center gap-1 text-slate-200">
                            <FileText size={8} className="text-vault-cyan" />
                            <span>{c.name}</span>
                          </p>
                          <p className="opacity-60">{c.issuingOrganization}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONTACT & SOCIAL FOOTER */}
            {(formEmail || formPhone || formGithubUrl || formLinkedinUrl || Object.keys(formSocialLinks || {}).length > 0) && (
              <div className="pt-3 border-t border-slate-200/20 dark:border-white/5 space-y-2 text-[8px] opacity-80 font-bold">
                {(formEmail || formPhone) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 opacity-70">
                    {formEmail && <span>Email: {formEmail}</span>}
                    {formPhone && <span>Phone: {formPhone}</span>}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-0.5">
                    <CheckCircle2 size={9} className={currentPreviewTheme.textAccent} />
                    <span>EduVault Verified</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {formGithubUrl && (
                      <a href={formGithubUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
                        <span>GitHub</span>
                        <ExternalLink size={7} />
                      </a>
                    )}
                    {formLinkedinUrl && (
                      <a href={formLinkedinUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
                        <span>LinkedIn</span>
                        <ExternalLink size={7} />
                      </a>
                    )}
                    {formSocialLinks?.website && (
                      <a href={formSocialLinks.website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
                        <span>Website</span>
                        <ExternalLink size={7} />
                      </a>
                    )}
                    {formSocialLinks?.twitter && (
                      <a href={formSocialLinks.twitter} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
                        <span>Twitter</span>
                        <ExternalLink size={7} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

export default function PortfolioPage() {
  const { user } = useAuthContext()
  const { portfolios, loading: loadingPortfolios, error: portfoliosError, currentStudentId, addPortfolio, updatePortfolio, deletePortfolio, duplicatePortfolio } = usePortfolios()
  const { students } = useStudents()

  // App States
  const [editorMode, setEditorMode] = useState<boolean>(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  
  // Editor Form Fields
  const [formStudentId, setFormStudentId] = useState<string | number>(0)
  const [formPortfolioName, setFormPortfolioName] = useState<string>('')
  const [formTemplateType, setFormTemplateType] = useState<string>('Developer')
  const [formTheme, setFormTheme] = useState<string>('Nexus Dark')
  const [formTitle, setFormTitle] = useState<string>('')
  const [formSummary, setFormSummary] = useState<string>('')
  const [formStatus, setFormStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [formGithubUrl, setFormGithubUrl] = useState<string>('')
  const [formLinkedinUrl, setFormLinkedinUrl] = useState<string>('')
  
  // New visual portfolio info fields
  const [formAbout, setFormAbout] = useState<string>('')
  const [formEmail, setFormEmail] = useState<string>('')
  const [formPhone, setFormPhone] = useState<string>('')
  const [formSocialLinks, setFormSocialLinks] = useState<Record<string, string>>({})

  // Rich Sub-Lists
  const [formSkills, setFormSkills] = useState<string[]>([])
  const [formProjects, setFormProjects] = useState<ProjectItem[]>([])
  const [formAchievements, setFormAchievements] = useState<AchievementItem[]>([])
  const [formCertificates, setFormCertificates] = useState<CertificateItem[]>([])

  // Editor Sub-Lists Modals/Fields states
  const [skillInput, setSkillInput] = useState<string>('')
  
  // Project input fields
  const [projTitle, setProjTitle] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projLink, setProjLink] = useState('')
  const [projTech, setProjTech] = useState('')
  const [projRole, setProjRole] = useState('')

  // Achievement input fields
  const [achTitle, setAchTitle] = useState('')
  const [achIssuer, setAchIssuer] = useState('')
  const [achDate, setAchDate] = useState('')
  const [achDesc, setAchDesc] = useState('')

  // Certificate input fields
  const [certName, setCertName] = useState('')
  const [certIssuer, setCertIssuer] = useState('')
  const [certDate, setCertDate] = useState('')
  const [certUrl, setCertUrl] = useState('')

  // UI state
  const [editorTab, setEditorTab] = useState<'basic' | 'skills_projects' | 'ach_certs'>('basic')
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Delete confirm modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [targetDeleteId, setTargetDeleteId] = useState<string | number | null>(null)

  // Unsaved changes confirm modal states
  const [unsavedChangesConfirmOpen, setUnsavedChangesConfirmOpen] = useState(false)

  // Auto load logged in student context
  useEffect(() => {
    if (currentStudentId) {
      setFormStudentId(currentStudentId)
    } else if (students.length > 0 && !formStudentId) {
      setFormStudentId(students[0].id)
    }
  }, [currentStudentId, students, formStudentId])

  // Map studentId to Name for presentation
  const getStudentName = useCallback((sId: string | number) => {
    const found = students.find(s => String(s.id) === String(sId))
    return found ? `${found.firstName} ${found.lastName}` : `Student ID: ${sId}`
  }, [students])

  const hasUnsavedChanges = useCallback(() => {
    if (!editorMode) return false;
    
    const initial = selectedPortfolio || {
      portfolioName: 'New Portfolio Layout',
      templateType: 'Developer',
      theme: 'Nexus Dark',
      title: 'Full-Stack Software Engineering Showcase',
      summary: 'Dedicated developer focused on high-performance cloud applications, Java APIs, and interactive React user interfaces.',
      portfolioStatus: 'DRAFT',
      githubUrl: 'https://github.com/subject',
      linkedinUrl: 'https://linkedin.com/in/subject',
      skills: ['React', 'TypeScript', 'Spring Boot', 'REST APIs', 'PostgreSQL', 'Docker'],
      projects: [
        { title: 'EduVault Command Center', description: 'Advanced academic control deck utilizing JPA database transactions.', link: 'https://github.com/repo1', technologies: 'React, Spring Boot, Postgres', role: 'Lead Architect' },
        { title: 'Predictive Diagnostic Model', description: 'Convolutional classification system predicting cohort risks.', link: 'https://github.com/repo2', technologies: 'Python, TensorFlow', role: 'ML Engineer' }
      ],
      achievements: [
        { title: 'Dean\'s Honor List 2025', issuer: 'School of Computing', date: '2025-06', description: 'Maintained continuous CGPA average of 9.25' }
      ],
      certificates: [
        { name: 'Certified Spring Developer', issuingOrganization: 'Pivotal / VMware', issueDate: '2025-09', credentialUrl: 'https://certs.com/123' }
      ],
      about: 'Experienced developer specializing in frontend and backend system engineering. Enthusiastic about creating beautiful user interfaces and robust APIs.',
      email: 'student.showcase@eduvault.edu',
      phone: '+1 (555) 019-2834',
      socialLinks: {
        github: 'https://github.com/subject',
        linkedin: 'https://linkedin.com/in/subject',
        twitter: 'https://twitter.com/subject',
        portfolio: 'https://portfolio.subject.com'
      }
    };

    return (
      formPortfolioName !== (initial.portfolioName || '') ||
      formTemplateType !== (initial.templateType || 'Developer') ||
      formTheme !== (initial.theme || 'Nexus Dark') ||
      formTitle !== (initial.title || '') ||
      formSummary !== (initial.summary || '') ||
      formStatus !== (initial.portfolioStatus || 'DRAFT') ||
      formGithubUrl !== (initial.githubUrl || '') ||
      formLinkedinUrl !== (initial.linkedinUrl || '') ||
      formAbout !== (initial.about || '') ||
      formEmail !== (initial.email || '') ||
      formPhone !== (initial.phone || '') ||
      JSON.stringify(formSkills) !== JSON.stringify(initial.skills || []) ||
      JSON.stringify(formProjects) !== JSON.stringify(initial.projects || []) ||
      JSON.stringify(formAchievements) !== JSON.stringify(initial.achievements || []) ||
      JSON.stringify(formCertificates) !== JSON.stringify(initial.certificates || []) ||
      JSON.stringify(formSocialLinks) !== JSON.stringify(initial.socialLinks || {})
    );
  }, [
    editorMode, selectedPortfolio, formPortfolioName, formTemplateType, formTheme,
    formTitle, formSummary, formStatus, formGithubUrl, formLinkedinUrl,
    formAbout, formEmail, formPhone, formSkills, formProjects,
    formAchievements, formCertificates, formSocialLinks
  ]);

  const handleOpenCreate = () => {
    setSelectedPortfolio(null)
    setFormPortfolioName('New Portfolio Layout')
    setFormTemplateType('Developer')
    setFormTheme('Nexus Dark')
    setFormTitle('Full-Stack Software Engineering Showcase')
    setFormSummary('Dedicated developer focused on high-performance cloud applications, Java APIs, and interactive React user interfaces.')
    setFormStatus('DRAFT')
    setFormGithubUrl('https://github.com/subject')
    setFormLinkedinUrl('https://linkedin.com/in/subject')
    setFormSkills(['React', 'TypeScript', 'Spring Boot', 'REST APIs', 'PostgreSQL', 'Docker'])
    setFormProjects([
      { title: 'EduVault Command Center', description: 'Advanced academic control deck utilizing JPA database transactions.', link: 'https://github.com/repo1', technologies: 'React, Spring Boot, Postgres', role: 'Lead Architect' },
      { title: 'Predictive Diagnostic Model', description: 'Convolutional classification system predicting cohort risks.', link: 'https://github.com/repo2', technologies: 'Python, TensorFlow', role: 'ML Engineer' }
    ])
    setFormAchievements([
      { title: 'Dean\'s Honor List 2025', issuer: 'School of Computing', date: '2025-06', description: 'Maintained continuous CGPA average of 9.25' }
    ])
    setFormCertificates([
      { name: 'Certified Spring Developer', issuingOrganization: 'Pivotal / VMware', issueDate: '2025-09', credentialUrl: 'https://certs.com/123' }
    ])
    setFormAbout('Experienced developer specializing in frontend and backend system engineering. Enthusiastic about creating beautiful user interfaces and robust APIs.')
    setFormEmail('student.showcase@eduvault.edu')
    setFormPhone('+1 (555) 019-2834')
    setFormSocialLinks({
      github: 'https://github.com/subject',
      linkedin: 'https://linkedin.com/in/subject',
      twitter: 'https://twitter.com/subject',
      portfolio: 'https://portfolio.subject.com'
    })
    if (currentStudentId) {
      setFormStudentId(currentStudentId)
    } else if (students.length > 0) {
      setFormStudentId(students[0].id)
    }
    setEditorTab('basic')
    setEditorMode(true)
  }

  const handleOpenEdit = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setFormStudentId(portfolio.studentId)
    setFormPortfolioName(portfolio.portfolioName)
    setFormTemplateType(portfolio.templateType)
    setFormTheme(portfolio.theme)
    setFormTitle(portfolio.title)
    setFormSummary(portfolio.summary)
    setFormStatus(portfolio.portfolioStatus)
    setFormGithubUrl(portfolio.githubUrl || '')
    setFormLinkedinUrl(portfolio.linkedinUrl || '')
    setFormSkills(portfolio.skills)
    setFormProjects(portfolio.projects)
    setFormAchievements(portfolio.achievements)
    setFormCertificates(portfolio.certificates)
    setFormAbout(portfolio.about || '')
    setFormEmail(portfolio.email || '')
    setFormPhone(portfolio.phone || '')
    setFormSocialLinks(portfolio.socialLinks || {})
    setEditorTab('basic')
    setEditorMode(true)
  }

  const handleSavePortfolio = async () => {
    if (!formPortfolioName.trim() || !formTitle.trim()) {
      alert('Portfolio name and title are required.')
      return
    }
    setSaving(true)
    const payload: Omit<Portfolio, 'id'> = {
      studentId: formStudentId,
      portfolioName: formPortfolioName,
      templateType: formTemplateType,
      theme: formTheme,
      title: formTitle,
      summary: formSummary,
      skills: formSkills,
      projects: formProjects,
      achievements: formAchievements,
      certificates: formCertificates,
      githubUrl: formGithubUrl,
      linkedinUrl: formLinkedinUrl,
      portfolioStatus: formStatus,
      about: formAbout,
      email: formEmail,
      phone: formPhone,
      socialLinks: formSocialLinks
    }

    try {
      if (selectedPortfolio?.id) {
        await updatePortfolio(selectedPortfolio.id, payload)
        triggerToast('Portfolio saved successfully!')
      } else {
        await addPortfolio(payload)
        triggerToast('New portfolio compiled and created!')
      }
      setEditorMode(false)
    } catch (err) {
      console.error('Error saving portfolio record:', err)
      alert('Error saving portfolio record. Reference developer logs.')
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicate = async (pId: string | number) => {
    try {
      await duplicatePortfolio(pId)
      triggerToast('Portfolio cloned successfully!')
    } catch (err) {
      console.error('Error duplicating portfolio:', err)
      alert('Duplication failed.')
    }
  }

  const handleDelete = (pId: string | number) => {
    setTargetDeleteId(pId)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return
    try {
      await deletePortfolio(targetDeleteId)
      triggerToast('Portfolio record deleted.')
    } catch (err) {
      console.error('Error deleting portfolio:', err)
      alert('Deletion failed.')
    } finally {
      setDeleteConfirmOpen(false)
      setTargetDeleteId(null)
    }
  }

  const handleExitEditor = () => {
    if (hasUnsavedChanges()) {
      setUnsavedChangesConfirmOpen(true)
    } else {
      setEditorMode(false)
    }
  }

  const handleConfirmDiscard = () => {
    setUnsavedChangesConfirmOpen(false)
    setEditorMode(false)
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  // Visual helper prompts for out-of-scope tasks
  const triggerComingSoon = (featureName: string) => {
    alert(`COMING SOON: ${featureName}\nEduVault is prepared to generate fully compiled static assets (ZIP, HTML deployment) in the next sprint phase.`)
  }

  // Skills input handlers
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!formSkills.includes(skillInput.trim())) {
        setFormSkills([...formSkills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormSkills(formSkills.filter(s => s !== skill))
  }

  // Project handlers
  const handleAddProject = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!projTitle.trim()) return
    const newProj: ProjectItem = {
      title: projTitle,
      description: projDesc,
      link: projLink || undefined,
      technologies: projTech || undefined,
      role: projRole || undefined
    }
    setFormProjects([...formProjects, newProj])
    setProjTitle(''); setProjDesc(''); setProjLink(''); setProjTech(''); setProjRole('')
  }

  const handleRemoveProject = (index: number) => {
    setFormProjects(formProjects.filter((_, i) => i !== index))
  }

  // Achievement handlers
  const handleAddAchievement = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!achTitle.trim()) return
    const newAch: AchievementItem = {
      title: achTitle,
      issuer: achIssuer || undefined,
      date: achDate || undefined,
      description: achDesc || undefined
    }
    setFormAchievements([...formAchievements, newAch])
    setAchTitle(''); setAchIssuer(''); setAchDate(''); setAchDesc('')
  }

  const handleRemoveAchievement = (index: number) => {
    setFormAchievements(formAchievements.filter((_, i) => i !== index))
  }

  // Certificate handlers
  const handleAddCertificate = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!certName.trim()) return
    const newCert: CertificateItem = {
      name: certName,
      issuingOrganization: certIssuer || undefined,
      issueDate: certDate || undefined,
      credentialUrl: certUrl || undefined
    }
    setFormCertificates([...formCertificates, newCert])
    setCertName(''); setCertIssuer(''); setCertDate(''); setCertUrl('')
  }

  const handleRemoveCertificate = (index: number) => {
    setFormCertificates(formCertificates.filter((_, i) => i !== index))
  }

  // Extracted Gallery view renderer
  const renderGalleryContent = () => {
    if (loadingPortfolios && portfolios.length === 0) {
      return (
        <div className="vault-glass p-12 text-center rounded-2xl border border-vault-border flex flex-col items-center justify-center space-y-3">
          <div className="h-6 w-6 border-2 border-vault-cyan/30 border-t-vault-cyan rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Loading verifiable portfolio registries from Firestore...</p>
        </div>
      )
    }

    if (portfolios.length === 0) {
      return (
        <div className="vault-glass p-12 text-center rounded-2xl border border-vault-border space-y-3">
          <p className="text-xs text-slate-400 font-semibold">No portfolios created for this student registry yet.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-vault-accent text-white rounded-lg text-xs font-bold hover:bg-vault-accent/90"
          >
            Create First Portfolio
          </button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolios.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -3 }}
            className="vault-glass rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-hidden flex flex-col justify-between shadow-sm hover:border-vault-cyan/35 transition-all duration-300 relative group p-4"
          >
            {/* Browser Top Bar Preview */}
            <div className={`w-full h-20 rounded-lg border flex flex-col overflow-hidden mb-3 relative ${getGalleryBrowserClass(item.theme)}`}>
              <div className="h-4 border-b border-slate-200/30 dark:border-white/5 bg-slate-50/20 dark:bg-white/5 px-2 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400/80" />
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/80" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 p-2 flex flex-col justify-between text-left">
                <div>
                  <h5 className="text-[10px] font-black tracking-tight leading-none truncate">{item.portfolioName}</h5>
                  <span className="text-[7px] px-1 py-0.2 bg-slate-200/30 dark:bg-white/5 rounded font-semibold uppercase mt-1 inline-block">
                    {item.templateType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[6.5px] opacity-60">
                  <span>EduVault AI Verified</span>
                  <span className="text-[6px] tracking-widest">{item.portfolioStatus}</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-left px-0.5">
              <div className="flex justify-between items-start">
                <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[170px]" title={item.portfolioName}>
                  {item.portfolioName}
                </p>
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  item.portfolioStatus === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.portfolioStatus}
                </span>
              </div>

              <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold truncate">
                Owner: <span className="text-vault-fg font-black">{getStudentName(item.studentId)}</span>
              </p>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase">{item.templateType}</span>
                <span className={`text-[8.5px] font-black px-2 py-0.2 rounded font-mono uppercase ${getGalleryPillClass(item.theme)}`}>
                  {item.theme}
                </span>
              </div>

              <div className="flex justify-between items-center text-[8.5px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                {item.createdAt && (
                  <span>Created: {new Date(item.createdAt).toISOString().split('T')[0]}</span>
                )}
                {item.updatedAt && (
                  <span>Updated: {new Date(item.updatedAt).toISOString().split('T')[0]}</span>
                )}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-4 gap-1.5 mt-4">
              <button
                onClick={() => handleOpenEdit(item)}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-355 rounded-xl font-extrabold text-[10px] cursor-pointer transition-colors"
              >
                <Edit3 size={11} className="text-vault-cyan" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={() => handleDuplicate(item.id!)}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-355 rounded-xl font-extrabold text-[10px] cursor-pointer transition-colors"
              >
                <Copy size={11} className="text-vault-accent" />
                <span>Copy</span>
              </button>

              <button
                onClick={() => triggerComingSoon('ZIP Download Bundle')}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-355 rounded-xl font-extrabold text-[10px] cursor-pointer transition-colors"
              >
                <Download size={11} className="text-slate-455" />
                <span>ZIP</span>
              </button>

              <button
                onClick={() => handleDelete(item.id!)}
                className="flex items-center justify-center gap-1.5 py-2 bg-vault-destructive/10 border border-vault-destructive/20 hover:bg-vault-destructive/15 text-vault-destructive rounded-xl font-extrabold text-[10px] cursor-pointer transition-colors"
              >
                <Trash2 size={11} />
                <span>Del</span>
              </button>
            </div>

            {/* Static Deploy overlay */}
            <div className="mt-2 border-t border-slate-200/50 dark:border-white/5 pt-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-555 font-semibold">Web Deployment</span>
              <button
                onClick={() => triggerComingSoon('Public Server Deployment')}
                className="text-[9px] font-black text-vault-cyan flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>Deploy Package</span>
                <Play size={8} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Extracted Editor tab contents
  const renderEditorContent = () => {
    switch (editorTab) {
      case 'skills_projects':
        return (
          <div className="space-y-4 pt-2">
            {/* Skills entry */}
            <div className="space-y-2">
              <label htmlFor="skills-entry-input" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Skills Tags (Press Enter to Add)</label>
              <input
                id="skills-entry-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Add a skill e.g. Docker..."
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formSkills.map((sk) => (
                  <span key={sk} className="text-[10px] font-bold px-2 py-0.8 bg-vault-border border border-vault-border rounded-lg text-slate-305 flex items-center gap-1">
                    <span>{sk}</span>
                    <button type="button" onClick={() => handleRemoveSkill(sk)} className="text-red-400 hover:text-red-500 font-extrabold cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Projects list */}
            <div className="space-y-3 border-t border-slate-200/50 dark:border-white/5 pt-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-vault-cyan">Project History</h4>
              
              {/* Projects Nested form */}
              <form onSubmit={handleAddProject} className="p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2 text-left">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">New Project</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                  <input
                    type="text"
                    placeholder="Role e.g. Lead"
                    value={projRole}
                    onChange={(e) => setProjRole(e.target.value)}
                    className="text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                </div>
                <textarea
                  placeholder="Project Description"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={2}
                  className="w-full text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Technologies"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    className="text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                  <input
                    type="url"
                    placeholder="Link e.g. GitHub URL"
                    value={projLink}
                    onChange={(e) => setProjLink(e.target.value)}
                    className="text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-vault-cyan hover:bg-vault-cyan/90 text-[#070b14] font-black text-[9px] rounded uppercase cursor-pointer"
                  >
                    Add Project
                  </button>
                </div>
              </form>

              {/* Display current projects */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {formProjects.map((p, idx) => (
                  <div key={`${p.title}-${idx}`} className="flex justify-between items-start p-2 rounded bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px]">
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <GitBranch size={10} className="text-vault-cyan" />
                        <span>{p.title}</span>
                        {p.role && <span className="opacity-50 text-[9px]">({p.role})</span>}
                      </p>
                      <p className="opacity-75 leading-tight mt-0.5">{p.description}</p>
                      {p.technologies && <p className="text-[8.5px] text-vault-cyan font-semibold mt-1">Tech: {p.technologies}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="text-red-400 hover:text-red-500 font-extrabold shrink-0 ml-2 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )
      case 'ach_certs':
        return (
          <div className="space-y-4 pt-2">
            {/* Honors & Achievements */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-vault-cyan">Achievements & Honors</h4>
              
              {/* Nested Achievement Form */}
              <div className="p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2 text-left">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Title e.g. Academic Award"
                    value={achTitle}
                    onChange={(e) => setAchTitle(e.target.value)}
                    className="col-span-2 text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                  <input
                    type="text"
                    placeholder="Date e.g. 2025-06"
                    value={achDate}
                    onChange={(e) => setAchDate(e.target.value)}
                    className="text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Issuer Organization"
                    value={achIssuer}
                    onChange={(e) => setAchIssuer(e.target.value)}
                    className="col-span-2 text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="bg-vault-cyan hover:bg-vault-cyan/90 text-[#070b14] font-black text-[9px] rounded uppercase cursor-pointer"
                  >
                    Add Honor
                  </button>
                </div>
                <input
                  placeholder="Brief Description"
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  className="w-full text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                />
              </div>

              {/* Display current achievements */}
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                {formAchievements.map((ach, idx) => (
                  <div key={`${ach.title}-${idx}`} className="flex justify-between items-center p-2 rounded bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px]">
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Award size={10} className="text-vault-accent" />
                        <span>{ach.title}</span>
                        {ach.date && <span className="opacity-55 font-mono">({ach.date})</span>}
                      </p>
                      {ach.issuer && <p className="text-[9px] text-slate-400">Issuer: {ach.issuer}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(idx)}
                      className="text-red-400 hover:text-red-500 font-extrabold shrink-0 ml-2 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-3 border-t border-slate-200/50 dark:border-white/5 pt-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-vault-cyan">Certifications & Credentials</h4>
              
              {/* Nested Cert Form */}
              <div className="p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2 text-left">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Cert Name e.g. AWS Pract."
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    className="col-span-2 text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                  <input
                    type="text"
                    placeholder="Issue Date"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Issuing Authority"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    className="col-span-2 text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                  />
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    className="bg-vault-cyan hover:bg-vault-cyan/90 text-[#070b14] font-black text-[9px] rounded uppercase cursor-pointer"
                  >
                    Add Cert
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="Credential Verification URL"
                  value={certUrl}
                  onChange={(e) => setCertUrl(e.target.value)}
                  className="w-full text-[10.5px] px-2.5 py-1.5 rounded border border-slate-250 dark:border-white/5 bg-slate-900/40 text-white focus:outline-none focus:border-vault-cyan"
                />
              </div>

              {/* Display current certs */}
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                {formCertificates.map((cert, idx) => (
                  <div key={`${cert.name}-${idx}`} className="flex justify-between items-center p-2 rounded bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[10px]">
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <FileText size={10} className="text-vault-cyan" />
                        <span>{cert.name}</span>
                      </p>
                      {cert.issuingOrganization && <p className="text-[9px] text-slate-400">{cert.issuingOrganization} | {cert.issueDate}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(idx)}
                      className="text-red-400 hover:text-red-500 font-extrabold shrink-0 ml-2 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-3 pt-2">
            {/* Student Target Selector */}
            {user?.role === 'STUDENT' ? (
              <div className="p-3.5 bg-vault-border rounded-xl border border-vault-border text-xs text-slate-455">
                Locked Subject target: <span className="text-vault-fg font-black">{getStudentName(formStudentId)}</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="student-selector" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Subject Student</label>
                <select
                  id="student-selector"
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-vault-cyan"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-slate-900">
                      {s.firstName} {s.lastName} ({s.enrollmentNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="portfolio-name-field" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Portfolio Layout Name</label>
                <input
                  id="portfolio-name-field"
                  type="text"
                  value={formPortfolioName}
                  onChange={(e) => setFormPortfolioName(e.target.value)}
                  placeholder="e.g. Senior Layout"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="portfolio-title-field" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Professional Title</label>
                <input
                  id="portfolio-title-field"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. AI Research Scholar"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>
            </div>

            {/* Visual Theme Gallery Selector */}
            <div className="space-y-2">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Visual Theme Gallery</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { name: 'Nexus Dark', desc: 'Dark / Emerald console', style: 'bg-[#080d19] border-emerald-500/25 text-emerald-450 font-mono' },
                  { name: 'Aurora Glass', desc: 'Violet / Translucent', style: 'bg-gradient-to-br from-[#120c1f] to-[#1a0e35] border-violet-500/25 text-violet-300' },
                  { name: 'Quantum Blue', desc: 'Cyber / High-contrast', style: 'bg-[#09111e] border-cyan-500/25 text-cyan-400' },
                  { name: 'Minimal Elite', desc: 'Serif print / Clean white', style: 'bg-white border-stone-300 text-stone-900 shadow-sm font-serif' },
                  { name: 'Creative Pulse', desc: 'Vibrant neon / Orange', style: 'bg-[#0c050f] border-orange-555/25 text-orange-400' }
                ].map((themeOpt) => {
                  const isSelected = formTheme === themeOpt.name;
                  return (
                    <button
                      key={themeOpt.name}
                      type="button"
                      onClick={() => setFormTheme(themeOpt.name)}
                      className={`flex flex-col justify-between p-3 rounded-2xl border text-left transition-all duration-300 h-28 hover:scale-[1.02] cursor-pointer ${themeOpt.style} ${
                        isSelected ? 'ring-2 ring-vault-cyan border-transparent opacity-100' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] font-black uppercase tracking-wider leading-tight">{themeOpt.name}</span>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-vault-cyan animate-pulse" />}
                      </div>
                      <p className="text-[7.5px] opacity-85 leading-normal mt-2">{themeOpt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5 col-span-2">
                <label htmlFor="portfolio-status-field" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                <select
                  id="portfolio-status-field"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-vault-cyan"
                >
                  <option value="DRAFT" className="dark:bg-slate-900">DRAFT</option>
                  <option value="PUBLISHED" className="dark:bg-slate-900">PUBLISHED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. contact@domain.com"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-phone" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Phone</label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 000-0000"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="summary-textarea" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Professional Summary</label>
              <textarea
                id="summary-textarea"
                rows={2}
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                placeholder="Write a brief professional summary..."
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="about-textarea" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Detailed About Me Biography</label>
              <textarea
                id="about-textarea"
                rows={4}
                value={formAbout}
                onChange={(e) => setFormAbout(e.target.value)}
                placeholder="Write your comprehensive biography..."
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="github-url-field" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">GitHub Profile URL</label>
                <input
                  id="github-url-field"
                  type="url"
                  value={formGithubUrl}
                  onChange={(e) => setFormGithubUrl(e.target.value)}
                  placeholder="https://github.com/profile"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="linkedin-url-field" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">LinkedIn Profile URL</label>
                <input
                  id="linkedin-url-field"
                  type="url"
                  value={formLinkedinUrl}
                  onChange={(e) => setFormLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/profile"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-200/50 dark:border-white/5 pt-3">
              <div className="space-y-1.5">
                <label htmlFor="website-url-field" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Portfolio Website URL</label>
                <input
                  id="website-url-field"
                  type="url"
                  value={formSocialLinks?.website || ''}
                  onChange={(e) => setFormSocialLinks({ ...formSocialLinks, website: e.target.value })}
                  placeholder="https://myportfolio.com"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="twitter-url-field" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Twitter Profile URL</label>
                <input
                  id="twitter-url-field"
                  type="url"
                  value={formSocialLinks?.twitter || ''}
                  onChange={(e) => setFormSocialLinks({ ...formSocialLinks, twitter: e.target.value })}
                  placeholder="https://twitter.com/profile"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-cyan"
                />
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6 text-left font-sans pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
            Portfolio Studio
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Manage student portfolio layouts, visual templates, and metadata showcases.</p>
        </div>
        {editorMode ? null : (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-vault-cyan to-vault-accent text-white rounded-xl text-xs font-black shadow-lg shadow-vault-cyan/15 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Portfolio</span>
          </button>
        )}
      </div>

      {portfoliosError && (
        <div className="p-4 bg-vault-destructive/10 border border-vault-destructive/20 text-vault-destructive rounded-xl text-xs font-semibold">
          {portfoliosError}
        </div>
      )}

      {/* DUAL WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: GALLERY OR EDITOR */}
        <div className="xl:col-span-7 flex flex-col min-h-[500px]">
          <AnimatePresence mode="wait">
            {editorMode ? (
              // ── EDITOR VIEW ──────────────────────────────────────────────
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4 text-left"
              >
                {/* Editor Top Control Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-250/30 dark:border-white/5">
                  <button
                    onClick={handleExitEditor}
                    className="flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-vault-fg transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    <span>Back to Gallery</span>
                  </button>
                  <p className="text-xs font-black uppercase text-vault-cyan">
                    {selectedPortfolio ? 'Editing Portfolio Layout' : 'Compiling New Layout'}
                  </p>
                </div>

                {/* Editor Tabs Navigation */}
                <div className="grid grid-cols-3 gap-1.5 border-b border-slate-250/30 dark:border-white/5 pb-2">
                  <button
                    type="button"
                    onClick={() => setEditorTab('basic')}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      editorTab === 'basic' ? 'bg-vault-cyan/10 text-vault-cyan border border-vault-cyan/25' : 'text-slate-400 hover:text-vault-fg'
                    }`}
                  >
                    Basic & Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('skills_projects')}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      editorTab === 'skills_projects' ? 'bg-vault-cyan/10 text-vault-cyan border border-vault-cyan/25' : 'text-slate-400 hover:text-vault-fg'
                    }`}
                  >
                    Skills & Projects
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('ach_certs')}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      editorTab === 'ach_certs' ? 'bg-vault-cyan/10 text-vault-cyan border border-vault-cyan/25' : 'text-slate-400 hover:text-vault-fg'
                    }`}
                  >
                    Certs & Honors
                  </button>
                </div>

                {/* Tab Form Fields */}
                {renderEditorContent()}

                {/* Form Action save/cancel */}
                <div className="flex gap-2 pt-3 border-t border-slate-250/30 dark:border-white/5 justify-end">
                  <button
                    type="button"
                    onClick={handleExitEditor}
                    className="px-4 py-2.5 bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePortfolio}
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan text-white rounded-xl font-black text-xs shadow-md shadow-vault-accent/15 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Portfolio'}
                  </button>
                </div>

              </motion.div>
            ) : (
              // ── GALLERY VIEW ──────────────────────────────────────────────
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {renderGalleryContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: REAL-TIME PREVIEW PANEL */}
        <div className="xl:col-span-5 flex flex-col">
          <LivePreviewPanel
            formTheme={formTheme}
            formStudentId={formStudentId}
            formTitle={formTitle}
            formSummary={formSummary}
            formSkills={formSkills}
            formProjects={formProjects}
            formAchievements={formAchievements}
            formCertificates={formCertificates}
            formGithubUrl={formGithubUrl}
            formLinkedinUrl={formLinkedinUrl}
            formPortfolioName={formPortfolioName}
            formTemplateType={formTemplateType}
            studentNameResolver={getStudentName}
            formAbout={formAbout}
            formEmail={formEmail}
            formPhone={formPhone}
            formSocialLinks={formSocialLinks}
          />
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="vault-glass p-6 rounded-xl border border-vault-border max-w-md w-full space-y-4 text-left"
            >
              <h3 className="text-lg font-black text-red-400 uppercase tracking-wide">Delete Portfolio Layout</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you absolutely sure you want to delete this portfolio layout? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-black rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-lg cursor-pointer transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Confirmation Modal */}
      <AnimatePresence>
        {unsavedChangesConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="vault-glass p-6 rounded-xl border border-vault-border max-w-md w-full space-y-4 text-left"
            >
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">Unsaved Changes</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have unsaved changes in your portfolio editor. Discarding will lose all modifications. Are you sure you want to leave?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUnsavedChangesConfirmOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-black rounded-lg cursor-pointer transition-colors"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#070b14] text-xs font-black rounded-lg cursor-pointer transition-colors"
                >
                  Discard Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toasts */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 vault-glass border border-emerald-500/25 bg-[#061811]/95 text-emerald-450 p-4 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-xs border-l-4 border-l-vault-accent max-w-sm text-left"
          >
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Check size={12} className="text-vault-accent" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-white leading-none">Studio Success</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
