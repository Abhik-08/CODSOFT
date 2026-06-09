import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Users,
  BarChart3,
  Award,
  Brain,
  ShieldCheck,
  Lock,
  Cpu
} from 'lucide-react'
import { EduVaultLogo } from '../../components/common/EduVaultLogo'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePreviewTab, setActivePreviewTab] = useState<'students' | 'analytics' | 'portfolio'>('analytics')

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  // Handle CTA redirects
  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="relative min-h-screen bg-vault-bg text-vault-fg transition-colors duration-300 selection:bg-vault-emerald/30 selection:text-vault-emerald overflow-x-hidden">
      
      {/* Visual Stripe/Linear Grid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.08]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Radial Soft Green/Cyan Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-vault-emerald/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-1/4 w-[600px] h-[600px] rounded-full bg-vault-cyan/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-10 w-[400px] h-[400px] rounded-full bg-vault-emerald/5 blur-[120px] pointer-events-none z-0" />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-vault-border/40 bg-vault-bg/75 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          
          {/* Logo Branding */}
          <button 
            onClick={() => scrollToSection('hero')} 
            className="flex items-center cursor-pointer text-left bg-transparent border-none p-0 focus:outline-none"
            aria-label="EduVault AI Home"
          >
            <EduVaultLogo showText={true} iconSize={84} textSize="text-3xl" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-vault-accent transition-colors duration-200 cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('preview')} 
              className="hover:text-vault-accent transition-colors duration-200 cursor-pointer"
            >
              Product Preview
            </button>
            <button 
              onClick={() => scrollToSection('security')} 
              className="hover:text-vault-accent transition-colors duration-200 cursor-pointer"
            >
              Security
            </button>
          </nav>

          {/* Action Triggers */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-vault-border/50 hover:bg-vault-card transition-colors text-slate-400 hover:text-vault-fg cursor-pointer"
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleCtaClick}
              className="relative overflow-hidden px-5 py-2 bg-gradient-to-r from-vault-accent to-vault-cyan text-white rounded-xl text-xs font-black tracking-wide shadow-lg shadow-vault-accent/15 hover:shadow-vault-accent/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer group"
            >
              {/* Button inner glow overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>Launch Platform</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-vault-fg cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-vault-fg cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-b border-vault-border bg-vault-card px-6 py-5 space-y-4 flex flex-col text-sm font-semibold"
            >
              <button onClick={() => scrollToSection('features')} className="text-left py-2 text-slate-400 hover:text-vault-accent transition-colors cursor-pointer">Features</button>
              <button onClick={() => scrollToSection('preview')} className="text-left py-2 text-slate-400 hover:text-vault-accent transition-colors cursor-pointer">Product Preview</button>
              <button onClick={() => scrollToSection('security')} className="text-left py-2 text-slate-400 hover:text-vault-accent transition-colors cursor-pointer">Security</button>
              <hr className="border-vault-border/50" />
              <button
                onClick={handleCtaClick}
                className="w-full text-center py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Launch Platform
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-12 px-6 max-w-7xl mx-auto z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-vault-accent/20 bg-vault-accent/5 text-vault-accent text-[11px] font-extrabold tracking-wide mb-6"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>Next Generation Student Information Ecosystem</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl text-slate-900 dark:text-white leading-[1.1]"
        >
          The intelligent layer for <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-vault-accent via-vault-cyan to-[#8b5cf6] bg-clip-text text-transparent">
            academic excellence.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium"
        >
          EduVault AI combines student profile management, predictive academic analytics, and digital achievement tracking into a single state-of-the-art Student Intelligence Platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <button
            onClick={handleCtaClick}
            className="flex items-center space-x-2.5 px-6 py-3.5 bg-gradient-to-r from-vault-accent to-vault-cyan text-white font-extrabold rounded-xl shadow-xl shadow-vault-accent/15 hover:shadow-vault-accent/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
          >
            <span>Launch Platform</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="preview-dashboard" className="pb-20 px-6 max-w-7xl mx-auto z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl p-2.5 rounded-2xl border border-vault-border bg-vault-card/40 backdrop-blur shadow-2xl relative"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-vault-emerald/5 to-vault-cyan/5 rounded-2xl pointer-events-none" />
          
          {/* Glassmorphism Dashboard Mockup */}
          <div className="vault-glass rounded-xl overflow-hidden shadow-inner border border-vault-border/50">
            {/* Window title bar */}
            <div className="h-10 border-b border-vault-border/50 bg-vault-bg/60 flex items-center px-4 justify-between">
              <div className="flex space-x-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[10px] font-semibold font-mono text-slate-500 flex items-center space-x-1.5 bg-vault-bg px-5 py-1 rounded border border-vault-border/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>console.eduvault-ai.com/dashboard</span>
              </div>
              <div className="w-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 h-[380px]">
              {/* Sidebar shell mockup */}
              <div className="hidden md:flex flex-col p-4 border-r border-vault-border/50 bg-vault-card/30 text-left space-y-4">
                <div className="h-4.5 w-20 bg-vault-accent/15 border border-vault-accent/20 rounded" />
                <div className="space-y-2 pt-4">
                  <div className="h-7 w-full bg-vault-accent/10 border border-vault-accent/25 rounded-lg flex items-center px-3 gap-2">
                    <div className="h-2 w-2 rounded bg-vault-accent" />
                    <div className="h-2 w-12 bg-vault-accent/40 rounded" />
                  </div>
                  <div className="h-7 w-[90%] bg-vault-border/20 rounded-lg flex items-center px-3 gap-2">
                    <div className="h-2 w-2 rounded bg-slate-500/30" />
                    <div className="h-2 w-14 bg-slate-500/30 rounded" />
                  </div>
                  <div className="h-7 w-[95%] bg-vault-border/20 rounded-lg flex items-center px-3 gap-2">
                    <div className="h-2 w-2 rounded bg-slate-500/30" />
                    <div className="h-2 w-16 bg-slate-500/30 rounded" />
                  </div>
                  <div className="h-7 w-[80%] bg-vault-border/20 rounded-lg flex items-center px-3 gap-2">
                    <div className="h-2 w-2 rounded bg-slate-500/30" />
                    <div className="h-2 w-10 bg-slate-500/30 rounded" />
                  </div>
                </div>
              </div>
              
              {/* Canvas shell mockup */}
              <div className="col-span-3 p-5 flex flex-col space-y-5 text-left bg-slate-50/50 dark:bg-transparent">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-4.5 w-32 bg-slate-800 dark:bg-white rounded" />
                    <div className="h-2.5 w-48 bg-slate-400/50 rounded" />
                  </div>
                  <div className="h-7 w-20 bg-vault-accent/20 border border-vault-accent/30 rounded-lg" />
                </div>

                {/* mini metrics row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="vault-glass p-3 rounded-lg border border-vault-border/60 space-y-1.5">
                    <div className="h-2 w-10 bg-slate-400/50 rounded" />
                    <div className="h-4 w-12 bg-vault-accent/30 rounded" />
                  </div>
                  <div className="vault-glass p-3 rounded-lg border border-vault-border/60 space-y-1.5">
                    <div className="h-2 w-10 bg-slate-400/50 rounded" />
                    <div className="h-4 w-14 bg-vault-cyan/30 rounded" />
                  </div>
                  <div className="vault-glass p-3 rounded-lg border border-vault-border/60 space-y-1.5">
                    <div className="h-2 w-10 bg-slate-400/50 rounded" />
                    <div className="h-4 w-8 bg-[#8b5cf6]/30 rounded" />
                  </div>
                </div>

                {/* Graph mockup */}
                <div className="flex-1 bg-vault-card border border-vault-border/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="h-2 w-24 bg-slate-400/55 rounded" />
                  <div className="flex items-end justify-between h-24 pt-4 border-b border-slate-200/50 dark:border-white/5">
                    <div className="w-[10%] h-[35%] bg-vault-emerald/20 border-t border-vault-emerald/40 rounded-t" />
                    <div className="w-[10%] h-[55%] bg-vault-emerald/30 border-t border-vault-emerald/50 rounded-t" />
                    <div className="w-[10%] h-[75%] bg-gradient-to-t from-vault-emerald/20 to-vault-cyan/40 border-t border-vault-cyan/50 rounded-t" />
                    <div className="w-[10%] h-[50%] bg-vault-emerald/25 border-t border-vault-emerald/40 rounded-t" />
                    <div className="w-[10%] h-[65%] bg-vault-emerald/35 border-t border-vault-emerald/55 rounded-t" />
                    <div className="w-[10%] h-[92%] bg-gradient-to-t from-vault-emerald to-vault-cyan border-t border-vault-emerald/60 rounded-t shadow-md shadow-vault-emerald/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Modules Section */}
      <section id="features" className="py-24 border-t border-vault-border/40 bg-vault-card/20 backdrop-blur-sm relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold font-mono text-vault-accent uppercase tracking-widest">Platform Capabilities</h2>
            <p className="text-3xl md:text-4xl font-extrabold tracking-tight">Core Operational Modules</p>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
              Explore the functional interfaces built to compute, log, and render institutional student records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: Student Registry */}
            <motion.div
              whileHover={{ y: -6 }}
              className="vault-glass p-6 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Card Glow Effect */}
              <div className="absolute -inset-px bg-gradient-to-tr from-vault-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              
              <div>
                {/* HTML Screenshot Preview: Student List */}
                <div className="w-full h-36 bg-slate-950/40 dark:bg-slate-950/70 border border-vault-border/40 rounded-lg p-3.5 mb-6 overflow-hidden flex flex-col justify-between select-none">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">Registry Console</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-1.5 bg-white/[0.03] border border-white/5 rounded-md text-[9.5px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-vault-accent/20 text-vault-accent font-black text-[8px] flex items-center justify-center">AM</div>
                        <span className="font-bold text-slate-350">Abhik Mukherjee</span>
                      </div>
                      <span className="text-slate-400">CS-2023-0041</span>
                      <span className="font-mono font-black text-vault-accent bg-vault-accent/10 px-1.5 py-0.5 rounded">CGPA 9.80</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-white/[0.01] border border-white/5 rounded-md text-[9.5px] opacity-70">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-vault-cyan/20 text-vault-cyan font-black text-[8px] flex items-center justify-center">JD</div>
                        <span className="font-bold text-slate-350">John Doe</span>
                      </div>
                      <span className="text-slate-400">EE-2023-0105</span>
                      <span className="font-mono font-black text-vault-cyan bg-vault-cyan/10 px-1.5 py-0.5 rounded">CGPA 8.70</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users size={18} className="text-vault-accent" />
                  <span>Student Registry</span>
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">
                  Central registry to onboard, store, and manage comprehensive student profiles. Features filtering, search parameters, and structural CSV data imports.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-vault-border/20 flex justify-between items-center">
                <button onClick={handleCtaClick} className="text-[11px] font-extrabold text-vault-accent hover:underline flex items-center gap-1 cursor-pointer">
                  <span>Open Registry</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </motion.div>

            {/* Card 2: Analytics Hub */}
            <motion.div
              whileHover={{ y: -6 }}
              className="vault-glass p-6 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Card Glow Effect */}
              <div className="absolute -inset-px bg-gradient-to-tr from-vault-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

              <div>
                {/* HTML Screenshot Preview: Analytics charts */}
                <div className="w-full h-36 bg-slate-950/40 dark:bg-slate-950/70 border border-vault-border/40 rounded-lg p-3.5 mb-6 overflow-hidden flex flex-col justify-between select-none">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">Cohort Diagnostics</span>
                    <span className="text-[8px] font-bold text-vault-cyan">Live Tracker</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white/[0.02] border border-white/5 rounded-md flex flex-col justify-between h-18">
                      <span className="text-[8px] text-slate-500">Graduation Readiness</span>
                      <span className="text-sm font-bold text-vault-cyan font-mono">98.1%</span>
                    </div>
                    <div className="p-2 bg-white/[0.02] border border-white/5 rounded-md flex flex-col justify-between h-18">
                      <span className="text-[8px] text-slate-500">Attendance Average</span>
                      <span className="text-sm font-bold text-vault-emerald font-mono">94.2%</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 size={18} className="text-vault-cyan" />
                  <span>Analytics Hub</span>
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">
                  Real-time interactive dashboard visualizing cohort grading distributions, GPA semester progression, cohort attendance charts, and placement indicators.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-vault-border/20 flex justify-between items-center">
                <button onClick={handleCtaClick} className="text-[11px] font-extrabold text-vault-cyan hover:underline flex items-center gap-1 cursor-pointer">
                  <span>Open Analytics</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </motion.div>

            {/* Card 3: Portfolio Studio */}
            <motion.div
              whileHover={{ y: -6 }}
              className="vault-glass p-6 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Card Glow Effect */}
              <div className="absolute -inset-px bg-gradient-to-tr from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

              <div>
                {/* HTML Screenshot Preview: Portfolio cards */}
                <div className="w-full h-36 bg-slate-950/40 dark:bg-slate-950/70 border border-vault-border/40 rounded-lg p-3.5 mb-6 overflow-hidden flex flex-col justify-between select-none">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">Portfolio Compiler</span>
                    <span className="text-[8px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded">Active Template</span>
                  </div>
                  <div className="p-2 bg-white/[0.03] border border-white/5 rounded-md text-[9px] space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-300">Developer Portfolio</span>
                      <span className="text-[8.5px] font-mono text-vault-cyan">Theme: Obsidian</span>
                    </div>
                    <p className="text-[8px] text-slate-500 truncate">Verifiable academic achievements & co-curricular milestone logs compiled.</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award size={18} className="text-violet-400" />
                  <span>Portfolio Studio</span>
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">
                  Instantly compile, customize, and deploy academic-verified portfolios. Includes custom visual styles (Developer, Analyst, AI Engineer, Creative, Research).
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-vault-border/20 flex justify-between items-center">
                <button onClick={handleCtaClick} className="text-[11px] font-extrabold text-violet-400 hover:underline flex items-center gap-1 cursor-pointer">
                  <span>Open Studio</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </motion.div>

            {/* Card 4: AI Engine */}
            <motion.div
              whileHover={{ y: -6 }}
              className="vault-glass p-6 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Card Glow Effect */}
              <div className="absolute -inset-px bg-gradient-to-tr from-vault-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

              <div>
                {/* HTML Screenshot Preview: Copilot chat */}
                <div className="w-full h-36 bg-slate-950/40 dark:bg-slate-950/70 border border-vault-border/40 rounded-lg p-3.5 mb-6 overflow-hidden flex flex-col justify-between select-none">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">Copilot Diagnostic Console</span>
                    <span className="text-[8px] font-bold text-vault-accent">Gemini Ready</span>
                  </div>
                  <div className="p-2 bg-white/[0.03] border border-white/5 rounded-md text-[8.5px] space-y-1">
                    <span className="font-extrabold text-vault-accent">Recommendation Engine:</span>
                    <p className="text-slate-400 leading-normal">Mechanical engineering cohort represents warning boundary. Recommended action: attendance advisories.</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Brain size={18} className="text-vault-accent" />
                  <span>AI Engine</span>
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">
                  Predictive cognitive model mapping attendance patterns, grading metrics, and issuing automated educational warnings and advisories.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-vault-border/20 flex justify-between items-center">
                <button onClick={handleCtaClick} className="text-[11px] font-extrabold text-vault-accent hover:underline flex items-center gap-1 cursor-pointer">
                  <span>Open Engine</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Interactive Product Preview Section */}
      <section id="preview" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-xs font-bold font-mono text-vault-cyan uppercase tracking-widest">Interactive Previews</h2>
          <p className="text-3xl md:text-4xl font-extrabold tracking-tight">Experience the EduVault Ecosystem</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Click tabs below to inspect how individual components process student analytics.</p>
        </div>

        {/* Tab Controllers */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActivePreviewTab('analytics')}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activePreviewTab === 'analytics'
                ? 'bg-vault-accent/15 border-vault-accent/40 text-vault-accent'
                : 'border-vault-border bg-vault-card/40 hover:bg-vault-card text-slate-400 hover:text-vault-fg'
            }`}
          >
            Analytics Dashboard
          </button>
          <button
            onClick={() => setActivePreviewTab('students')}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activePreviewTab === 'students'
                ? 'bg-vault-accent/15 border-vault-accent/40 text-vault-accent'
                : 'border-vault-border bg-vault-card/40 hover:bg-vault-card text-slate-400 hover:text-vault-fg'
            }`}
          >
            Student Directory
          </button>
          <button
            onClick={() => setActivePreviewTab('portfolio')}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activePreviewTab === 'portfolio'
                ? 'bg-vault-accent/15 border-vault-accent/40 text-vault-accent'
                : 'border-vault-border bg-vault-card/40 hover:bg-vault-card text-slate-400 hover:text-vault-fg'
            }`}
          >
            Portfolio Studio
          </button>
        </div>

        {/* Tab Contents Preview Canvas */}
        <div className="vault-glass p-8 rounded-2xl border border-vault-border max-w-4xl mx-auto h-[320px] flex items-center justify-center relative overflow-hidden shadow-xl">
          
          {/* Student Directory Preview */}
          {activePreviewTab === 'students' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg space-y-4 text-left"
            >
              <div className="flex items-center space-x-3 p-4 bg-vault-card/70 border border-vault-border rounded-xl">
                <div className="h-10 w-10 rounded-full bg-vault-emerald/10 border border-vault-emerald/30 flex items-center justify-center font-bold text-vault-emerald">
                  AM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">Abhik Mukherjee</p>
                  <p className="text-xs text-slate-400 truncate">Computer Science & Engineering</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-2 py-0.5 bg-vault-emerald/15 border border-vault-emerald/30 text-vault-emerald rounded">CGPA 9.80</span>
                  <p className="text-[10px] text-slate-500 mt-1">Enrollment Active</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-vault-card/70 border border-vault-border rounded-xl">
                <div className="h-10 w-10 rounded-full bg-vault-cyan/10 border border-vault-cyan/30 flex items-center justify-center font-bold text-vault-cyan">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">John Doe</p>
                  <p className="text-xs text-slate-400 truncate">Electrical Engineering</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-2 py-0.5 bg-vault-cyan/15 border border-vault-cyan/30 text-vault-cyan rounded">CGPA 8.70</span>
                  <p className="text-[10px] text-slate-500 mt-1">Enrollment Active</p>
                </div>
              </div>

              <div className="p-3 bg-vault-bg/40 border border-vault-border/50 border-dashed text-center text-xs text-slate-500 rounded-xl font-semibold">
                + View remaining 124 enrolled students
              </div>
            </motion.div>
          )}

          {/* Analytics Preview */}
          {activePreviewTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md space-y-6 text-left"
            >
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Cohort CGPA Distribution</h4>
                <div className="h-4 w-full bg-vault-border/50 rounded-full overflow-hidden flex">
                  <div className="bg-vault-emerald h-full" style={{ width: '45%' }} title="9.0 - 10.0 CGPA (45%)" />
                  <div className="bg-vault-cyan h-full" style={{ width: '35%' }} title="8.0 - 9.0 CGPA (35%)" />
                  <div className="bg-vault-accent h-full" style={{ width: '15%' }} title="6.0 - 8.0 CGPA (15%)" />
                  <div className="bg-red-500 h-full" style={{ width: '5%' }} title="Below 6.0 CGPA (5%)" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-vault-card/60 border border-vault-border rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Class Attendance Average</span>
                  <p className="text-2xl font-bold text-vault-emerald">94.2%</p>
                </div>
                <div className="p-4 bg-vault-card/60 border border-vault-border rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Graduation Readiness Index</span>
                  <p className="text-2xl font-bold text-vault-cyan">98.1%</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Portfolio Studio Preview */}
          {activePreviewTab === 'portfolio' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm p-6 bg-vault-card/70 border border-vault-border rounded-2xl relative shadow-lg text-left"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">Machine Learning Research Badge</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Verified Co-Curricular Milestone</p>
                </div>
                <Award className="text-vault-emerald" size={24} />
              </div>
              <div className="p-3 bg-vault-bg/60 border border-vault-border rounded-lg text-[10px] space-y-1 font-medium text-slate-500">
                <p><span className="text-slate-800 dark:text-slate-350 font-bold">Issuer:</span> EduVault Academic Registry</p>
                <p><span className="text-slate-800 dark:text-slate-350 font-bold">Metadata:</span> Verified by ML Lab Committee</p>
                <p><span className="text-slate-800 dark:text-slate-350 font-bold">Hash ID:</span> <span className="font-mono text-vault-cyan">0x7f4e...9d12</span></p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Cryptographic Security Section */}
      <section id="security" className="py-24 border-t border-vault-border/40 bg-vault-card/5 relative">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs font-bold font-mono text-vault-emerald uppercase tracking-widest">Enterprise Cryptography</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Institutional Integrity Guaranteed</h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Academic credentials require absolute tamper-proofing. EduVault AI employs cryptographic verification, secure multi-role partitions, and immutable record hashing.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-vault-emerald/10 border border-vault-emerald/20 text-vault-emerald mt-1 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cryptographic Badge Verification</h4>
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Generated student portfolios contain cryptographic signature hashes verifying institutional authorization hashes directly to recruitment pipelines.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-vault-cyan/10 border border-vault-cyan/20 text-vault-cyan mt-1 shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Role-Based Session Boundaries</h4>
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Granular authorization maps separate administrative operations, grade registrars, and student review coordinators via strict Firebase security rules.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] mt-1 shrink-0">
                  <Cpu size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Compute Audit Trails</h4>
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">All grade recalculations and cohort modification requests compile with digital log headers tracking operator signatures.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            {/* Visual Security Key Vault Diagram */}
            <div className="w-full max-w-sm aspect-square vault-glass rounded-2xl border border-vault-border p-6 relative flex items-center justify-center overflow-hidden shadow-2xl">
              <div className="absolute w-60 h-60 rounded-full bg-vault-emerald/5 blur-[50px]" />
              <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 overflow-visible">
                {/* Outer concentric lines */}
                <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                {/* Central lock shield */}
                <motion.g
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path
                    d="M100 50 C118 50 135 45 135 45 C135 90 122 130 100 150 C78 130 65 90 65 45 C65 45 82 50 100 50 Z"
                    fill="var(--vault-card)"
                    stroke="var(--color-vault-accent)"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    className="shadow-lg"
                  />
                  <rect x="85" y="85" width="30" height="24" rx="4" fill="var(--color-vault-cyan)" stroke="var(--vault-bg)" strokeWidth="1.5" />
                  <path d="M91 85 V77 C91 71 95 67 100 67 C105 67 109 71 109 77 V85" fill="none" stroke="var(--color-vault-cyan)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="97" r="2.5" fill="var(--vault-bg)" />
                </motion.g>
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* Compact CTA Strip */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="w-full vault-glass p-8 md:p-12 rounded-2xl border border-vault-border/60 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          {/* Subtle backing grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          
          <div className="space-y-2 relative z-10 max-w-xl">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Ready to modernize your academic registry?</h3>
            <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
              Launch EduVault AI in under 5 minutes and connect Google Auth or local institutional credentials directly.
            </p>
          </div>

          <button
            onClick={handleCtaClick}
            className="px-6 py-3.5 bg-gradient-to-r from-vault-accent to-vault-cyan text-white text-xs font-black tracking-wide rounded-xl shadow-lg hover:shadow-vault-accent/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 relative z-10"
          >
            Launch Platform
          </button>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="border-t border-vault-border/40 py-12 bg-vault-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-2 text-center md:text-left">
            <EduVaultLogo showText={true} iconSize={68} textSize="text-xl" />
            <p className="text-[10px] text-slate-400 font-semibold max-w-xs">
              Student Intelligence Platform combining profile management, cohort analytics, and achievement credentials.
            </p>
          </div>

          {/* Drastically simplified link structures */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-vault-accent transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('security')} className="hover:text-vault-accent transition-colors cursor-pointer">Security</button>
            <button onClick={() => scrollToSection('preview')} className="hover:text-vault-accent transition-colors cursor-pointer">Portfolio Studio</button>
            <Link to="/login" className="hover:text-vault-accent transition-colors">Sign In</Link>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 mt-8 pt-6 border-t border-vault-border/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} EduVault AI. All institutional rights reserved.</p>
        </div>
      </footer>
      
    </div>
  )
}
