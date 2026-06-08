import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Award,
  Sparkles,
  LayoutDashboard,
  Brain,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'students' | 'analytics' | 'portfolio'>('analytics')

  // Smooth scroll helper with tab activation support
  const scrollToSection = (id: string, tab?: 'students' | 'analytics' | 'portfolio') => {
    if (tab) {
      setActiveTab(tab)
    }
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
    <div className="relative min-h-screen bg-vault-bg text-vault-fg transition-colors duration-300 selection:bg-vault-emerald/30 selection:text-vault-emerald">
      
      {/* Visual Stripe/Linear Grid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.08]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Radial Soft Green Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-vault-emerald/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-1/4 w-[600px] h-[600px] rounded-full bg-vault-cyan/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-10 w-[400px] h-[400px] rounded-full bg-vault-emerald/5 blur-[120px] pointer-events-none z-0" />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-vault-border/40 bg-vault-bg/75 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <button 
            onClick={() => scrollToSection('hero')} 
            className="flex items-center space-x-3 cursor-pointer text-left bg-transparent border-none p-0 focus:outline-none"
            aria-label="EduVault AI Home"
          >
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-vault-emerald to-vault-cyan flex items-center justify-center font-bold text-white shadow-md shadow-vault-emerald/20">
              EV
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-vault-fg to-vault-fg/80 bg-clip-text text-transparent">
              EduVault AI
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button onClick={() => scrollToSection('features')} className="text-slate-400 hover:text-vault-emerald transition-colors">Features</button>
            <button onClick={() => scrollToSection('preview', 'analytics')} className="text-slate-400 hover:text-vault-emerald transition-colors">Analytics</button>
            <button onClick={() => scrollToSection('preview', 'students')} className="text-slate-400 hover:text-vault-emerald transition-colors">Students</button>
            <button onClick={() => scrollToSection('preview', 'portfolio')} className="text-slate-400 hover:text-vault-emerald transition-colors">Portfolio Studio</button>
          </nav>

          {/* Action Triggers */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-vault-border/50 hover:bg-vault-card transition-colors text-slate-400 hover:text-vault-fg"
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-vault-card hover:bg-vault-border/40 border border-vault-border rounded-lg text-sm font-semibold transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-vault-emerald transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-vault-accent hover:bg-vault-accent/90 text-white rounded-lg text-sm font-semibold shadow-lg shadow-vault-accent/15 hover:shadow-vault-accent/25 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-vault-fg"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-vault-fg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-b border-vault-border bg-vault-card px-6 py-4 space-y-3 flex flex-col text-sm font-medium"
          >
            <button onClick={() => scrollToSection('features')} className="text-left py-2 text-slate-400 hover:text-vault-emerald transition-colors">Features</button>
            <button onClick={() => scrollToSection('preview', 'analytics')} className="text-left py-2 text-slate-400 hover:text-vault-emerald transition-colors">Analytics</button>
            <button onClick={() => scrollToSection('preview', 'students')} className="text-left py-2 text-slate-400 hover:text-vault-emerald transition-colors">Students</button>
            <button onClick={() => scrollToSection('preview', 'portfolio')} className="text-left py-2 text-slate-400 hover:text-vault-emerald transition-colors">Portfolio Studio</button>
            <hr className="border-vault-border/50" />
            {isAuthenticated ? (
              <Link to="/dashboard" className="flex items-center space-x-2 py-2 text-vault-fg">
                <LayoutDashboard size={18} />
                <span>Launch Dashboard</span>
              </Link>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link to="/login" className="text-center py-2 border border-vault-border rounded-lg text-slate-300 hover:bg-vault-border/20 transition-all">Sign In</Link>
                <Link to="/register" className="text-center py-2 bg-vault-accent text-white rounded-lg transition-all shadow-md">Get Started</Link>
              </div>
            )}
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-vault-emerald/20 bg-vault-emerald/5 text-vault-emerald text-xs font-semibold tracking-wide mb-6"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>Next Generation Student Information Ecosystem</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-900 dark:text-white leading-[1.1]"
        >
          The intelligent layer for <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-vault-emerald via-vault-cyan to-vault-accent bg-clip-text text-transparent">
            academic excellence.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed"
        >
          EduVault AI combines student profile management, predictive academic analytics, and digital achievement tracking to deliver a unified Student Intelligence Platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <button
            onClick={handleCtaClick}
            className="flex items-center space-x-2 px-6 py-3 bg-vault-accent hover:bg-vault-accent/90 text-white font-semibold rounded-xl shadow-xl shadow-vault-accent/20 hover:shadow-vault-accent/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <span>Launch Platform</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* 3D Depth Floating Hero Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl mt-16 p-3 rounded-2xl border border-vault-border bg-vault-card/45 backdrop-blur shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-vault-emerald/5 to-vault-cyan/5 rounded-2xl pointer-events-none" />
          
          {/* Glassmorphism Dashboard Mockup */}
          <div className="vault-glass rounded-xl overflow-hidden shadow-inner border border-vault-border/50">
            {/* Window bar */}
            <div className="h-10 border-b border-vault-border/50 bg-vault-bg/60 flex items-center px-4 justify-between">
              <div className="flex space-x-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs font-mono text-slate-500 flex items-center space-x-1.5 bg-vault-bg px-4 py-1 rounded border border-vault-border/40">
                <span>eduvault-ai.web.app/dashboard</span>
              </div>
              <div className="w-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 h-[400px]">
              {/* Sidebar shell */}
              <div className="hidden md:flex flex-col p-4 border-r border-vault-border/50 bg-vault-card/30 text-left space-y-4">
                <div className="h-5 w-24 bg-vault-border/60 rounded" />
                <div className="space-y-2 pt-4">
                  <div className="h-7 w-full bg-vault-emerald/10 border border-vault-emerald/20 rounded-lg" />
                  <div className="h-7 w-[85%] bg-vault-border/40 rounded-lg" />
                  <div className="h-7 w-[90%] bg-vault-border/40 rounded-lg" />
                  <div className="h-7 w-[75%] bg-vault-border/40 rounded-lg" />
                </div>
              </div>
              
              {/* Canvas shell */}
              <div className="md:col-span-3 p-6 flex flex-col space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-5 w-40 bg-vault-border/80 rounded" />
                    <div className="h-3 w-60 bg-vault-border/40 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-vault-emerald/20 border border-vault-emerald/40 rounded-lg" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="vault-glass p-4 rounded-xl border border-vault-border/50 space-y-2">
                    <div className="h-3 w-16 bg-vault-border/60 rounded" />
                    <div className="h-6 w-20 bg-vault-emerald/25 border border-vault-emerald/20 rounded" />
                  </div>
                  <div className="vault-glass p-4 rounded-xl border border-vault-border/50 space-y-2">
                    <div className="h-3 w-16 bg-vault-border/60 rounded" />
                    <div className="h-6 w-16 bg-vault-cyan/25 border border-vault-cyan/20 rounded" />
                  </div>
                  <div className="vault-glass p-4 rounded-xl border border-vault-border/50 space-y-2">
                    <div className="h-3 w-16 bg-vault-border/60 rounded" />
                    <div className="h-6 w-10 bg-vault-accent/25 border border-vault-accent/20 rounded" />
                  </div>
                </div>

                {/* Graph mockup */}
                <div className="flex-1 bg-vault-bg/60 border border-vault-border/40 rounded-xl p-4 flex flex-col justify-between">
                  <div className="h-3 w-28 bg-vault-border/50 rounded" />
                  <div className="flex items-end justify-between h-28 pt-4">
                    <div className="w-[10%] h-[40%] bg-vault-emerald/20 border border-vault-emerald/40 rounded-t" />
                    <div className="w-[10%] h-[60%] bg-vault-emerald/40 border border-vault-emerald/50 rounded-t" />
                    <div className="w-[10%] h-[80%] bg-gradient-to-t from-vault-emerald/30 to-vault-cyan/40 border border-vault-cyan/40 rounded-t" />
                    <div className="w-[10%] h-[55%] bg-vault-emerald/20 border border-vault-emerald/40 rounded-t" />
                    <div className="w-[10%] h-[70%] bg-vault-emerald/40 border border-vault-emerald/50 rounded-t" />
                    <div className="w-[10%] h-[95%] bg-gradient-to-t from-vault-emerald to-vault-cyan border border-vault-emerald/60 rounded-t shadow-lg shadow-vault-emerald/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Grid of Key Features */}
      <section id="features" className="py-24 border-t border-vault-border/40 bg-vault-card/25 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-mono text-vault-emerald uppercase tracking-widest">Architectural Advantage</h2>
            <p className="text-slate-400">EduVault AI consolidates student records into a secure, easily manageable SaaS dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ y: -6 }}
              className="vault-glass p-8 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-vault-cyan/10 border border-vault-cyan/20 flex items-center justify-center text-vault-cyan mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold">AI Diagnostics Engine</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Predictive algorithms analyze individual student grade matrices and cohort attendance rates, generating proactive alert flags and recommended interventions.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="vault-glass p-8 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-vault-accent/10 border border-vault-accent/20 flex items-center justify-center text-vault-accent mb-6">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold">Portfolio Studio</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Digital achievements showcase for student credentials, verifiable research logs, and co-curricular milestones built directly into the student profile.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Product Preview Section */}
      <section id="preview" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-xs font-mono text-vault-cyan uppercase tracking-widest">Interactive Previews</h2>
          <p className="text-3xl md:text-4xl font-bold tracking-tight">Experience the EduVault Ecosystem</p>
          <p className="text-slate-400">Click tabs below to inspect how individual components process student analytics.</p>
        </div>

        {/* Tab Controllers */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-vault-emerald/10 border-vault-emerald/40 text-vault-emerald'
                : 'border-vault-border hover:bg-vault-card text-slate-400'
            }`}
          >
            Analytics Dashboard Preview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              activeTab === 'students'
                ? 'bg-vault-emerald/10 border-vault-emerald/40 text-vault-emerald'
                : 'border-vault-border hover:bg-vault-card text-slate-400'
            }`}
          >
            Student Management Preview
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              activeTab === 'portfolio'
                ? 'bg-vault-emerald/10 border-vault-emerald/40 text-vault-emerald'
                : 'border-vault-border hover:bg-vault-card text-slate-400'
            }`}
          >
            Portfolio Studio Preview
          </button>
        </div>

        {/* Tab Contents Preview Canvas */}
        <div className="vault-glass p-8 rounded-2xl border border-vault-border max-w-4xl mx-auto h-[400px] flex items-center justify-center relative overflow-hidden shadow-xl">
          
          {/* Student Management Preview */}
          {activeTab === 'students' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg space-y-4 text-left"
            >
              <div className="flex items-center space-x-3 p-4 bg-vault-card/60 border border-vault-border rounded-xl">
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

              <div className="flex items-center space-x-3 p-4 bg-vault-card/60 border border-vault-border rounded-xl">
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

              <div className="p-4 bg-vault-bg/60 border border-vault-border/50 border-dashed text-center text-xs text-slate-500 rounded-xl">
                + View remaining 124 enrolled students
              </div>
            </motion.div>
          )}

          {/* Analytics Preview */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md space-y-6 text-left"
            >
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Cohort CGPA Distribution</h4>
                <div className="h-4 w-full bg-vault-border/40 rounded-full overflow-hidden flex">
                  <div className="bg-vault-emerald h-full" style={{ width: '45%' }} title="9.0 - 10.0 CGPA (45%)" />
                  <div className="bg-vault-cyan h-full" style={{ width: '35%' }} title="8.0 - 9.0 CGPA (35%)" />
                  <div className="bg-vault-accent h-full" style={{ width: '15%' }} title="6.0 - 8.0 CGPA (15%)" />
                  <div className="bg-vault-destructive h-full" style={{ width: '5%' }} title="Below 6.0 CGPA (5%)" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-vault-card/50 border border-vault-border rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400">Class Attendance Average</span>
                  <p className="text-2xl font-bold text-vault-emerald">94.2%</p>
                </div>
                <div className="p-4 bg-vault-card/50 border border-vault-border rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400">Graduation Readiness Index</span>
                  <p className="text-2xl font-bold text-vault-cyan">98.1%</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Portfolio Studio Preview */}
          {activeTab === 'portfolio' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm p-6 bg-vault-card/60 border border-vault-border rounded-2xl relative shadow-lg text-left"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-base font-bold">Machine Learning Research Badge</h4>
                  <p className="text-xs text-slate-400 mt-1">Verified Co-Curricular Milestone</p>
                </div>
                <Award className="text-vault-emerald" size={24} />
              </div>
              <div className="p-3 bg-vault-bg/60 border border-vault-border rounded-lg text-xs space-y-1">
                <p className="text-slate-400"><span className="text-vault-fg font-semibold">Issuer:</span> EduVault Academic Registry</p>
                <p className="text-slate-400"><span className="text-vault-fg font-semibold">Metadata:</span> Verified by ML Lab Committee</p>
                <p className="text-slate-400"><span className="text-vault-fg font-semibold">Hash ID:</span> <span className="font-mono text-vault-cyan">0x7f4e...9d12</span></p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Why EduVault AI Section */}
      <section className="py-24 border-t border-vault-border/40 bg-vault-card/5 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono text-vault-emerald uppercase tracking-widest">Why EduVault AI</h2>
            <p className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Built for modern academic synergy.</p>
            <p className="text-slate-500 dark:text-slate-400">A student intelligence layer that shifts records management from standard spreadsheets to predictive, verifiable institutional tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="vault-glass p-8 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Centralized Staff Collaboration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect faculty, administrators, and coordinators on a single dashboard, eliminating departmental records silos.
              </p>
            </div>
            <div className="vault-glass p-8 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Proactive Growth Guidance</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlock automated performance warnings, attendance trends, and graduation readiness indexes configured to support student retention.
              </p>
            </div>
            <div className="vault-glass p-8 rounded-2xl border border-vault-border/60 hover:border-vault-emerald/30 transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Verifiable Student Showcases</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Instantly generate verifiable milestone logs and skill badge credentials that students can export to build their professional portfolios.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Conversion Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-gradient-to-tr from-vault-emerald to-vault-cyan p-12 rounded-3xl text-center shadow-2xl shadow-vault-emerald/10 relative overflow-hidden border border-vault-emerald/20"
        >
          {/* Overlay elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to modernize your academic registry?
            </h2>
            <p className="text-white/85 text-base md:text-lg">
              Launch EduVault AI in under 5 minutes and connect Google Auth or local credentials directly.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleCtaClick}
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                Access Dashboard
              </button>
              <Link
                to="/register"
                className="px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors text-center"
              >
                Create Staff Account
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-vault-border/40 py-16 bg-vault-card/35 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-vault-emerald to-vault-cyan flex items-center justify-center font-bold text-white">
                EV
              </div>
              <span className="text-lg font-bold tracking-tight">EduVault AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A premium Student Intelligence Platform combining student records management, predictive cohort analytics, and digital achievement verification.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400 text-left">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-vault-emerald transition-colors text-left cursor-pointer">Platform Features</button></li>
              <li><button onClick={() => scrollToSection('preview', 'analytics')} className="hover:text-vault-emerald transition-colors text-left cursor-pointer">Analytics Dashboard</button></li>
              <li><button onClick={() => scrollToSection('preview', 'students')} className="hover:text-vault-emerald transition-colors text-left cursor-pointer">Student Directory</button></li>
              <li><button onClick={() => scrollToSection('preview', 'portfolio')} className="hover:text-vault-emerald transition-colors text-left cursor-pointer">Portfolio Studio</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-200">Institutional</h4>
            <ul className="space-y-2 text-xs text-slate-400 text-left">
              <li><Link to="/login" className="hover:text-vault-emerald transition-colors block text-left">Staff Sign In</Link></li>
              <li><Link to="/register" className="hover:text-vault-emerald transition-colors block text-left">Create Staff Account</Link></li>
              <li><Link to="/api-docs" className="hover:text-vault-emerald transition-colors block text-left">API Documentation</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 mt-12 pt-8 border-t border-vault-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EduVault AI. All institutional rights reserved.</p>
        </div>
      </footer>
      
    </div>
  )
}
