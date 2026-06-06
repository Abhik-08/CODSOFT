import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FloatingLayer } from './FloatingLayer';
import { FloatingOrb } from './FloatingOrb';
import { DepthParallax } from './DepthParallax';
import { FiCpu, FiShield, FiTrendingUp, FiActivity } from 'react-icons/fi';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export const HeroScene: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize anti-gravity drift particles representing vault energy
  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage x
      y: Math.random() * 100 + 100, // start below the screen
      size: Math.random() * 3 + 1.5,
      speed: Math.random() * 15 + 10, // flight duration
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(generated);
  }, []);

  // Background Grid template
  const backgroundLayer = (
    <div className="absolute inset-0 w-full h-full relative overflow-hidden flex items-center justify-center">
      {/* 3D Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, transparent 20%, #02040a 80%),
            linear-gradient(to right, rgba(0, 210, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 210, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-30px) translateZ(-50px)',
          transformOrigin: 'top center',
        }}
      />
      
      {/* Heavy Cyber Orbs floating at the bottom and top */}
      <FloatingOrb size="w-[450px] h-[450px]" color="from-cyan-500/15 via-blue-600/5 to-transparent" speed={28} className="left-[-10%] top-[-10%]" />
      <FloatingOrb size="w-[350px] h-[350px]" color="from-purple-500/10 via-pink-600/5 to-transparent" speed={24} className="right-[-10%] bottom-[-10%]" />
    </div>
  );

  // Middle Layer: Holographic rings, drifting particles, and text
  const middleLayer = (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex flex-col justify-center items-center md:items-start px-4 sm:px-10">
      {/* Drifting energy particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 8px 2px rgba(0, 210, 255, 0.4)',
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [-50, -500],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Futuristic floating card & holographic nodes */}
      <div className="relative w-full max-w-[450px] aspect-square mx-auto flex items-center justify-center">
        {/* Glowing holographic rings */}
        <FloatingLayer speed={14} rangeX={25} rangeY={25} rotateRange={8} className="absolute inset-0 flex items-center justify-center">
          <svg className="w-[85%] h-[85%] text-cyan-500/25 animate-pulse-glow" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <circle cx="100" cy="100" r="85" strokeWidth="0.75" strokeDasharray="5 15" />
            <circle cx="100" cy="100" r="70" strokeWidth="0.5" strokeDasharray="30 5" />
            <circle cx="100" cy="100" r="50" strokeWidth="1" strokeDasharray="1 8" />
          </svg>
        </FloatingLayer>

        {/* Floating banking/AI widget indicators */}
        <FloatingLayer speed={9} rangeX={15} rangeY={20} rotateRange={4} className="absolute top-[15%] left-[5%] z-20">
          <div className="glass-panel border border-cyan-500/20 rounded-2xl p-3 flex items-center gap-2.5 shadow-lg shadow-cyan-950/40 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <FiCpu className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="text-left font-mono">
              <div className="text-[7.5px] text-cyan-400/50 uppercase tracking-widest font-black">AI SECURE CORE</div>
              <div className="text-[10px] text-dark-text font-bold leading-tight">SYNCED_SYNC</div>
            </div>
          </div>
        </FloatingLayer>

        <FloatingLayer speed={11} rangeX={20} rangeY={12} rotateRange={-5} className="absolute bottom-[20%] right-[3%] z-20">
          <div className="glass-panel border border-purple-500/20 rounded-2xl p-3 flex items-center gap-2.5 shadow-lg shadow-purple-950/40 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <FiShield className="w-4.5 h-4.5" />
            </div>
            <div className="text-left font-mono">
              <div className="text-[7.5px] text-purple-400/50 uppercase tracking-widest font-black">VAULT SHIELD</div>
              <div className="text-[10px] text-dark-text font-bold leading-tight">AES_256_ACTIVE</div>
            </div>
          </div>
        </FloatingLayer>

        <FloatingLayer speed={13} rangeX={12} rangeY={18} rotateRange={3} className="absolute top-[48%] right-[8%] z-20">
          <div className="glass-panel border border-blue-500/20 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg shadow-blue-950/40 backdrop-blur-md">
            <FiTrendingUp className="text-blue-400 w-4 h-4" />
            <span className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-wider">LEDGER_OK</span>
          </div>
        </FloatingLayer>

        {/* Center hologram core */}
        <FloatingLayer speed={7} rangeX={10} rangeY={10} rotateRange={2} className="relative z-10 w-[60%] h-[60%] flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/5 via-blue-500/10 to-purple-500/5 border border-cyan-500/15 flex items-center justify-center p-6 shadow-[0_0_50px_rgba(0,210,255,0.15)] relative">
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/25 animate-spin" style={{ animationDuration: '20s' }} />
            <img 
              src="/nexus_symbol.png" 
              alt="Hologram Vault Symbol" 
              className="w-[68%] h-[68%] object-contain drop-shadow-[0_0_15px_rgba(0,210,255,0.5)] animate-pulse"
            />
          </div>
        </FloatingLayer>
      </div>
    </div>
  );

  // Foreground Layer: Moving data nodes, stats, and text streams
  const foregroundLayer = (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex flex-col justify-end p-6 select-none font-mono">
      {/* Floating Neon Stream Logs */}
      <div className="space-y-1.5 opacity-60 self-start text-left pl-4 max-w-[280px]">
        <div className="flex items-center gap-2 text-[8.5px] text-cyan-400/80">
          <FiActivity className="w-3 h-3 animate-pulse" />
          <span>REALTIME LEDGER FEED</span>
        </div>
        <div className="text-[7.5px] text-zinc-400 bg-black/35 px-2.5 py-1 rounded border border-white/5 backdrop-blur-sm">
          Node_04 status: SECURE_SYNC
        </div>
        <div className="text-[7.5px] text-zinc-400 bg-black/35 px-2.5 py-1 rounded border border-white/5 backdrop-blur-sm">
          Active ledger hash: 8e22f...
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[500px] flex items-center justify-center overflow-hidden rounded-[32px] border border-cyan-500/10 bg-[#04060e]/40 shadow-inner">
      <DepthParallax
        background={backgroundLayer}
        middle={middleLayer}
        foreground={foregroundLayer}
        intensity={1.2}
      />
    </div>
  );
};
