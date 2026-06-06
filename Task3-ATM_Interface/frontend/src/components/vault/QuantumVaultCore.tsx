import React from 'react';
import { motion } from 'motion/react';

interface QuantumVaultCoreProps {
  isCharging?: boolean;
  isDischarging?: boolean;
  pulseSpeed?: number;
  stage?: 'materialize' | 'scanning' | 'converting' | 'success';
}

export const QuantumVaultCore: React.FC<QuantumVaultCoreProps> = ({
  isCharging = false,
  isDischarging = false,
  pulseSpeed = 4,
  stage,
}) => {
  // Determine if the vault is unlocked based on stage or charging state
  // On load (e.g. materialize, scanning, converting) the door is UNLOCKED (shutters open, bolts retracted)
  // On success or default (idle), the door is LOCKED (shutters closed, bolts extended)
  const isUnlocked = stage ? stage !== 'success' : (isCharging || isDischarging);

  // Determine container frame shake keyframes to reduce cognitive complexity
  let xShake = [0, -3, 3, -1.5, 1.5, 0];
  let yShake = [0, 0];

  if (stage === 'success') {
    xShake = [0, -6, 6, -3, 3, -1, 1, 0];
    yShake = [0, -3, 3, -1.5, 1.5, 0];
  } else if (isUnlocked) {
    xShake = [0, -2, 2, -1, 1, 0];
  }

  return (
    <motion.div
      animate={{
        x: xShake,
        y: yShake,
      }}
      transition={{
        duration: stage === 'success' ? 0.65 : 0.45,
        ease: 'easeOut',
      }}
      className="relative w-80 h-56 sm:w-96 sm:h-64 flex items-center justify-center select-none font-mono"
    >
      
      {/* Hydraulic steam pressure release valves (Pneumatic effect on sides) */}
      {isUnlocked && (
        <>
          {/* Left Steam Puff */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, x: -10 }}
            animate={{ scale: [1, 2.5, 3.5], opacity: [0, 0.8, 0], x: [-10, -50, -80] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute left-[-15px] w-8 h-8 rounded-full bg-cyan-400/30 blur-md pointer-events-none z-50"
          />
          {/* Right Steam Puff */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, x: 10 }}
            animate={{ scale: [1, 2.5, 3.5], opacity: [0, 0.8, 0], x: [10, 50, 80] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute right-[-15px] w-8 h-8 rounded-full bg-cyan-400/30 blur-md pointer-events-none z-50"
          />
          
          {/* Physical venting nozzles on the side borders */}
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-2.5 h-12 bg-slate-800 border border-slate-700/60 rounded z-35" />
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-2.5 h-12 bg-slate-800 border border-slate-700/60 rounded z-35" />
        </>
      )}

      {/* 1. OUTER HEAVY RECTANGULAR FRAME */}
      <div className="absolute inset-0 rounded-2xl border-4 border-slate-800 bg-slate-950/40 shadow-[0_0_35px_rgba(0,210,255,0.15),inset_0_0_20px_rgba(0,210,255,0.1)] z-10 pointer-events-none" />
      
      {/* Outer Rectangular Bezel Rivets / Screws */}
      <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-slate-700 border border-slate-900 shadow-inner flex items-center justify-center text-[7px] text-slate-500 font-black z-15">×</div>
      <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-slate-700 border border-slate-900 shadow-inner flex items-center justify-center text-[7px] text-slate-500 font-black z-15">×</div>
      <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-slate-700 border border-slate-900 shadow-inner flex items-center justify-center text-[7px] text-slate-500 font-black z-15">×</div>
      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-slate-700 border border-slate-900 shadow-inner flex items-center justify-center text-[7px] text-slate-500 font-black z-15">×</div>

      {/* Outer Glow Perimeter Border */}
      <motion.div
        animate={{
          opacity: isUnlocked ? [0.4, 0.8, 0.4] : [0.3, 0.5, 0.3],
          boxShadow: isUnlocked
            ? ['0 0 15px rgba(6,182,212,0.3)', '0 0 25px rgba(6,182,212,0.6)', '0 0 15px rgba(6,182,212,0.3)']
            : ['0 0 10px rgba(6,182,212,0.2)', '0 0 15px rgba(6,182,212,0.3)', '0 0 10px rgba(6,182,212,0.2)'],
        }}
        transition={{ duration: pulseSpeed / 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -inset-1 rounded-2xl border border-cyan-500/30 z-10 pointer-events-none"
      />

      {/* 2. INNER TRANSACTING CASH CHAMBER (BACKGROUND LAYER) */}
      <div className="absolute inset-4 rounded-xl bg-slate-950/95 overflow-hidden border border-cyan-500/10 z-0">
        {/* Holographic matrix grids */}
        <div 
          className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.08)_1px,transparent_1px)] bg-[size:14px_14px]" 
        />
        
        {/* Intersecting double laser-sweeping scanner lines inside the cavity */}
        {isUnlocked && (
          <>
            {/* Laser 1: Cyan line sweeping top-to-bottom */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, 160, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_4px_#00d2ff] z-5 pointer-events-none"
            />
            {/* Laser 2: Electric Blue line sweeping bottom-to-top */}
            <motion.div
              initial={{ y: 160 }}
              animate={{ y: [160, 0, 160] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_12px_4px_rgba(59,130,246,0.6)] z-5 pointer-events-none"
            />
          </>
        )}

        {/* Ingested core reactor highlight (glows in center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isCharging ? [1, 1.08, 0.98, 1.1, 1] : [1, 1.02, 1],
              opacity: isUnlocked ? 0.9 : 0.15,
            }}
            transition={{ duration: pulseSpeed / 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-44 h-28 rounded-lg bg-gradient-to-tr from-cyan-950/40 via-cyan-500/10 to-blue-950/40 flex items-center justify-center border border-cyan-400/20 relative"
          >
            {/* Holographic scanner target */}
            <div className="absolute inset-2 border border-dashed border-cyan-500/10 rounded flex items-center justify-center">
              <span className="text-[7px] text-cyan-400/20 tracking-[3px] uppercase">Nexus intake core</span>
            </div>
            
            {/* Center glowing logo */}
            <motion.div
              animate={{
                boxShadow: isCharging
                  ? ['0 0 20px 4px #00d2ff', '0 0 35px 10px #00d2ff', '0 0 20px 4px #00d2ff']
                  : ['0 0 12px 2px #00d2ff', '0 0 20px 5px #00d2ff', '0 0 12px 2px #00d2ff'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_15px_#00d2ff] relative z-10"
            >
              <img 
                src="/nexus_symbol.png" 
                alt="Nexus Logo" 
                className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(2,4,10,0.9)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute w-2 h-2 rounded-full bg-white opacity-85" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* 3. VERTICAL SLIDING HYDRAULIC SHUTTER PLATES (MIDDLE LAYER) */}
      <div className="absolute inset-3.5 rounded-xl overflow-hidden z-25 flex flex-col pointer-events-none">
        
        {/* Top Shutter Half */}
        <motion.div
          animate={{
            y: isUnlocked ? '-92%' : '0%',
          }}
          transition={{
            type: 'spring',
            stiffness: 95,
            damping: 17,
          }}
          className="w-full h-1/2 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-b-2 border-cyan-400/40 relative flex items-end justify-center pb-2.5"
        >
          {/* Diagonal Industrial hazard warners */}
          <div 
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, #00d2ff, #00d2ff 6px, transparent 6px, transparent 15px)',
            }}
          />
          {/* Shutter Seam Handle Groove */}
          <div className="w-16 h-1 bg-slate-950 border border-slate-700/30 rounded-full" />
          <span className="absolute top-2 text-[6.5px] text-cyan-400/30 tracking-[4px] uppercase font-bold">ATM_SHUTTER_TOP</span>
        </motion.div>

        {/* Bottom Shutter Half */}
        <motion.div
          animate={{
            y: isUnlocked ? '92%' : '0%',
          }}
          transition={{
            type: 'spring',
            stiffness: 95,
            damping: 17,
          }}
          className="w-full h-1/2 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-950 border-t-2 border-cyan-400/40 relative flex items-start justify-center pt-2.5"
        >
          {/* Diagonal industrial hazard warning stripes */}
          <div 
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #00d2ff, #00d2ff 6px, transparent 6px, transparent 15px)',
            }}
          />
          {/* Shutter Seam Handle Groove */}
          <div className="w-16 h-1 bg-slate-950 border border-slate-700/30 rounded-full" />
          <span className="absolute bottom-2 text-[6.5px] text-cyan-400/30 tracking-[4px] uppercase font-bold">ATM_SHUTTER_BTM</span>
        </motion.div>
      </div>

      {/* 4. HORIZONTAL HEAVY LOCKING BOLTS (FOREGROUND LAYER) */}
      {/* 2 Bolts on Left, 2 Bolts on Right sliding horizontally into the frame */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* LEFT UPPER BOLT */}
        <motion.div
          animate={{
            x: isUnlocked ? 22 : -8,
          }}
          transition={{ type: 'spring', stiffness: 105, damping: 14 }}
          className="absolute left-[-4px] top-[24%] w-12 h-3.5 bg-gradient-to-r from-slate-600 via-slate-800 to-cyan-950 rounded border border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.2)] flex items-center justify-end pr-1.5"
        >
          <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_3px_#00d2ff]" />
        </motion.div>

        {/* LEFT LOWER BOLT */}
        <motion.div
          animate={{
            x: isUnlocked ? 22 : -8,
          }}
          transition={{ type: 'spring', stiffness: 105, damping: 14 }}
          className="absolute left-[-4px] bottom-[24%] w-12 h-3.5 bg-gradient-to-r from-slate-600 via-slate-800 to-cyan-950 rounded border border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.2)] flex items-center justify-end pr-1.5"
        >
          <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_3px_#00d2ff]" />
        </motion.div>

        {/* RIGHT UPPER BOLT */}
        <motion.div
          animate={{
            x: isUnlocked ? -22 : 8,
          }}
          transition={{ type: 'spring', stiffness: 105, damping: 14 }}
          className="absolute right-[-4px] top-[24%] w-12 h-3.5 bg-gradient-to-l from-slate-600 via-slate-800 to-cyan-950 rounded border border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.2)] flex items-center justify-start pl-1.5"
        >
          <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_3px_#00d2ff]" />
        </motion.div>

        {/* RIGHT LOWER BOLT */}
        <motion.div
          animate={{
            x: isUnlocked ? -22 : 8,
          }}
          transition={{ type: 'spring', stiffness: 105, damping: 14 }}
          className="absolute right-[-4px] bottom-[24%] w-12 h-3.5 bg-gradient-to-l from-slate-600 via-slate-800 to-cyan-950 rounded border border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.2)] flex items-center justify-start pl-1.5"
        >
          <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_3px_#00d2ff]" />
        </motion.div>
      </div>

    </motion.div>
  );
};


