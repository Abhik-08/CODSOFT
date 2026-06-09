import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Code, 
  BarChart3, 
  Brain, 
  Palette, 
  Sparkles, 
  Globe, 
  Download, 
  Play, 
  Check, 
  Laptop,
  CheckCircle2,
  GitBranch
} from 'lucide-react'
import { usePortfolios } from '../../hooks/usePortfolios'

// Helper classes for preview themes styling
const getThemeClass = (theme: string) => {
  switch (theme) {
    case 'obsidian': 
      return {
        bg: 'bg-[#080d19] text-emerald-400 border-emerald-500/20',
        card: 'bg-emerald-500/5 border-emerald-500/10 text-slate-300',
        pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        textAccent: 'text-emerald-400',
        button: 'bg-emerald-500 text-[#080d19]',
        avatar: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
      }
    case 'cyberpunk':
      return {
        bg: 'bg-[#120720] text-pink-400 border-pink-500/20 font-sans',
        card: 'bg-pink-500/5 border-pink-500/10 text-slate-300',
        pill: 'bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono',
        textAccent: 'text-pink-400',
        button: 'bg-pink-500 text-white',
        avatar: 'border-pink-500/30 text-pink-400 bg-pink-500/10'
      }
    case 'minimalist':
      return {
        bg: 'bg-white text-slate-900 border-slate-300 font-serif',
        card: 'bg-slate-50 border-slate-200 text-slate-700',
        pill: 'bg-slate-100 text-slate-800 border border-slate-300',
        textAccent: 'text-slate-900',
        button: 'bg-slate-900 text-white',
        avatar: 'border-slate-300 text-slate-700 bg-slate-100'
      }
    default: // emerald / standard
      return {
        bg: 'bg-slate-50 dark:bg-[#061811] text-emerald-600 dark:text-emerald-400 border-emerald-500/10',
        card: 'bg-white dark:bg-[#092218] border-slate-200 dark:border-emerald-500/10 text-slate-700 dark:text-slate-300',
        pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
        button: 'bg-emerald-500 text-white',
        avatar: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10'
      }
  }
}

// Stored portfolios browser mockup styling
const getGalleryBrowserClass = (theme: string) => {
  const t = theme.toLowerCase()
  if (t === 'obsidian') return 'bg-[#0b1329] border-emerald-500/20 text-emerald-400'
  if (t === 'cyberpunk') return 'bg-[#1b1130] border-pink-500/20 text-pink-400'
  if (t === 'emerald') return 'bg-slate-50 dark:bg-[#051c12] border-emerald-500/20 text-emerald-500'
  return 'bg-white dark:bg-[#070b14]/70 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300'
}

const getGalleryPillClass = (theme: string) => {
  const t = theme.toLowerCase()
  if (t === 'obsidian') return 'bg-emerald-500/10 text-emerald-400'
  if (t === 'cyberpunk') return 'bg-pink-500/10 text-pink-400'
  if (t === 'emerald') return 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
  return 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-350'
}

// Portfolio Dynamic Data mapping based on Template Selected
const getTemplateMockData = (tpl: string) => {
  switch (tpl) {
    case 'Data Analyst':
      return {
        role: 'Data Analyst & Insights Architect',
        bio: 'Extracting academic intelligence through structured dataset modeling, SQL analytics pipelines, and Tableau cohorts dashboarding.',
        projects: [
          { name: 'Cohort CGPA Progression Query', desc: 'Custom SQL view clustering student GPA drift factors.', stars: 14 },
          { name: 'Graduation Readiness Dashboard', desc: 'Interactive visual scorecard projecting cohort placement parameters.', stars: 22 }
        ],
        badgeIcon: BarChart3
      }
    case 'AI Engineer':
      return {
        role: 'AI Engineer & Neural Architect',
        bio: 'Designing predictive student diagnostics engines, Deep Learning regression models, and cohort attendance warning classifiers.',
        projects: [
          { name: 'Academic Diagnostic Classifier', desc: 'Predictive cohort grade model utilizing decision networks.', stars: 34 },
          { name: 'Proactive Attendance Alert Pipeline', desc: 'System tracking attendance fluctuations and dispatching warnings.', stars: 28 }
        ],
        badgeIcon: Brain
      }
    case 'Creative':
      return {
        role: 'Creative UI & Interaction Developer',
        bio: 'Designing premium student-facing registries, dark futuristic consoles, glassmorphic analytics cards, and micro-interactions.',
        projects: [
          { name: 'EduVault Command Console Layout', desc: 'Ultra-premium dashboard interface utilizing SVG nodes and orbits.', stars: 45 },
          { name: 'Academic Orbit Portal Visualizer', desc: 'Dynamic visual map of institution metrics and active indicators.', stars: 52 }
        ],
        badgeIcon: Palette
      }
    case 'Research':
      return {
        role: 'Academic Researcher & Thesis Lead',
        bio: 'Publishing academic research studies on educational diagnostic indicators, algorithmic evaluation metrics, and peer networks.',
        projects: [
          { name: 'Algorithmic Retention Analysis 2026', desc: 'Regression modeling paper predicting cohort dropout rates.', stars: 12 },
          { name: 'Cognitive Diagnostic Indicators Research', desc: 'Investigation comparing neural networks against standard linear scores.', stars: 18 }
        ],
        badgeIcon: Sparkles
      }
    case 'Minimalist':
      return {
        role: 'Systems Engineer & Minimalist',
        bio: 'Focusing on database constraints, clean typography density, raw system metrics, and robust API endpoints security.',
        projects: [
          { name: 'Institutional Registry Indexer', desc: 'High throughput query layer indexing 10k records in under 8ms.', stars: 19 },
          { name: 'Session Authorization Guard', desc: 'Granular security headers protecting session tokens.', stars: 30 }
        ],
        badgeIcon: Laptop
      }
    default: // Developer
      return {
        role: 'Software Developer & Systems Architect',
        bio: 'Building full-stack institutional student registry software using React, Spring Boot, PostgreSQL, and Firebase APIs.',
        projects: [
          { name: 'Verifiable Portfolio Compiler Engine', desc: 'Dynamic preview compiler compiling HTML templates on-the-fly.', stars: 41 },
          { name: 'Multi-Role Session Authorization Guard', desc: 'Strict security boundaries checking registrar permissions.', stars: 27 }
        ],
        badgeIcon: Code
      }
  }
}

export default function PortfolioPage() {
  const [selectedTheme, setSelectedTheme] = useState('emerald')
  const [selectedTemplate, setSelectedTemplate] = useState('Developer')
  const [isGenerating, setIsGenerating] = useState(false)

  // Firestore-backed portfolios
  const { portfolios, addPortfolio, markDeployed } = usePortfolios()

  const [newStudentName, setNewStudentName] = useState('Anya Patel')
  const [deployingId, setDeployingId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleDeploy = (portfolio: { id: string; studentName: string }) => {
    setDeployingId(portfolio.id)
    setTimeout(() => {
      const deployUrl = `https://${portfolio.studentName.toLowerCase().replace(/\s+/g, '-')}.eduvault.app`
      markDeployed(portfolio.id, deployUrl)
      setDeployingId(null)
      alert(`Portfolio deployed successfully!\nLive URL: ${deployUrl}`)
    }, 1500)
  }

  const handleDownloadZip = (name: string) => {
    alert(`Generating artifact bundle for ${name}...\nDownloaded: ${name.toLowerCase().replace(/\s+/g, '-')}-portfolio.zip`)
  }

  const renderDeployButtonContent = (portfolio: { id: string; deployed: boolean }) => {
    if (deployingId === portfolio.id) {
      return <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    }
    if (portfolio.deployed) {
      return (
        <>
          <Check size={9} />
          <span>Live</span>
        </>
      )
    }
    return (
      <>
        <Play size={9} />
        <span>Deploy</span>
      </>
    )
  }

  const templates = [
    { id: 'Developer', label: 'Developer Portfolio', desc: 'Optimized for software engineers with GitHub repositories integration.', icon: Code, color: 'text-vault-cyan bg-vault-cyan/10' },
    { id: 'Data Analyst', label: 'Data Analyst Portfolio', desc: 'Focuses on datasets representation, SQL tables, and Tableau charts.', icon: BarChart3, color: 'text-vault-accent bg-vault-accent/10' },
    { id: 'AI Engineer', label: 'AI Engineer Portfolio', desc: 'Designed for machine learning architectures and notebook highlights.', icon: Brain, color: 'text-violet-400 bg-violet-400/10' },
    { id: 'Creative', label: 'Creative Portfolio', desc: 'Visually striking layouts for designers, frontends, and UI designers.', icon: Palette, color: 'text-pink-400 bg-pink-400/10' },
    { id: 'Research', label: 'Research Portfolio', desc: 'Structured academic publication logs and thesis timelines.', icon: Sparkles, color: 'text-yellow-400 bg-yellow-400/10' }
  ]

  const themes = [
    { id: 'emerald', label: 'Emerald Mint', primary: '#10b981', desc: 'Clean, professional SaaS styling.' },
    { id: 'obsidian', label: 'Obsidian Dark', primary: '#34d399', desc: 'Linear-inspired dark engineering theme.' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', primary: '#ec4899', desc: 'Glowing neon accents with high-contrast text.' },
    { id: 'minimalist', label: 'Mono Minimalist', primary: '#0f172a', desc: 'Stark black-and-white print layout.' }
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await addPortfolio({
        studentName: newStudentName,
        template: selectedTemplate,
        theme: selectedTheme.toUpperCase()
      })
      setToastMessage(`VERIFIABLE BUNDLE: Completed portfolio compiling for ${newStudentName} using the ${selectedTemplate} template.`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3800)
    } catch (err) {
      console.error('Failed to create portfolio:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Get dynamic mock preview elements
  const currentPreviewData = getTemplateMockData(selectedTemplate)
  const previewTheme = getThemeClass(selectedTheme)

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
          Portfolio Studio
        </h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">Compile and deploy verifiable web portfolios for cohort members.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls & Configurations */}
        <div className="xl:col-span-7 space-y-6 flex flex-col">
          
          {/* SECTION A: Templates Grid */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-cyan" />
              <span>Section A: Select Portfolio Template</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tpl) => {
                const Icon = tpl.icon
                const isSelected = selectedTemplate === tpl.id
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer relative ${
                      isSelected 
                        ? 'border-vault-cyan bg-vault-cyan/5 shadow-[0_0_15px_rgba(6,182,212,0.08)]' 
                        : 'border-slate-200/60 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${tpl.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <span>{tpl.label}</span>
                        {isSelected && <Check size={11} className="text-vault-cyan" />}
                      </p>
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1 leading-normal font-semibold">{tpl.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION B: Generator Panel */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-accent" />
              <span>Section B: Studio Compiler Options</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="student-name-target" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Student Subject Target</label>
                  <input
                    id="student-name-target"
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Student Name..."
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Compiler Visual Theme</span>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTheme(t.id)}
                        className={`px-3 py-2.5 rounded-xl text-[10px] font-extrabold border transition-all text-left flex items-center gap-2 cursor-pointer ${
                          selectedTheme === t.id
                            ? 'border-vault-accent bg-vault-accent/5 text-vault-accent'
                            : 'border-slate-200/60 dark:border-white/5 text-slate-400 hover:text-vault-fg hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                        <span>{t.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-end gap-2.5">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-vault-accent to-vault-cyan hover:opacity-95 disabled:from-slate-450 disabled:to-slate-500 text-white rounded-xl font-black text-xs shadow-md shadow-vault-accent/15 cursor-pointer transition-all"
                >
                  {isGenerating ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Compiling Studio Portfolio...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>Generate Portfolio Package</span>
                    </>
                  )}
                </button>
                
                <button 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl font-black text-xs shadow-sm cursor-pointer"
                  onClick={() => handleDownloadZip(newStudentName)}
                >
                  <Download size={13} />
                  <span>Download ZIP Bundle</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Section C Live Preview Window */}
        <div className="xl:col-span-5 flex flex-col">
          
          {/* SECTION C: Mock Browser Preview */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4 flex flex-col h-full justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span>Section C: Live Compiler Preview</span>
            </h3>

            {/* Mock Web Browser Frame */}
            <div className="flex-1 w-full border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg flex flex-col min-h-[360px] bg-white dark:bg-[#070b14]/90">
              
              {/* Browser control bar */}
              <div className="h-9 border-b border-slate-150 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-3.5 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="h-5 flex-1 max-w-[240px] rounded bg-slate-200/50 dark:bg-white/5 flex items-center px-2">
                  <Globe size={9} className="text-slate-400 shrink-0" />
                  <span className="text-[8px] text-slate-400 truncate ml-1 font-mono">http://localhost:3000/{newStudentName.toLowerCase().replace(/\s+/g, '-')}-portfolio</span>
                </div>
              </div>

              {/* Dynamic Theme Render Window */}
              <div className={`flex-1 p-5 relative overflow-hidden flex flex-col justify-between text-left transition-colors duration-300 ${previewTheme.bg}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTheme + selectedTemplate + newStudentName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    
                    {/* Mock Profile layout based on theme */}
                    <div className="space-y-3.5">
                      {/* Name header & mock template tag */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-black tracking-tight leading-none">
                            {newStudentName}
                          </h4>
                          <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase mt-2.5 inline-block tracking-wide ${previewTheme.pill}`}>
                            {currentPreviewData.role}
                          </span>
                        </div>
                        <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-black text-xs ${previewTheme.avatar}`}>
                          {newStudentName[0] || 'U'}
                        </div>
                      </div>

                      {/* Mock bio content */}
                      <p className="text-[10px] opacity-80 leading-relaxed font-semibold">
                        {currentPreviewData.bio}
                      </p>

                      {/* High-Fidelity Project Highlight Cards */}
                      <div className="space-y-2 pt-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-50 block">Featured Records</span>
                        {currentPreviewData.projects.map((proj) => (
                          <div key={proj.name} className={`p-2 rounded-xl border text-[9.5px] space-y-1 ${previewTheme.card}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
                                <GitBranch size={10} className="text-vault-cyan" />
                                <span>{proj.name}</span>
                              </span>
                              <span className="text-[8px] opacity-60 font-mono">★ {proj.stars}</span>
                            </div>
                            <p className="text-[8.5px] opacity-70 leading-normal">{proj.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verifiable Credentials Footer */}
                    <div className="pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[8px] opacity-60 font-semibold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={10} className={previewTheme.textAccent} />
                        <span>EduVault AI Verified Badge</span>
                      </span>
                      <span className="font-mono">v1.2.6</span>
                    </div>

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* SECTION D: Stored Portfolios Gallery — from Firestore */}
      <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
          <span>Section D: Portfolio Studio Gallery</span>
        </h3>
        
        {portfolios.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400 font-semibold">No portfolios generated yet. Use the compiler above to create your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolios.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                className="vault-glass rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-hidden flex flex-col justify-between shadow-sm hover:border-vault-cyan/30 transition-all duration-300 relative group p-3.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-vault-cyan/5 to-vault-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

                {/* Browser Preview Frame */}
                <div className={`w-full h-24 rounded-lg border flex flex-col overflow-hidden mb-3.5 relative ${getGalleryBrowserClass(item.theme)}`}>
                  <div className="h-5 border-b border-slate-200/40 dark:border-white/5 bg-slate-50/20 dark:bg-white/5 px-2 flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 p-2 flex flex-col justify-between text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-[10px] font-bold tracking-tight">{item.studentName}</h5>
                        <span className="text-[6.5px] px-1 py-0.2 bg-slate-200/30 dark:bg-white/5 border border-slate-300/30 rounded font-mono uppercase mt-0.5 inline-block">
                          {item.template}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[6.5px] opacity-55 pt-1 border-t border-slate-200/20 dark:border-white/5">
                      <span>Verified Badge</span>
                      <span className="font-mono">v1.2</span>
                    </div>
                  </div>
                </div>

                {/* Student Details info */}
                <div className="space-y-1 text-left px-1">
                  <p className="text-xs font-black text-slate-800 dark:text-white truncate">{item.studentName}</p>
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">{item.template}</span>
                    <span className={`text-[8px] font-black font-mono px-1.5 py-0.2 rounded uppercase tracking-wider ${getGalleryPillClass(item.theme)}`}>
                      {item.theme}
                    </span>
                  </div>
                  
                  <p className="text-[9px] font-semibold text-slate-450 dark:text-slate-500 mt-1">Compiled: {item.createdAt}</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 mt-3.5 px-0.5">
                  <button 
                    className="flex items-center justify-center gap-0.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-lg font-bold text-[9px] cursor-pointer transition-colors"
                    onClick={() => {
                      setNewStudentName(item.studentName)
                      setSelectedTemplate(item.template)
                      setSelectedTheme(item.theme.toLowerCase())
                    }}
                    title="Load in Preview"
                  >
                    <span>Preview</span>
                  </button>
                  
                  <button 
                    className="flex items-center justify-center gap-0.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-lg font-bold text-[9px] cursor-pointer transition-colors"
                    onClick={() => handleDownloadZip(item.studentName)}
                  >
                    <Download size={9} />
                    <span>ZIP</span>
                  </button>

                  <button 
                    className={`flex items-center justify-center gap-0.5 py-1.5 rounded-lg font-extrabold text-[9px] cursor-pointer transition-all ${
                      item.deployed
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black'
                        : 'bg-vault-accent hover:opacity-95 text-white border border-vault-accent/20'
                    }`}
                    onClick={() => handleDeploy(item)}
                    disabled={deployingId === item.id}
                  >
                    {renderDeployButtonContent(item)}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 vault-glass border border-emerald-500/25 bg-[#061811]/90 text-emerald-450 p-4 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-xs border-l-4 border-l-vault-accent max-w-sm text-left"
          >
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Check size={12} className="text-vault-accent" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-white leading-none">Compile Successful</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
