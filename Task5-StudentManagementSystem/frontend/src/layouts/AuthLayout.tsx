import React, { useState, useMemo, useRef } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, ArrowLeft, Database, Award, Sparkles, Brain } from 'lucide-react'
import { motion } from 'motion/react'

// Premium Interactive Futuristic Centerpiece representing Academic Intelligence
const AcademicIntelligenceVisualizer = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 6 + 6,
      delay: Math.random() * -12,
      opacity: Math.random() * 0.4 + 0.15,
    }))
  }, [])

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      setTilt({
        x: -y / 18,
        y: x / 18,
      })
    }

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 })
    }

    const el = containerRef.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[500px] h-[500px] flex items-center justify-center select-none cursor-default"
      style={{ perspective: 1200 }}
    >
      {/* Background Soft Ambient Glow */}
      <div className="absolute w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-vault-cyan/15 to-vault-accent/15 blur-[90px] -z-10" />

      {/* Floating particles background inside visualizer bounds */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-vault-cyan/35 dark:bg-vault-accent/25 pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -45, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* Main 3D tilt container */}
      <motion.div
        className="relative w-[450px] h-[450px] flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{
          type: "spring",
          stiffness: 85,
          damping: 20,
        }}
      >
        {/* Constellation Lines & Flow Paths */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible select-none pointer-events-none z-0"
          viewBox="0 0 500 500"
        >
          <defs>
            <linearGradient id="grad-portfolio" x1="250" y1="250" x2="100" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-vault-cyan)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="grad-analytics" x1="250" y1="250" x2="400" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="grad-placement" x1="250" y1="250" x2="250" y2="410" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-vault-emerald)" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Connection vectors */}
          <path d="M 250 250 L 100 150" stroke="url(#grad-portfolio)" strokeWidth="1.5" strokeDasharray="4,4" />
          <path d="M 250 250 L 400 150" stroke="url(#grad-analytics)" strokeWidth="1.5" strokeDasharray="4,4" />
          <path d="M 250 250 L 250 410" stroke="url(#grad-placement)" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Sub-connections building depth */}
          <path d="M 250 250 L 185 225" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
          <path d="M 250 250 L 315 225" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
          <path d="M 250 250 L 205 320" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
          <path d="M 250 250 L 295 320" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
          <path d="M 185 225 L 100 150" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
          <path d="M 315 225 L 400 150" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
          <path d="M 205 320 L 250 410" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
          <path d="M 295 320 L 250 410" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
          <path d="M 185 225 L 205 320" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
          <path d="M 315 225 L 295 320" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />

          {/* Ecosystem network intersections */}
          <circle cx="185" cy="225" r="3" className="fill-vault-cyan/50" />
          <circle cx="315" cy="225" r="3" className="fill-purple-500/50" />
          <circle cx="205" cy="320" r="3" className="fill-vault-emerald/50" />
          <circle cx="295" cy="320" r="3" className="fill-vault-emerald/50" />

          {/* Animated data transfer signals */}
          <motion.path
            d="M 250 250 L 100 150"
            stroke="var(--color-vault-cyan)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDasharray: "15, 120", strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -135 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 250 250 L 400 150"
            stroke="#a855f7"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDasharray: "15, 120", strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -135 }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 250 250 L 250 410"
            stroke="var(--color-vault-emerald)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDasharray: "15, 180", strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -195 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* --- CENTERPIECE: AI Brain Core --- */}
        <div className="absolute top-[225px] left-[225px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none select-none">
          {/* Glowing pulse ring */}
          <motion.div
            className="absolute w-36 h-36 rounded-full border border-vault-accent/30 bg-vault-accent/5"
            animate={{
              scale: [0.95, 1.15, 0.95],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Clockwise rotating dashed orbit ring */}
          <motion.div
            className="absolute w-28 h-28 rounded-full border border-dashed border-vault-cyan/30"
            animate={{ rotate: 360 }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Counter-clockwise rotating dashed orbit ring */}
          <motion.div
            className="absolute w-24 h-24 rounded-full border border-dashed border-vault-accent/30"
            animate={{ rotate: -360 }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* 3D Central Core Glassmorphic Badge */}
          <motion.div
            className="relative w-16 h-16 rounded-full bg-slate-900/90 dark:bg-slate-950/95 border-2 border-vault-accent/50 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)] pointer-events-auto cursor-pointer"
            style={{ transform: "translateZ(20px)" }}
            whileHover={{ scale: 1.1, rotate: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
          >
            <Brain className="w-8 h-8 text-vault-accent animate-pulse" />
            <Sparkles className="absolute -top-1.5 -right-1.5 w-4 h-4 text-vault-cyan" />
          </motion.div>
        </div>

        {/* --- TOP LEFT: Orbiting Credential System (translateZ: 60px) --- */}
        <motion.div
          className="absolute top-[150px] left-[100px] -translate-x-1/2 -translate-y-1/2 p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl z-20 flex flex-col items-center justify-center gap-1.5 w-[140px] hover:border-vault-accent/40 transition-colors duration-300 pointer-events-auto"
          style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.05, y: -4 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {/* Badges Stack */}
          <div className="relative flex -space-x-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md">
              <Award className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-vault-cyan to-blue-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-vault-emerald to-teal-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md">
              <Database className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">Portfolio System</span>
          <span className="text-[8px] font-bold text-vault-cyan bg-vault-cyan/10 dark:bg-vault-cyan/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">8 Badges Sync</span>
        </motion.div>

        {/* --- TOP RIGHT: Orbiting Analytics Matrix (translateZ: 40px) --- */}
        <motion.div
          className="absolute top-[150px] left-[400px] -translate-x-1/2 -translate-y-1/2 p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl z-20 w-[170px] hover:border-vault-cyan/40 transition-colors duration-300 flex flex-col gap-1 pointer-events-auto"
          style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.05, y: -4 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">Academic Growth</span>
            <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">+12.4%</span>
          </div>
          <div className="h-9 w-full mt-1 overflow-visible">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-vault-cyan)" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--color-vault-cyan)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,25 C15,22 25,2 40,15 C55,25 70,5 100,8"
                fill="none"
                stroke="url(#lineGlow)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
              <motion.circle
                cx="100"
                cy="8"
                r="3"
                className="fill-vault-cyan shadow-lg"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </svg>
          </div>
          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">Real-time performance cohort</span>
        </motion.div>

        {/* --- BOTTOM CENTER: Orbiting Placement Readiness (translateZ: 85px) --- */}
        <motion.div
          className="absolute top-[410px] left-[250px] -translate-x-1/2 -translate-y-1/2 p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl z-20 w-[190px] hover:border-vault-emerald/40 transition-colors duration-300 flex items-center gap-3 pointer-events-auto"
          style={{ transform: "translateZ(85px)", transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.05, y: 4 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {/* Gauge */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="20" cy="20" r="16" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="3.2" fill="transparent" />
              <motion.circle
                cx="20"
                cy="20"
                r="16"
                stroke="var(--color-vault-emerald)"
                strokeWidth="3.2"
                fill="transparent"
                strokeDasharray="100.5"
                initial={{ strokeDashoffset: 100.5 }}
                animate={{ strokeDashoffset: 100.5 * (1 - 0.94) }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-[9px] font-black text-slate-800 dark:text-white font-mono">94%</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">Placement Readiness</p>
            <p className="text-[8px] text-slate-400 dark:text-slate-500">Tier-1 cohort index optimized</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen w-screen flex flex-col lg:grid lg:grid-cols-10 bg-vault-bg font-sans overflow-x-hidden relative transition-colors duration-300">
      
      {/* LEFT COLUMN: Clean Institutional Authentication Panel (40% width on desktop) */}
      <div className="col-span-10 lg:col-span-4 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden bg-vault-bg min-h-screen z-10">
        
        {/* Top bar controls */}
        <div className="w-full flex justify-between items-center z-20">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-vault-fg transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-vault-border/50 hover:bg-slate-50 dark:hover:bg-vault-card transition-all text-slate-400 hover:text-vault-fg shadow-sm flex items-center justify-center cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Form Container Card - Floating Glass Card */}
        <div className="my-auto py-8 flex justify-center items-center w-full">
          <div className="relative w-full max-w-md group">
            {/* Ambient Soft Glow Behind the Login Card */}
            <div className="absolute -inset-2 bg-gradient-to-r from-vault-accent/15 to-vault-cyan/15 rounded-2xl blur-3xl opacity-60 dark:opacity-45 group-hover:opacity-80 transition duration-1000 -z-10" />
            
            {/* Gradient Border Wrapper */}
            <div className="rounded-2xl p-[1px] bg-gradient-to-b from-slate-200/60 to-slate-300/40 dark:from-white/10 dark:to-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-500">
              {/* Floating Glassmorphic Container */}
              <div className="w-full bg-white/45 dark:bg-[#070b14]/50 backdrop-blur-2xl p-8 rounded-[15px] relative z-10 transition-all duration-300">
                
                {/* Mobile/Tablet Header: branding details */}
                <div className="flex flex-col items-center mb-8 lg:hidden">
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-tr from-vault-emerald to-vault-cyan flex items-center justify-center font-bold text-white text-lg shadow-md mb-2">
                    EV
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-vault-fg">EduVault AI</h2>
                  <p className="text-xs text-slate-400">Student Intelligence Platform</p>
                </div>

                {/* Active page route (Login / Register form) */}
                <div className="w-full">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer copyright */}
        <div className="text-center lg:text-left text-[11px] text-slate-400 dark:text-slate-500 z-10">
          &copy; {new Date().getFullYear()} EduVault AI. All institutional rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Premium Student Intelligence Dashboard Visualization (60% width on desktop) */}
      <div className="col-span-10 lg:col-span-6 flex flex-col justify-between items-center p-8 sm:p-12 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/5 relative overflow-hidden min-h-[600px] lg:min-h-screen">
        
        {/* Background Mesh Gradients & Animated Soft Orbs */}
        <div className="absolute inset-0 bg-slate-50/30 dark:bg-[#070b14] overflow-hidden pointer-events-none z-0">
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:30px_30px] opacity-100" />
          
          {/* Animated Glow Orb 1 */}
          <motion.div 
            className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-vault-cyan/12 dark:bg-vault-cyan/10 blur-[110px]"
            animate={{
              x: [0, 45, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Animated Glow Orb 2 */}
          <motion.div 
            className="absolute -bottom-[10%] -right-[10%] w-[65%] h-[65%] rounded-full bg-vault-accent/12 dark:bg-vault-accent/8 blur-[120px]"
            animate={{
              x: [0, -35, 0],
              y: [0, -45, 0],
            }}
            transition={{
              duration: 17,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Soft Central blending glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] rounded-full bg-gradient-to-tr from-[#0ea5e9]/5 to-[#10b981]/5 blur-[90px] opacity-50" />
        </div>

        {/* Brand logo at the top */}
        <div className="relative z-10 w-full flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-vault-emerald to-vault-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-vault-emerald/20">
              EV
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                EduVault AI
              </h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono tracking-wider">STUDENT INTELLIGENCE PLATFORM</p>
            </div>
          </div>
        </div>

        {/* Futuristic Academic Intelligence Visualizer centerpiece */}
        <div className="relative w-full flex-1 flex items-center justify-center z-10 py-4">
          <AcademicIntelligenceVisualizer />
        </div>

        {/* Spacer bottom */}
        <div className="w-full h-4" />

      </div>

    </div>
  )
}
