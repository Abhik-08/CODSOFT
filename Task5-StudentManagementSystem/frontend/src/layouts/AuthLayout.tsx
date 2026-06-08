import React, { useState, useRef } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'

// Theme-dependent styles mapping for the visualizer to minimize Cognitive Complexity
const VISUALIZER_THEME = {
  dark: {
    strokeColor: '#eaacd2',
    boneColor: '#fbf8ff',
    bubbleBg: '#5d1c44',
    dotsColor: '#ffffff',
    laptopLid: '#3d3b45',
    keyboardBg: '#2e2c36',
    l1: '#7a2b4b',
    l2: '#a855f7',
    l3: '#ea53ab',
    l4: '#06b6d4',
    glowColor: '#eaacd2',
    glowOpacity: 0.15,
    ringColor: '#eaacd2',
    moonColor: '#a855f7',
    orb1Color: '#ea53ab',
    orb2Color: '#06b6d4',
    starColor: '#eaacd2',
    socketColor: '#151419',
    pupilColor: '#eaacd2',
    trackpadColor: '#474554',
  },
  light: {
    strokeColor: '#4a1535',
    boneColor: '#fdfcf7',
    bubbleBg: '#4c1233',
    dotsColor: '#ffffff',
    laptopLid: '#ced1d1',
    keyboardBg: '#a7a9ac',
    l1: '#7a2b4b',
    l2: '#bc4642',
    l3: '#d67645',
    l4: '#ecac52',
    glowColor: '#fdedd6',
    glowOpacity: 0.85,
    ringColor: '#ba3f42',
    moonColor: '#d67645',
    orb1Color: '#781f5a',
    orb2Color: '#bc4642',
    starColor: '#ecac52',
    socketColor: '#321025',
    pupilColor: '#e56b8f',
    trackpadColor: '#80868b',
  }
}

// Premium Interactive Skeleton Developer Visualizer mockup
const SkeletonDeveloperVisualizer = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const styles = isDark ? VISUALIZER_THEME.dark : VISUALIZER_THEME.light
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      setTilt({
        x: -y / 25,
        y: x / 25,
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
      className="relative w-full max-w-[550px] h-[450px] flex items-center justify-center select-none cursor-default"
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
      >
        {/* Floating stars, planets, and background elements inside SVG */}
        <svg
          className="w-full h-full overflow-visible select-none"
          viewBox="0 0 800 500"
        >
          <defs>
            <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={styles.glowColor} stopOpacity={styles.glowOpacity} />
              <stop offset="100%" stopColor={styles.glowColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="planet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c93e43" />
              <stop offset="100%" stopColor="#7a2b4b" />
            </linearGradient>
          </defs>

          {/* Central Ambient Glow */}
          <circle cx="400" cy="270" r="220" fill="url(#glow-grad)" />

          {/* Planet (top left) */}
          <g transform="translate(0, 0)">
            {/* Back part of planet ring */}
            <path d="M 50,110 A 65,18 0 0 1 170,105" fill="none" stroke={styles.ringColor} strokeWidth="6" transform="rotate(-15, 110, 110)" strokeLinecap="round" />
            {/* Planet body */}
            <circle cx="110" cy="110" r="40" fill="url(#planet-grad)" stroke={styles.strokeColor} strokeWidth="2.5" />
            {/* Front part of planet ring */}
            <path d="M 170,105 A 65,18 0 0 1 50,110" fill="none" stroke={styles.ringColor} strokeWidth="6" transform="rotate(-15, 110, 110)" strokeLinecap="round" />
          </g>

          {/* Small moon/planet (top left lower) */}
          <g transform="translate(180, 150)">
            <ellipse cx="0" cy="0" rx="20" ry="5" fill="none" stroke={styles.strokeColor} strokeWidth="1.5" transform="rotate(-10, 0, 0)" />
            <circle cx="0" cy="0" r="11" fill={styles.moonColor} stroke={styles.strokeColor} strokeWidth="2" />
          </g>

          {/* Small purple/magenta orb (mid right) */}
          <circle cx="680" cy="220" r="14" fill={styles.orb1Color} stroke={styles.strokeColor} strokeWidth="2.5" />
          <circle cx="170" cy="330" r="9" fill={styles.orb2Color} stroke={styles.strokeColor} strokeWidth="2" />

          {/* Floating Stars */}
          <path d="M 300,50 L 302,58 L 310,60 L 302,62 L 300,70 L 298,62 L 290,60 L 298,58 Z" fill={styles.starColor} />
          <path d="M 620,70 L 622,78 L 630,80 L 622,82 L 620,90 L 618,82 L 610,80 L 618,78 Z" fill={styles.starColor} />
          <path d="M 500,100 L 501,104 L 505,105 L 501,106 L 500,110 L 499,106 L 495,105 L 499,104 Z" fill={styles.starColor} />

          {/* Left Speech Bubble (Password) */}
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M 145,140 L 255,140 A 15,15 0 0 1 270,155 L 270,185 A 15,15 0 0 1 255,200 L 240,200 L 255,220 L 225,200 L 145,200 A 15,15 0 0 1 130,185 L 130,155 A 15,15 0 0 1 145,140 Z"
              fill={styles.bubbleBg}
              stroke={styles.strokeColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="165" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="179" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="193" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="207" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="221" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="235" cy="170" r="4.5" fill={styles.dotsColor} />
          </motion.g>

          {/* Right Speech Bubble (Password) */}
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <path
              d="M 545,140 L 655,140 A 15,15 0 0 1 670,155 L 670,185 A 15,15 0 0 1 655,200 L 575,200 L 545,220 L 560,200 L 545,200 A 15,15 0 0 1 530,185 L 530,155 A 15,15 0 0 1 545,140 Z"
              fill={styles.bubbleBg}
              stroke={styles.strokeColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="565" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="579" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="593" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="607" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="621" cy="170" r="4.5" fill={styles.dotsColor} />
            <circle cx="635" cy="170" r="4.5" fill={styles.dotsColor} />
          </motion.g>

          {/* SKELETON DEV CENTERPIECE */}
          <g>
            {/* Spine */}
            <line x1="400" y1="240" x2="400" y2="340" stroke={styles.strokeColor} strokeWidth="5" strokeLinecap="round" />

            {/* Ribs (Left & Right) */}
            <path d="M 390,260 C 370,262 362,272 365,280 C 368,286 382,284 390,280" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 410,260 C 430,262 438,272 435,280 C 432,286 418,284 410,280" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />

            <path d="M 390,283 C 365,286 358,298 362,308 C 365,315 380,312 390,306" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 410,283 C 435,286 442,298 438,308 C 435,315 420,312 410,306" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />

            <path d="M 390,306 C 362,309 355,323 360,333 C 363,340 380,334 390,328" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 410,306 C 438,309 445,323 440,333 C 437,340 420,334 410,328" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />

            {/* Collarbone */}
            <path d="M 358,242 C 378,238 422,238 442,242" fill="none" stroke={styles.strokeColor} strokeWidth="3.5" strokeLinecap="round" />

            {/* Neck Bones */}
            <rect x="394" y="215" width="12" height="6" rx="2" fill={styles.boneColor} stroke={styles.strokeColor} strokeWidth="2.2" />
            <rect x="394" y="223" width="12" height="6" rx="2" fill={styles.boneColor} stroke={styles.strokeColor} strokeWidth="2.2" />
            <rect x="394" y="231" width="12" height="6" rx="2" fill={styles.boneColor} stroke={styles.strokeColor} strokeWidth="2.2" />

            {/* Skull / Head */}
            <path
              d="M 370,165 C 370,130 380,120 400,120 C 420,120 430,130 430,165 C 430,177 435,183 432,190 C 428,197 422,200 422,210 C 422,213 418,215 415,215 L 385,215 C 382,215 378,213 378,210 C 378,200 372,197 368,190 C 365,183 370,177 370,165 Z"
              fill={styles.boneColor}
              stroke={styles.strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Eye sockets */}
            <ellipse cx="387" cy="168" rx="9.5" ry="12" fill={styles.socketColor} />
            <ellipse cx="413" cy="168" rx="9.5" ry="12" fill={styles.socketColor} />
            {/* Glowing pupil dots */}
            <circle cx="387" cy="168" r="2" fill={styles.pupilColor} />
            <circle cx="413" cy="168" r="2" fill={styles.pupilColor} />
            {/* Nose cavity */}
            <path d="M 400,181 L 396,189 C 396,190.5 400,192 400,192 C 400,192 404,190.5 404,189 Z" fill={styles.socketColor} />
            {/* Teeth / Mouth */}
            <path d="M 383,203 L 417,203" stroke={styles.strokeColor} strokeWidth="2.5" />
            <path d="M 388,198 L 388,208 M 394,198 L 394,208 M 400,198 L 400,208 M 406,198 L 406,208 M 412,198 L 412,208" stroke={styles.strokeColor} strokeWidth="2" />

            {/* Left Upper Arm */}
            <line x1="358" y1="242" x2="295" y2="300" stroke={styles.strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="358" y1="242" x2="295" y2="300" stroke={styles.boneColor} strokeWidth="3.0" strokeLinecap="round" />

            {/* Left Forearm */}
            <line x1="295" y1="300" x2="330" y2="382" stroke={styles.strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="295" y1="300" x2="330" y2="382" stroke={styles.boneColor} strokeWidth="3.0" strokeLinecap="round" />

            {/* Left Elbow Joint */}
            <circle cx="295" cy="300" r="4.5" fill={styles.boneColor} stroke={styles.strokeColor} strokeWidth="2.5" />

            {/* Right Upper Arm */}
            <line x1="442" y1="242" x2="505" y2="300" stroke={styles.strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="442" y1="242" x2="505" y2="300" stroke={styles.boneColor} strokeWidth="3.0" strokeLinecap="round" />

            {/* Right Forearm */}
            <line x1="505" y1="300" x2="470" y2="382" stroke={styles.strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="505" y1="300" x2="470" y2="382" stroke={styles.boneColor} strokeWidth="3.0" strokeLinecap="round" />

            {/* Right Elbow Joint */}
            <circle cx="505" cy="300" r="4.5" fill={styles.boneColor} stroke={styles.strokeColor} strokeWidth="2.5" />

            {/* Wrist Joints */}
            <circle cx="330" cy="382" r="4" fill={styles.boneColor} stroke={styles.strokeColor} strokeWidth="2" />
            <circle cx="470" cy="382" r="4" fill={styles.boneColor} stroke={styles.strokeColor} strokeWidth="2" />

            {/* Laptop Open Screen */}
            <polygon points="305,270 495,270 510,375 290,375" fill={styles.laptopLid} stroke={styles.strokeColor} strokeWidth="3" strokeLinejoin="round" />
            
            {/* Logo on Laptop (skull) */}
            <g transform="translate(400, 318) scale(0.6)">
              <path
                d="M -15,-10 C -15,-20 -8,-25 0,-25 C 8,-25 15,-20 15,-10 C 15,-1 11,5 8,10 L -8,10 C -11,5 -15,-1 -15,-10 Z"
                fill={styles.strokeColor}
              />
              <circle cx="-5" cy="-8" r="3" fill={styles.boneColor} />
              <circle cx="5" cy="-8" r="3" fill={styles.boneColor} />
              <polygon points="0,-2 -2,2 2,2" fill={styles.boneColor} />
            </g>

            {/* Laptop Base (Keyboard area) */}
            <polygon points="255,375 545,375 570,410 230,410" fill={styles.laptopLid} stroke={styles.strokeColor} strokeWidth="3" strokeLinejoin="round" />
            <polygon points="275,381 525,381 542,403 258,403" fill={styles.keyboardBg} opacity="0.85" />
            <rect x="375" y="404" width="50" height="4" rx="1" fill={styles.trackpadColor} />

            {/* Skeleton fingers typing (micro-animated) */}
            <motion.path
              d="M 330,382 Q 315,382 308,385 M 330,382 Q 318,387 312,391 M 330,382 Q 322,392 318,396"
              fill="none"
              stroke={styles.strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{ rotate: [0, -3, 0] }}
              transition={{ duration: 0.15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M 470,382 Q 485,382 492,385 M 470,382 Q 482,387 488,391 M 470,382 Q 478,392 482,396"
              fill="none"
              stroke={styles.strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{ rotate: [0, 3, 0] }}
              transition={{ duration: 0.15, repeat: Infinity, ease: 'linear', delay: 0.08 }}
            />
          </g>

          {/* Botanical Leaves at the bottom */}
          <path d="M 160,430 C 160,430 180,350 240,370 C 240,370 210,440 160,430 Z" fill={styles.l1} stroke={styles.strokeColor} strokeWidth="2" />
          <path d="M 640,430 C 640,430 620,350 560,370 C 560,370 590,440 640,430 Z" fill={styles.l1} stroke={styles.strokeColor} strokeWidth="2" />

          <path d="M 190,440 C 190,440 210,340 280,375 C 280,375 240,450 190,440 Z" fill={styles.l2} stroke={styles.strokeColor} strokeWidth="2" />
          <path d="M 610,440 C 610,440 590,340 520,375 C 520,375 560,450 610,440 Z" fill={styles.l2} stroke={styles.strokeColor} strokeWidth="2" />

          <path d="M 220,445 C 220,445 250,360 320,390 C 320,390 280,460 220,445 Z" fill={styles.l3} stroke={styles.strokeColor} strokeWidth="2" />
          <path d="M 580,445 C 580,445 550,360 480,390 C 480,390 520,460 580,445 Z" fill={styles.l3} stroke={styles.strokeColor} strokeWidth="2" />

          <path d="M 260,450 C 260,450 290,380 350,400 C 350,400 320,465 260,450 Z" fill={styles.l4} stroke={styles.strokeColor} strokeWidth="2" />
          <path d="M 540,450 C 540,450 510,380 450,400 C 450,400 480,465 540,450 Z" fill={styles.l4} stroke={styles.strokeColor} strokeWidth="2" />
        </svg>
      </motion.div>
    </div>
  )
}

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen w-screen flex flex-col lg:grid lg:grid-cols-10 bg-white dark:bg-[#07050a] font-sans overflow-x-hidden relative transition-colors duration-300">
      
      {/* LEFT COLUMN: Premium Skeleton Visualizer (60% width on desktop, hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:col-span-6 flex-col justify-between items-center p-8 sm:p-12 relative overflow-hidden min-h-screen bg-gradient-to-br from-[#fbead2] via-[#f7e0c9] to-[#f5d5be] dark:from-[#1b0d19] dark:via-[#130711] dark:to-[#0a0209] transition-colors duration-300">
        {/* Top Spacer */}
        <div className="w-full h-8" />

        {/* Centerpiece visualizer */}
        <div className="relative w-full flex-1 flex items-center justify-center z-10 py-4">
          <SkeletonDeveloperVisualizer />
        </div>

        {/* Bottom text captions */}
        <div className="text-center space-y-2 z-10 max-w-md pb-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#4a1535] dark:text-[#eaacd2]">
            Empowering Academic Excellence.
          </h2>
          <p className="text-xs lg:text-sm font-bold text-[#782c59] dark:text-[#cfa0bf] max-w-xs mx-auto opacity-90">
            Securely manage database records, portfolios, and grade computations from your console.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Clean Minimalist Authentication Form (40% width on desktop) */}
      <div className="col-span-10 lg:col-span-4 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden bg-white dark:bg-[#07050a] min-h-screen z-10">
        
        {/* Top bar controls */}
        <div className="w-full flex justify-between items-center z-20">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#781f5a] dark:hover:text-[#eaacd2] transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-400 hover:text-slate-800 dark:hover:text-white shadow-sm flex items-center justify-center cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Form Container Card - Clean minimalist wrapper */}
        <div className="my-auto py-8 flex justify-center items-center w-full">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Footer copyright */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 z-10">
          &copy; {new Date().getFullYear()} EduVault AI. All institutional rights reserved.
        </div>
      </div>

    </div>
  )
}
