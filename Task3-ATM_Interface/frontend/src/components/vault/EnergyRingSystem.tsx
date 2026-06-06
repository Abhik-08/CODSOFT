import React from 'react';
import { motion } from 'motion/react';

interface EnergyRingSystemProps {
  isActive?: boolean;
  stage?: 'materialize' | 'scanning' | 'converting' | 'success';
}

// Helper to generate mathematical path for gear teeth
const generateGearPath = (teeth: number, radius: number, toothHeight: number = 8) => {
  const paths: string[] = [];
  const toothAngle = (2 * Math.PI) / teeth;
  
  for (let i = 0; i < teeth; i++) {
    const angle = i * toothAngle;
    const rInner = radius - toothHeight / 2;
    const rOuter = radius + toothHeight / 2;
    
    // Trapezoidal teeth structure
    const a1 = angle - toothAngle * 0.25;
    const a2 = angle - toothAngle * 0.15;
    const a3 = angle + toothAngle * 0.15;
    const a4 = angle + toothAngle * 0.25;
    
    const x1 = Math.cos(a1) * rInner;
    const y1 = Math.sin(a1) * rInner;
    const x2 = Math.cos(a2) * rOuter;
    const y2 = Math.sin(a2) * rOuter;
    const x3 = Math.cos(a3) * rOuter;
    const y3 = Math.sin(a3) * rOuter;
    const x4 = Math.cos(a4) * rInner;
    const y4 = Math.sin(a4) * rInner;
    
    paths.push(`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`);
  }
  return paths.join(' ');
};

export const EnergyRingSystem: React.FC<EnergyRingSystemProps> = ({
  isActive = false,
  stage,
}) => {
  // Speed up rotation when active during transaction phases
  const isUnlocked = stage ? stage !== 'success' : isActive;

  // Pinion gear specs (center drive)
  const pinionRadius = 40;
  const pinionTeeth = 18;
  const toothHeight = 8;
  const pinionInner = pinionRadius - toothHeight / 2;
  const pinionPath = generateGearPath(pinionTeeth, pinionRadius, toothHeight);

  // Generate linear rack teeth offsets
  const rackTeethXOffsets = [-120, -100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100, 120];

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none z-5">
      
      {/* Rack and Pinion Assembly SVG Container */}
      <svg 
        className="w-[520px] h-[340px] text-cyan-500/10 opacity-75 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
        viewBox="-260 -170 520 340" 
        fill="none" 
        stroke="currentColor"
      >
        {/* Outer Rectangular Enclosure Cage */}
        <rect x="-240" y="-140" width="480" height="280" rx="12" strokeWidth="2" strokeDasharray="4 8" />
        <rect x="-246" y="-146" width="492" height="292" rx="16" strokeWidth="0.75" className="opacity-45" />

        {/* Professional Corner HUD Vector Brackets */}
        {/* Top-Left */}
        <path d="M -230 -115 L -230 -130 L -215 -130" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" className="text-cyan-400 opacity-60" />
        <line x1="-226" y1="-126" x2="-220" y2="-120" stroke="#00d2ff" strokeWidth="1" className="text-cyan-400 opacity-40" />

        {/* Top-Right */}
        <path d="M 230 -115 L 230 -130 L 215 -130" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" className="text-cyan-400 opacity-60" />
        <line x1="226" y1="-126" x2="220" y2="-120" stroke="#00d2ff" strokeWidth="1" className="text-cyan-400 opacity-40" />

        {/* Bottom-Left */}
        <path d="M -230 115 L -230 130 L -215 130" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" className="text-cyan-400 opacity-60" />
        <line x1="-226" y1="126" x2="-220" y2="120" stroke="#00d2ff" strokeWidth="1" className="text-cyan-400 opacity-40" />

        {/* Bottom-Right */}
        <path d="M 230 115 L 230 130 L 215 130" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" className="text-cyan-400 opacity-60" />
        <line x1="226" y1="126" x2="220" y2="120" stroke="#00d2ff" strokeWidth="1" className="text-cyan-400 opacity-40" />

        {/* Core telemetry micro symbols in corners */}
        <text x="-210" y="-115" fill="#00d2ff" fontSize="6" fontFamily="monospace" className="opacity-55 font-bold">LATCH_SYS_A2</text>
        <text x="175" y="-115" fill="#00d2ff" fontSize="6" fontFamily="monospace" className="opacity-55 font-bold">PSI_VAL_95.4</text>
        <text x="-210" y="125" fill="#00d2ff" fontSize="6" fontFamily="monospace" className="opacity-55 font-bold">TRAVEL_30.0mm</text>
        <text x="175" y="125" fill="#00d2ff" fontSize="6" fontFamily="monospace" className="opacity-55 font-bold">NODE_SEC_V04</text>

        {/* 1. TOP LINEAR GEAR RACK (Slides Left when unlocking, Right when locking) */}
        <motion.g
          animate={{ x: isUnlocked ? -30 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 16,
          }}
        >
          {/* Main rack rail bar */}
          <rect x="-160" y="-52" width="320" height="10" fill="currentColor" className="text-cyan-500/20" rx="2" />
          <line x1="-160" y1="-42" x2="160" y2="-42" strokeWidth="1.5" />
          
          {/* Rack gear teeth engaging down with pinion */}
          {rackTeethXOffsets.map((x) => (
            <rect key={`top-tooth-${x}`} x={x - 4} y="-42" width="8" height="5" fill="currentColor" className="text-cyan-400/20" />
          ))}
          
          {/* Guide slots & slide indicators */}
          <circle cx="-130" cy="-47" r="2.5" fill="currentColor" className="text-cyan-400/35" />
          <circle cx="130" cy="-47" r="2.5" fill="currentColor" className="text-cyan-400/35" />
        </motion.g>

        {/* 2. BOTTOM LINEAR GEAR RACK (Slides Right when unlocking, Left when locking) */}
        <motion.g
          animate={{ x: isUnlocked ? 30 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 16,
          }}
        >
          {/* Main rack rail bar */}
          <rect x="-160" y="42" width="320" height="10" fill="currentColor" className="text-cyan-500/20" rx="2" />
          <line x1="-160" y1="42" x2="160" y2="42" strokeWidth="1.5" />
          
          {/* Rack gear teeth engaging up with pinion */}
          {rackTeethXOffsets.map((x) => (
            <rect key={`btm-tooth-${x}`} x={x - 4} y="37" width="8" height="5" fill="currentColor" className="text-cyan-400/20" />
          ))}
          
          {/* Guide slots & slide indicators */}
          <circle cx="-130" cy="47" r="2.5" fill="currentColor" className="text-cyan-400/35" />
          <circle cx="130" cy="47" r="2.5" fill="currentColor" className="text-cyan-400/35" />
        </motion.g>

        {/* 3. CENTRAL SPINNING PINION DRIVE GEAR (Clockwise spin drives racks apart) */}
        <motion.g
          animate={{ rotate: isUnlocked ? 180 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 15,
          }}
          style={{ transformOrigin: '0px 0px' }}
        >
          <path d={pinionPath} fill="currentColor" strokeWidth="1" className="text-cyan-500/15" />
          <circle r={pinionInner} strokeWidth="2" />
          <circle r={pinionRadius * 0.5} strokeWidth="1.5" />
          <circle r={pinionRadius * 0.25} strokeWidth="1" />
          
          {/* Gear Spokes */}
          <line x1="0" y1={-pinionInner} x2="0" y2={pinionInner} strokeWidth="1.5" />
          <line x1={-pinionInner} y1="0" x2={pinionInner} y2={0} strokeWidth="1.5" />
        </motion.g>

        {/* Side hydraulic guide pistons (Static brackets) */}
        <g className="opacity-55">
          {/* Left bracket */}
          <rect x="-210" y="-62" width="20" height="124" fill="currentColor" className="text-slate-800" strokeWidth="1.5" rx="3" />
          <line x1="-190" y1="-47" x2="-160" y2="-47" strokeWidth="4.5" className="text-slate-600" />
          <line x1="-190" y1="47" x2="-160" y2="47" strokeWidth="4.5" className="text-slate-600" />
          
          {/* Right bracket */}
          <rect x="190" y="-62" width="20" height="124" fill="currentColor" className="text-slate-800" strokeWidth="1.5" rx="3" />
          <line x1="160" y1="-47" x2="190" y2="-47" strokeWidth="4.5" className="text-slate-600" />
          <line x1="160" y1="47" x2="190" y2="47" strokeWidth="4.5" className="text-slate-600" />
        </g>
      </svg>
    </div>
  );
};


