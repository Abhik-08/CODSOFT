import { motion } from 'motion/react'

// Premium SaaS Illustration representing Student Intelligence, Analytics, AI Insights, and Academic Data Flow
export const AuthHeroIllustration = () => {
  return (
    <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center select-none p-4 md:p-6 overflow-visible">
      
      {/* Background soft ambient glows */}
      <div className="absolute w-[80%] h-[80%] rounded-full bg-vault-accent/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute w-[60%] h-[60%] rounded-full bg-vault-cyan/15 blur-[60px] animate-pulse pointer-events-none delay-1000" />
      <div className="absolute w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[50px] animate-pulse pointer-events-none delay-2000" />

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full relative z-10 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mainGridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="var(--color-vault-cyan)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
          
          <linearGradient id="glowLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-vault-accent)" stopOpacity="0" />
            <stop offset="30%" stopColor="var(--color-vault-accent)" stopOpacity="0.8" />
            <stop offset="70%" stopColor="var(--color-vault-cyan)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>

          <filter id="authGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbiting Ring 1 (Large outer orbit) */}
        <motion.ellipse
          cx="250"
          cy="250"
          rx="210"
          ry="80"
          stroke="url(#glowLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          style={{ transformOrigin: '250px 250px' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
        />

        {/* Orbiting Ring 2 (Inner orbit) */}
        <motion.ellipse
          cx="250"
          cy="250"
          rx="170"
          ry="60"
          stroke="var(--color-vault-cyan)"
          strokeWidth="1"
          strokeOpacity="0.25"
          style={{ transformOrigin: '250px 250px', rotate: '-30deg' }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        />

        {/* Isometric Grid Background in the Center */}
        <g transform="translate(100, 150) scale(0.6)" opacity="0.2">
          {/* Horizontal lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((val) => (
            <line
              key={`h-grid-line-${val}`}
              x1="0"
              y1={val * 30}
              x2="500"
              y2={val * 30}
              stroke="var(--color-vault-cyan)"
              strokeWidth="1.5"
            />
          ))}
          {/* Vertical lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((val) => (
            <line
              key={`v-grid-line-${val}`}
              x1={val * 60}
              y1="0"
              x2={val * 60}
              y2="240"
              stroke="var(--color-vault-cyan)"
              strokeWidth="1.5"
            />
          ))}
        </g>

        {/* Central Core: Student Intelligence Hub (Floating Shield + Nodes) */}
        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          {/* Main shield backing glow */}
          <path
            d="M250 130 C300 130 350 115 350 115 C350 240 310 330 250 375 C190 330 150 240 150 115 C150 115 200 130 250 130 Z"
            fill="url(#mainGridGrad)"
            opacity="0.12"
            filter="url(#authGlow)"
          />

          {/* Central Glassmorphic Shield */}
          <path
            d="M250 130 C300 130 350 115 350 115 C350 240 310 330 250 375 C190 330 150 240 150 115 C150 115 200 130 250 130 Z"
            fill="var(--color-vault-card)"
            fillOpacity="0.45"
            stroke="url(#mainGridGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="backdrop-blur-md"
          />

          {/* Connected Network lines inside the shield (Academic Data Flow) */}
          <path
            d="M200 200 H 300 M250 170 V 290 M200 290 H 300 M210 245 L 290 245"
            stroke="var(--color-vault-cyan)"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />

          {/* Core nodes representing data blocks */}
          <circle cx="250" cy="170" r="6" fill="var(--color-vault-accent)" filter="url(#authGlow)" />
          <circle cx="200" cy="200" r="5" fill="var(--color-vault-cyan)" />
          <circle cx="300" cy="200" r="5" fill="#8b5cf6" />
          <circle cx="210" cy="245" r="4.5" fill="var(--color-vault-cyan)" />
          <circle cx="290" cy="245" r="4.5" fill="var(--color-vault-accent)" />
          <circle cx="200" cy="290" r="5" fill="#8b5cf6" />
          <circle cx="250" cy="290" r="6.5" fill="var(--color-vault-accent)" filter="url(#authGlow)" />
          <circle cx="300" cy="290" r="5" fill="var(--color-vault-cyan)" />

          {/* Glowing central pulse connection */}
          <circle cx="250" cy="230" r="8" fill="var(--color-vault-accent)" className="animate-ping" style={{ transformOrigin: '250px 230px' }} opacity="0.3" />
          <circle cx="250" cy="230" r="5.5" fill="var(--color-vault-accent)" />
        </motion.g>

        {/* Orbiting Node A (Emerald glow) */}
        <motion.circle
          cx="250"
          cy="250"
          r="7"
          fill="var(--color-vault-accent)"
          filter="url(#authGlow)"
          animate={{
            x: [170 * Math.cos(0), 170 * Math.cos(2 * Math.PI)],
            y: [60 * Math.sin(0), 60 * Math.sin(2 * Math.PI)],
          }}
          transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          style={{ transformOrigin: '250px 250px', rotate: '-30deg' }}
        />

        {/* Orbiting Node B (Cyan glow) */}
        <motion.circle
          cx="250"
          cy="250"
          r="6"
          fill="var(--color-vault-cyan)"
          filter="url(#authGlow)"
          animate={{
            x: [210 * Math.cos(Math.PI), 210 * Math.cos(3 * Math.PI)],
            y: [80 * Math.sin(Math.PI), 80 * Math.sin(3 * Math.PI)],
          }}
          transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
          style={{ transformOrigin: '250px 250px' }}
        />

        {/* Floating Glass Widget Mockup 1 (Analytics card) */}
        <motion.g
          transform="translate(45, 260)"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
        >
          {/* Card background */}
          <rect width="130" height="70" rx="12" fill="var(--color-vault-card)" fillOpacity="0.6" stroke="var(--color-vault-border)" strokeWidth="1.5" className="backdrop-blur-sm" />
          {/* Mini Bar Chart Mockup */}
          <rect x="15" y="45" width="12" height="15" rx="2" fill="var(--color-vault-accent)" />
          <rect x="35" y="35" width="12" height="25" rx="2" fill="var(--color-vault-cyan)" />
          <rect x="55" y="25" width="12" height="35" rx="2" fill="var(--color-vault-accent)" />
          <rect x="75" y="40" width="12" height="20" rx="2" fill="#8b5cf6" />
          <rect x="95" y="15" width="12" height="45" rx="2" fill="var(--color-vault-accent)" filter="url(#authGlow)" />
          
          <text x="15" y="62" fill="var(--color-vault-fg)" fontSize="6" fontWeight="bold" opacity="0.4">ANALYTICS</text>
        </motion.g>

        {/* Floating Glass Widget Mockup 2 (AI Insight Dialog) */}
        <motion.g
          transform="translate(320, 110)"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
        >
          {/* Card background */}
          <rect width="140" height="60" rx="12" fill="var(--color-vault-card)" fillOpacity="0.65" stroke="var(--color-vault-border)" strokeWidth="1.5" className="backdrop-blur-sm" />
          {/* Sparkles / Insight Icon */}
          <path d="M 20 20 L 22 25 L 27 27 L 22 29 L 20 34 L 18 29 L 13 27 L 18 25 Z" fill="var(--color-vault-accent)" filter="url(#authGlow)" />
          {/* Text lines */}
          <rect x="35" y="18" width="85" height="4.5" rx="1.5" fill="var(--color-vault-fg)" opacity="0.8" />
          <rect x="35" y="27" width="70" height="4.5" rx="1.5" fill="var(--color-vault-fg)" opacity="0.5" />
          <rect x="35" y="36" width="45" height="4" rx="1.5" fill="var(--color-vault-cyan)" />
          
          <text x="35" y="50" fill="var(--color-vault-fg)" fontSize="6.5" fontWeight="black" opacity="0.3" letterSpacing="0.5">COGNITIVE INSIGHT</text>
        </motion.g>

        {/* Floating Glass Widget Mockup 3 (Verifiable badge / credential) */}
        <motion.g
          transform="translate(290, 310)"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 1 }}
        >
          {/* Card background */}
          <rect width="150" height="65" rx="12" fill="var(--color-vault-card)" fillOpacity="0.6" stroke="var(--color-vault-border)" strokeWidth="1.5" className="backdrop-blur-sm" />
          {/* Verified Check Icon */}
          <circle cx="25" cy="32" r="10" fill="var(--color-vault-accent)" fillOpacity="0.15" />
          <path d="M21 32 L24 35 L30 29" stroke="var(--color-vault-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Text lines */}
          <rect x="42" y="20" width="90" height="4.5" rx="1.5" fill="var(--color-vault-fg)" opacity="0.75" />
          <rect x="42" y="29" width="75" height="4.5" rx="1.5" fill="var(--color-vault-fg)" opacity="0.4" />
          {/* Hash text mock */}
          <text x="42" y="45" fill="var(--color-vault-cyan)" fontSize="6" fontFamily="monospace">HASH: 0x8f2a...c0de</text>
          <text x="42" y="53" fill="var(--color-vault-fg)" fontSize="5.5" fontWeight="bold" opacity="0.3">VERIFIED PORTFOLIO</text>
        </motion.g>

      </svg>
    </div>
  )
}

// Simple reusable SVG Graphics for Analytics & Security Cards/previews
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
