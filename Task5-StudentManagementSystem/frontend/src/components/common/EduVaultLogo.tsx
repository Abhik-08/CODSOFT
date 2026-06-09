import React from 'react'

interface LogoProps {
  className?: string
  iconSize?: number
  showText?: boolean
  textSize?: string
}

export const EduVaultLogoMark: React.FC<{ className?: string; size?: number }> = ({ 
  className = "", 
  size = 92 // Updated by 1.6x from 58
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <style>{`
        @keyframes rotateCw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotateCcw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulseBreathe {
          0%, 100% { transform: scale(0.96) translateY(0.5px); filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.45)); }
          50% { transform: scale(1.04) translateY(-0.5px); filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.75)); }
        }
        @keyframes pulseNode {
          0%, 100% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .animate-rotate-cw {
          transform-origin: 50px 50px;
          animation: rotateCw 22s linear infinite;
        }
        .animate-rotate-ccw {
          transform-origin: 50px 50px;
          animation: rotateCcw 16s linear infinite;
        }
        .animate-breathe {
          transform-origin: 50px 50px;
          animation: pulseBreathe 4s ease-in-out infinite;
        }
        .animate-node-pulse {
          transform-origin: 50px 50px;
          animation: pulseNode 3s ease-in-out infinite;
        }
      `}</style>

      <defs>
        {/* Neon glowing gradients for isometric elements */}
        <linearGradient id="outerShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
          <stop offset="50%" stopColor="#06b6d4" /> {/* Cyan */}
          <stop offset="100%" stopColor="#6366f1" /> {/* Indigo */}
        </linearGradient>
        
        <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
        </linearGradient>
        
        <linearGradient id="orbitGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
        </linearGradient>
        
        {/* Prism facets */}
        <linearGradient id="prismLeftTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#4facfe" />
        </linearGradient>
        
        <linearGradient id="prismRightTop" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        
        <linearGradient id="prismLeftBottom" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        
        <linearGradient id="prismRightBottom" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
        </linearGradient>
        
        <linearGradient id="bookPageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
        </linearGradient>
        
        <linearGradient id="nodeGlow1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        
        <linearGradient id="nodeGlow2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
        
        <linearGradient id="spineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Cyber Hexagonal Shield Bracket Segments */}
      <g stroke="url(#outerShieldGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85">
        {/* Top corner */}
        <path d="M36 11 L50 4 L64 11" />
        {/* Top-Right corner */}
        <path d="M84 23 L91 27 L91 40" />
        {/* Bottom-Right corner */}
        <path d="M91 60 L91 73 L84 77" />
        {/* Bottom corner */}
        <path d="M64 89 L50 96 L36 89" />
        {/* Bottom-Left corner */}
        <path d="M16 77 L9 73 L9 60" />
        {/* Top-Left corner */}
        <path d="M9 40 L9 27 L16 23" />
      </g>

      {/* Outer Dotted Orbit (Clockwise) */}
      <circle
        cx="50"
        cy="50"
        r="41"
        stroke="url(#orbitGrad1)"
        strokeWidth="1.2"
        strokeDasharray="8 6 2 4"
        fill="none"
        opacity="0.65"
        className="animate-rotate-cw"
      />

      {/* Inner Segmented Orbit (Counter-Clockwise) */}
      <circle
        cx="50"
        cy="50"
        r="35"
        stroke="url(#orbitGrad2)"
        strokeWidth="1"
        strokeDasharray="16 8"
        fill="none"
        opacity="0.55"
        className="animate-rotate-ccw"
      />

      {/* Grid Network Lines Connecting Outer Nodes to Inner Core */}
      <g stroke="url(#outerShieldGrad)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.45">
        <line x1="16" y1="23" x2="32" y2="42" />
        <line x1="84" y1="23" x2="68" y2="42" />
        <line x1="84" y1="77" x2="68" y2="58" />
        <line x1="16" y1="77" x2="32" y2="58" />
      </g>

      {/* Floating Breathing Core Assembly */}
      <g className="animate-breathe">
        {/* Open Book Holographic Base */}
        <path
          d="M46 70 C36 66 26 68 18 72 V50 C26 46 36 44 46 48 Z"
          fill="none"
          stroke="url(#bookPageGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.75"
        />
        <path
          d="M54 70 C64 66 74 68 82 72 V50 C74 46 64 44 54 48 Z"
          fill="none"
          stroke="url(#bookPageGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {/* Dynamic Glowing Octahedral Prism */}
        {/* Left-Top facet */}
        <path d="M50 25 L32 42 L50 50 Z" fill="url(#prismLeftTop)" opacity="0.9" />
        {/* Right-Top facet */}
        <path d="M50 25 L68 42 L50 50 Z" fill="url(#prismRightTop)" opacity="0.9" />
        {/* Left-Bottom facet */}
        <path d="M50 50 L32 42 L50 68 Z" fill="url(#prismLeftBottom)" opacity="0.9" />
        {/* Right-Bottom facet */}
        <path d="M50 50 L68 42 L50 68 Z" fill="url(#prismRightBottom)" opacity="0.9" />
        
        {/* Prism Center Spine */}
        <line x1="50" y1="25" x2="50" y2="68" stroke="url(#spineGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />

        {/* Central Core Nodes (Pulsing with breathing) */}
        <circle cx="50" cy="25" r="2.5" fill="#ffffff" filter="url(#glowFilter)" />
        <circle cx="32" cy="42" r="1.8" fill="#00ffff" filter="url(#glowFilter)" />
        <circle cx="68" cy="42" r="1.8" fill="#a855f7" filter="url(#glowFilter)" />
        <circle cx="50" cy="68" r="2" fill="#10b981" filter="url(#glowFilter)" />
      </g>

      {/* Pulsing Outer Boundary Neural Nodes */}
      <circle cx="16" cy="23" r="2" fill="url(#nodeGlow1)" className="animate-node-pulse" />
      <circle cx="84" cy="23" r="2" fill="url(#nodeGlow1)" className="animate-node-pulse" />
      <circle cx="84" cy="77" r="2" fill="url(#nodeGlow2)" className="animate-node-pulse" />
      <circle cx="16" cy="77" r="2" fill="url(#nodeGlow2)" className="animate-node-pulse" />
    </svg>
  )
}

export const EduVaultLogo: React.FC<LogoProps> = ({
  className = "",
  iconSize = 92, // Updated by 1.6x from 58
  showText = true,
  textSize = "text-2xl"
}) => {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <EduVaultLogoMark size={iconSize} />
      {showText && (
        <span className={`${textSize} font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent`}>
          EduVault <span className="bg-gradient-to-r from-vault-accent to-vault-cyan bg-clip-text text-transparent">AI</span>
        </span>
      )}
    </div>
  )
}

export default EduVaultLogo
