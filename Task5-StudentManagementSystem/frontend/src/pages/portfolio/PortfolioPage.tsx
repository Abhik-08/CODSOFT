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
  CheckCircle2
} from 'lucide-react'

// Helper functions to resolve nested ternary warnings in theme preview
const getThemeHeaderClass = (theme: string) => {
  switch (theme) {
    case 'obsidian': return 'text-emerald-400'
    case 'cyberpunk': return 'text-pink-500 dark:text-pink-400 font-serif'
    case 'emerald': return 'text-emerald-600 dark:text-emerald-400'
    default: return 'text-slate-900 dark:text-white font-mono'
  }
}

const getThemeTagClass = (theme: string) => {
  switch (theme) {
    case 'obsidian': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'cyberpunk': return 'bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono'
    case 'emerald': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    default: return 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200'
  }
}

const getAvatarBorderClass = (theme: string) => {
  return theme === 'cyberpunk'
    ? 'border-pink-500/30 text-pink-400 bg-pink-500/5'
    : 'border-slate-200 dark:border-white/10 text-slate-400'
}

// Helpers to resolve nested ternary and cognitive complexity warnings in Section D gallery
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

const renderDeployButtonContent = (name: string, deployingId: string | null, deployedPortfolios: string[]) => {
  if (deployingId === name) {
    return <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  }
  if (deployedPortfolios.includes(name)) {
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

export default function PortfolioPage() {
  const [selectedTheme, setSelectedTheme] = useState('emerald')
  const [selectedTemplate, setSelectedTemplate] = useState('Developer')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPortfolios, setGeneratedPortfolios] = useState([
    { name: 'Sarah Jenkins', template: 'Developer', theme: 'Obsidian', date: '2026-06-08' },
    { name: 'Marcus Lee', template: 'AI Engineer', theme: 'Cyberpunk', date: '2026-06-07' }
  ])
  const [newStudentName, setNewStudentName] = useState('Anya Patel')
  const [deployingId, setDeployingId] = useState<string | null>(null)
  const [deployedPortfolios, setDeployedPortfolios] = useState<string[]>([])

  const handleDeploy = (name: string) => {
    setDeployingId(name)
    setTimeout(() => {
      setDeployingId(null)
      setDeployedPortfolios(prev => [...prev, name])
      alert(`Portfolio deployed successfully!\nLive URL: https://${name.toLowerCase().replace(/\s+/g, '-')}.eduvault.app`)
    }, 1500)
  }

  const handleDownloadZip = (name: string) => {
    alert(`Generating artifact bundle for ${name}...\nDownloaded: ${name.toLowerCase().replace(/\s+/g, '-')}-portfolio.zip`)
  }

  const templates = [
    { id: 'Developer', label: 'Developer Portfolio', desc: 'Optimized for software engineers with GitHub repositories integration.', icon: Code, color: 'text-vault-cyan bg-vault-cyan/10' },
    { id: 'Data Analyst', label: 'Data Analyst Portfolio', desc: 'Focuses on datasets representation, SQL tables, and Tableau charts.', icon: BarChart3, color: 'text-vault-accent bg-vault-accent/10' },
    { id: 'AI Engineer', label: 'AI Engineer Portfolio', desc: 'Designed for machine learning architectures and notebook highlights.', icon: Brain, color: 'text-violet-400 bg-violet-400/10' },
    { id: 'Creative', label: 'Creative Portfolio', desc: 'Visually striking layouts for designers, frontends, and UI designers.', icon: Palette, color: 'text-pink-400 bg-pink-400/10' },
    { id: 'Research', label: 'Research Portfolio', desc: 'Structured academic publication logs and thesis timelines.', icon: Sparkles, color: 'text-yellow-400 bg-yellow-400/10' },
    { id: 'Minimalist', label: 'Minimalist Portfolio', desc: 'High typography contrast, stark grids, and pure information density.', icon: Laptop, color: 'text-slate-400 bg-slate-400/10' }
  ]

  const themes = [
    { id: 'emerald', label: 'Emerald Mint', primary: '#10b981', desc: 'Clean, professional SaaS styling.' },
    { id: 'obsidian', label: 'Obsidian Dark', primary: '#34d399', desc: 'Linear-inspired dark engineering theme.' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', primary: '#ec4899', desc: 'Glowing neon accents with high-contrast text.' },
    { id: 'minimalist', label: 'Mono Minimalist', primary: '#0f172a', desc: 'Stark black-and-white print layout.' }
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      const date = new Date().toISOString().split('T')[0]
      setGeneratedPortfolios(prev => [
        { name: newStudentName, template: selectedTemplate, theme: selectedTheme.toUpperCase(), date },
        ...prev
      ])
    }, 2000)
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-vault-fg to-vault-fg/75 bg-clip-text text-transparent">
          Portfolio Studio
        </h2>
        <p className="text-slate-400 mt-1 text-sm">Design, preview, and output custom verifiable web portfolios for cohort members.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls & Configurations (7 Columns on desktop) */}
        <div className="xl:col-span-7 space-y-6 flex flex-col">
          
          {/* SECTION A: Templates Grid */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
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
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'border-vault-cyan bg-vault-cyan/5 shadow-[0_0_12px_rgba(6,182,212,0.08)]' 
                        : 'border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${tpl.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <span>{tpl.label}</span>
                        {isSelected && <Check size={11} className="text-vault-cyan" />}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">{tpl.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION B: Generator Panel */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-accent" />
              <span>Section B: Studio Compiler Options</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form name and select theme */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="student-name-target" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Student Subject Target</label>
                  <input
                    id="student-name-target"
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Student Name..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Compiler Visual Theme</span>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTheme(t.id)}
                        className={`px-3 py-2 rounded-lg text-[10.5px] font-bold border transition-all text-left flex items-center gap-2 cursor-pointer ${
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-vault-accent to-vault-cyan hover:from-vault-accent/95 hover:to-vault-cyan/95 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold text-xs shadow-md shadow-vault-accent/15 hover:shadow-vault-accent/25 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-350 rounded-xl font-bold text-xs shadow-sm hover:border-slate-300 dark:hover:border-white/10 active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => alert("Portfolio compiled. Ready for deployment export.")}
                >
                  <Download size={13} />
                  <span>Download ZIP Bundle</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Section C Live Preview Window (5 Columns on desktop) */}
        <div className="xl:col-span-5 flex flex-col space-y-6">
          
          {/* SECTION C: Mock Browser Preview */}
          <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4 flex flex-col h-full justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span>Section C: Live Compiler Preview</span>
            </h3>

            {/* Mock Web Browser Frame */}
            <div className="flex-1 w-full border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-md flex flex-col min-h-[300px] bg-white dark:bg-[#070b14]/90">
              
              {/* Browser control bar */}
              <div className="h-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <div className="h-4.5 flex-1 max-w-xs rounded bg-slate-200/60 dark:bg-white/5 flex items-center px-2">
                  <Globe size={9} className="text-slate-400 shrink-0" />
                  <span className="text-[8px] text-slate-400 truncate ml-1 font-mono">http://localhost:3000/{newStudentName.toLowerCase().replace(' ', '-')}-portfolio</span>
                </div>
              </div>

              {/* Dynamic Theme Render Window */}
              <div className="flex-1 p-5 relative overflow-hidden flex flex-col justify-between text-left">
                {/* Simulated theme profiles styles wrapper */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTheme + selectedTemplate}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    
                    {/* Mock Profile layout based on theme */}
                    <div className="space-y-3">
                      {/* Name header & mock template tag */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`text-base font-black tracking-tight ${getThemeHeaderClass(selectedTheme)}`}>
                            {newStudentName}
                          </h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase mt-1 inline-block ${getThemeTagClass(selectedTheme)}`}>
                            {selectedTemplate}
                          </span>
                        </div>
                        <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-black text-xs ${getAvatarBorderClass(selectedTheme)}`}>
                          {newStudentName[0]}
                        </div>
                      </div>

                      {/* Mock bio content */}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                        Academic showcase tracking technical qualifications, verifiable certified badges, and cohort milestone projects built using React, Spring Boot, and Python.
                      </p>

                      {/* Skills lists mock */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">Machine Learning</span>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">Fullstack Dev</span>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">Cloud Security</span>
                      </div>
                    </div>

                    {/* Verifiable Credentials Footer mock */}
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[8px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={10} className="text-vault-accent" />
                        <span>EduVault AI Verified Credentials</span>
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

      {/* SECTION D: Stored Portfolios Gallery */}
      <div className="vault-glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
          <span>Section D: Portfolio Studio Gallery</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {generatedPortfolios.map((item) => (
            <motion.div
              key={`${item.name}-${item.template}`}
              whileHover={{ y: -4 }}
              className="vault-glass rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-hidden flex flex-col justify-between shadow-sm hover:border-vault-cyan/30 transition-all duration-300 relative group p-3"
            >
              {/* Subtle spotlight glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-vault-cyan/5 to-vault-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

              {/* Browser Preview Frame */}
              <div className={`w-full h-24 rounded-lg border flex flex-col overflow-hidden mb-3 relative ${getGalleryBrowserClass(item.theme)}`}>
                {/* Header browser circles */}
                <div className="h-5 border-b border-slate-200/40 dark:border-white/5 bg-slate-50/20 dark:bg-white/5 px-2 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400/70" />
                  <div className="h-3.5 flex-1 max-w-[100px] rounded bg-slate-200/45 dark:bg-white/5 flex items-center px-1.5 ml-2">
                    <span className="text-[6px] opacity-40 font-mono truncate">localhost:3000</span>
                  </div>
                </div>
                {/* Mock Visualizer page interior */}
                <div className="flex-1 p-2.5 flex flex-col justify-between text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-[10px] font-bold tracking-tight">{item.name}</h5>
                      <span className="text-[6.5px] px-1 py-0.2 bg-slate-200/30 dark:bg-white/5 border border-slate-300/30 rounded font-mono uppercase mt-0.5 inline-block">
                        {item.template}
                      </span>
                    </div>
                    <div className="h-5 w-5 rounded-full border border-current/30 flex items-center justify-center font-black text-[7px]">
                      {item.name[0]}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[6.5px] opacity-55 pt-1 border-t border-slate-200/20 dark:border-white/5">
                    <span>Verified Credentials</span>
                    <span className="font-mono">v1.2</span>
                  </div>
                </div>
              </div>

              {/* Student Name and Details info */}
              <div className="space-y-1 text-left px-1.5">
                <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate">{item.name}</p>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{item.template}</span>
                  <span className={`text-[8px] font-bold font-mono px-1 rounded uppercase tracking-wider ${getGalleryPillClass(item.theme)}`}>
                    {item.theme}
                  </span>
                </div>
                
                <p className="text-[9px] text-slate-400 mt-1">Compiled: {item.date}</p>
              </div>

              {/* Action Buttons in a row grid */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 px-0.5 pb-0.5">
                <button 
                  className="flex items-center justify-center gap-0.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[9px] cursor-pointer transition-colors shadow-sm"
                  onClick={() => {
                    setNewStudentName(item.name)
                    setSelectedTemplate(item.template)
                    setSelectedTheme(item.theme.toLowerCase())
                  }}
                  title="Load in Preview Compiler"
                >
                  <span>Preview</span>
                </button>
                
                <button 
                  className="flex items-center justify-center gap-0.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[9px] cursor-pointer transition-colors shadow-sm"
                  onClick={() => handleDownloadZip(item.name)}
                  title="Download zip bundle"
                >
                  <Download size={9} />
                  <span>ZIP</span>
                </button>

                <button 
                  className={`flex items-center justify-center gap-0.5 py-1.5 rounded-lg font-bold text-[9px] cursor-pointer transition-all shadow-sm ${
                    deployedPortfolios.includes(item.name)
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-extrabold'
                      : 'bg-vault-accent hover:bg-vault-accent/90 text-white border border-vault-accent/20'
                  }`}
                  onClick={() => handleDeploy(item.name)}
                  disabled={deployingId === item.name}
                  title="Deploy to EduVault Edge"
                >
                  {renderDeployButtonContent(item.name, deployingId, deployedPortfolios)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}
