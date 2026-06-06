import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NoteItem {
  id: number;
  value: 500 | 100;
  delay: number;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
}

interface CurrencyMaterializationEffectProps {
  mode: 'deposit' | 'withdraw';
  amount: number;
  stage: 'idle' | 'materialize' | 'scanning' | 'converting' | 'success';
}

// High-tech note design component
const RenderBill: React.FC<{ note: NoteItem }> = ({ note }) => {
  return (
    <div className="relative w-36 h-20 rounded-xl border border-cyan-400/30 bg-black/85 p-2.5 flex flex-col justify-between font-mono text-[9px] shadow-[0_0_15px_rgba(0,210,255,0.15)] overflow-hidden">
      {/* Hologram background seal */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
      <div className="absolute -right-3 -bottom-3 w-12 h-12 rounded-full border border-cyan-500/10 pointer-events-none" />

      <div className="flex justify-between items-start text-cyan-400">
        <span className="font-black">₹{note.value}</span>
        <span className="text-[6.5px] opacity-40">NEXUS SECURE NOTE</span>
      </div>

      {/* Chip hologram */}
      <div className="w-5 h-4.5 rounded bg-gradient-to-br from-cyan-400/80 to-blue-500/40 border border-cyan-400/30 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-sm bg-black/60" />
      </div>

      <div className="flex justify-between items-end text-cyan-400">
        <span className="text-[6px] tracking-widest opacity-60">
          #{Math.floor(100000 + note.id * 89762)}
        </span>
        <span className="font-black text-[11px]">₹{note.value}</span>
      </div>
    </div>
  );
};

export const CurrencyMaterializationEffect: React.FC<CurrencyMaterializationEffectProps> = ({
  mode,
  amount,
  stage,
}) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);

  useEffect(() => {
    // Generate a set of representational bills based on transaction amount (max 6 bills for visual clarity)
    const noteCount = Math.min(Math.ceil(amount / 500), 6) || 3;
    const items: NoteItem[] = Array.from({ length: noteCount }).map((_, i) => {
      // Alternate note denominations
      const noteValue = i % 2 === 0 ? 500 : 100;
      
      // Calculate scatter positions around the viewport
      const angle = (i / noteCount) * Math.PI * 2;
      const radius = 180; // distance from core center

      return {
        id: i,
        value: noteValue,
        delay: i * 0.15,
        // Center coordinates of core are (0,0)
        initialX: Math.cos(angle) * radius,
        initialY: Math.sin(angle) * radius,
        targetX: 0,
        targetY: 0,
      };
    });
    setNotes(items);
  }, [amount]);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none z-40">
      <AnimatePresence>
        {/* 1. DEPOSIT SEQUENCE ANIMATIONS */}
        {mode === 'deposit' && (
          <>
            {/* Materializing & Floating Bills */}
            {(stage === 'materialize' || stage === 'scanning') &&
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.2, x: 0, y: 350 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: note.initialX,
                    y: note.initialY,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 15,
                    delay: note.delay,
                  }}
                  className="absolute"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {/* Floating breathing oscillation */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 3 + note.id,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <RenderBill note={note} />
                  </motion.div>
                </motion.div>
              ))}

            {/* Sweeping scan lines */}
            {stage === 'scanning' && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
                className="absolute w-[80%] h-[350px] border-y-2 border-cyan-500/50 bg-cyan-500/5 z-50 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,210,255,0.15)]"
                style={{
                  willChange: 'opacity, transform',
                }}
              >
                {/* Horizontal sweeping laser beam */}
                <motion.div
                  animate={{ y: [-150, 150, -150] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-[2.5px] bg-cyan-400 shadow-[0_0_12px_4px_#00d2ff]"
                  style={{ willChange: 'transform' }}
                />
                <span className="font-mono text-[9px] text-cyan-400 tracking-[8px] uppercase animate-pulse select-none">
                  AI SCANNING CURRENCY VALUES...
                </span>
              </motion.div>
            )}

            {/* Energy conversion (disintegration into particles flying towards center) */}
            {stage === 'converting' &&
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ x: note.initialX, y: note.initialY, opacity: 1, scale: 1 }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: 0.1,
                    scale: 0.05,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                    delay: note.delay / 2,
                  }}
                  style={{ willChange: 'transform, opacity' }}
                  className="absolute"
                >
                  <div className="relative">
                    {/* Glowing point particle representing note disintegrating */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-400 blur-md shadow-[0_0_20px_4px_#00d2ff]" />
                    <RenderBill note={note} />
                  </div>
                </motion.div>
              ))}
          </>
        )}

        {/* 2. WITHDRAW SEQUENCE ANIMATIONS */}
        {mode === 'withdraw' && (
          <>
            {/* Energy conversion (particles flying outward from center to target coordinates) */}
            {stage === 'materialize' &&
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ x: 0, y: 0, opacity: 0.1, scale: 0.05 }}
                  animate={{
                    x: note.initialX,
                    y: note.initialY,
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                    delay: note.delay / 2,
                  }}
                  style={{ willChange: 'transform, opacity' }}
                  className="absolute"
                >
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-400 blur-md shadow-[0_0_20px_4px_#00d2ff] opacity-40 animate-pulse" />
                    <RenderBill note={note} />
                  </div>
                </motion.div>
              ))}

            {/* Assemble in mid-air + laser scanning sweep */}
            {stage === 'scanning' && (
              <div className="relative flex items-center justify-center">
                {/* Horizontal laser beam scanning the gathered notes */}
                <motion.div
                  animate={{ y: [-80, 80, -80] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-[220px] h-[2px] bg-blue-400 shadow-[0_0_12px_4px_#3b82f6] z-50"
                  style={{ willChange: 'transform' }}
                />
                
                {/* Visual stack of notes assembled in mid-air */}
                {notes.map((note, idx) => (
                  <motion.div
                    key={note.id}
                    initial={{ x: note.initialX, y: note.initialY, opacity: 1, scale: 1 }}
                    animate={{
                      x: idx * 3, // slightly offset stack
                      y: idx * -4,
                      rotate: idx * 0.8,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 20,
                    }}
                    className="absolute"
                    style={{ zIndex: 10 + idx, willChange: 'transform' }}
                  >
                    <RenderBill note={note} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Fly outward toward the viewer */}
            {stage === 'converting' && (
              <div className="relative flex items-center justify-center">
                {notes.map((note, idx) => (
                  <motion.div
                    key={note.id}
                    initial={{
                      x: idx * 3,
                      y: idx * -4,
                      rotate: idx * 0.8,
                      opacity: 1,
                      scale: 1,
                    }}
                    animate={{
                      y: 200,
                      scale: 2.2,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 1.4,
                      ease: [0.16, 1, 0.3, 1],
                      delay: idx * 0.08,
                    }}
                    className="absolute"
                    style={{ zIndex: 50 + idx, willChange: 'transform, opacity' }}
                  >
                    <RenderBill note={note} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
