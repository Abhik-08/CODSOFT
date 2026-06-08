import { motion } from 'motion/react'

// Elegant Academic Shield + AI Nodes Illustration for Auth Page
export const VaultIllustration = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
      {/* Background Ambient Glows */}
      <div className="absolute w-72 h-72 rounded-full bg-vault-accent/20 blur-[60px] animate-pulse pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-vault-cyan/20 blur-[50px] animate-pulse pointer-events-none delay-1000" />

      {/* Orbits & Core Shield */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full relative z-10 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Defining gradients and filters */}
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-vault-cyan)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-vault-accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-vault-cyan)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbiting Ring 1 */}
        <motion.ellipse
          cx="200"
          cy="200"
          rx="170"
          ry="65"
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          style={{ transformOrigin: '200px 200px' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        />

        {/* Orbiting Ring 2 (Tilted opposite) */}
        <motion.ellipse
          cx="200"
          cy="200"
          rx="150"
          ry="55"
          stroke="url(#lineGrad)"
          strokeWidth="1"
          style={{ transformOrigin: '200px 200px', rotate: '45deg' }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        />

        {/* Orbiting Ring 3 (Horizontal) */}
        <motion.ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="75"
          stroke="var(--color-vault-cyan)"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          style={{ transformOrigin: '200px 200px', rotate: '-30deg' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
        />

        {/* Glowing Circuit Node Connections (Background lines behind shield) */}
        <path
          d="M 100 200 L 140 200 L 160 220 M 300 200 L 260 200 L 240 180 M 200 80 L 200 120 M 200 320 L 200 280"
          stroke="var(--color-vault-border)"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />

        {/* Central Glowing Shield */}
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          {/* Shield Outer Shadow Glow */}
          <path
            d="M200 90 C240 90 280 80 280 80 C280 180 250 260 200 300 C150 260 120 180 120 80 C120 80 160 90 200 90 Z"
            fill="var(--color-vault-accent)"
            opacity="0.15"
            filter="url(#glow)"
          />

          {/* Shield Base Glass Layer */}
          <path
            d="M200 90 C240 90 280 80 280 80 C280 180 250 260 200 300 C150 260 120 180 120 80 C120 80 160 90 200 90 Z"
            fill="var(--color-vault-card)"
            fillOpacity="0.35"
            stroke="url(#shieldGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="backdrop-blur-md"
          />

          {/* Book Circuit Board Design Inside Shield (Education + Tech) */}
          {/* Open Book Pages */}
          <path
            d="M200 160 C215 150 235 155 245 165 V 205 C235 195 215 190 200 200 C185 190 165 195 155 205 V 165 C165 155 185 150 200 160 Z"
            fill="none"
            stroke="var(--color-vault-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Book Spine */}
          <line
            x1="200"
            y1="160"
            x2="200"
            y2="202"
            stroke="var(--color-vault-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Circuit Lines sprouting from book */}
          <path
            d="M175 180 H 145 M225 180 H 255 M200 200 V 230 H 170 M200 200 V 230 H 230"
            stroke="var(--color-vault-cyan)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />

          {/* Circuit Nodes */}
          <circle cx="145" cy="180" r="3.5" fill="var(--color-vault-accent)" />
          <circle cx="255" cy="180" r="3.5" fill="var(--color-vault-cyan)" />
          <circle cx="170" cy="230" r="3.5" fill="var(--color-vault-cyan)" />
          <circle cx="230" cy="230" r="3.5" fill="var(--color-vault-accent)" />
          <circle cx="200" cy="142" r="5" fill="var(--color-vault-accent)" className="animate-ping" style={{ transformOrigin: '200px 142px' }} />
          <circle cx="200" cy="142" r="4.5" fill="var(--color-vault-accent)" />
        </motion.g>

        {/* Orbiting Node A */}
        <motion.circle
          cx="200"
          cy="200"
          r="6"
          fill="var(--color-vault-accent)"
          filter="url(#glow)"
          animate={{
            x: [150 * Math.cos(0), 150 * Math.cos(2 * Math.PI)],
            y: [55 * Math.sin(0), 55 * Math.sin(2 * Math.PI)],
          }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          style={{ transformOrigin: '200px 200px', rotate: '45deg' }}
        />

        {/* Orbiting Node B */}
        <motion.circle
          cx="200"
          cy="200"
          r="5"
          fill="var(--color-vault-cyan)"
          filter="url(#glow)"
          animate={{
            x: [170 * Math.cos(Math.PI), 170 * Math.cos(3 * Math.PI)],
            y: [65 * Math.sin(Math.PI), 65 * Math.sin(3 * Math.PI)],
          }}
          transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          style={{ transformOrigin: '200px 200px' }}
        />
      </svg>
    </div>
  )
}

// Reusable SVG Graphics for Analytics & Security Cards/previews
export const AnalyticsIllustration = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-8 h-8 text-vault-accent" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 H90 M20 90 V60 M40 90 V40 M60 90 V75 M80 90 V25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M20 50 L40 30 L60 65 L80 15" stroke="var(--color-vault-cyan)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="15" r="4" fill="var(--color-vault-cyan)" />
    </svg>
  )
}

export const SecurityIllustration = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-8 h-8 text-vault-accent" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="45" width="50" height="40" rx="10" stroke="currentColor" strokeWidth="6" />
      <path d="M35 45 V30 C35 20 42 12 50 12 C58 12 65 20 65 30 V45" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="65" r="6" fill="var(--color-vault-cyan)" />
    </svg>
  )
}
