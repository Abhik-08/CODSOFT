import React from 'react';
import { motion } from 'motion/react';

interface FloatingOrbProps {
  size?: string; // e.g. 'w-72 h-72'
  color?: string; // e.g. 'from-cyan-500/20 to-blue-500/10'
  blur?: string; // e.g. 'blur-[100px]'
  speed?: number; // duration of orbit in seconds
  breathSpeed?: number; // duration of breathing in seconds
  delay?: number;
  className?: string;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  size = 'w-96 h-96',
  color = 'from-cyan-500/20 via-blue-500/10 to-transparent',
  blur = 'blur-[120px]',
  speed = 20,
  breathSpeed = 6,
  delay = 0,
  className = '',
}) => {
  return (
    <div className={`absolute pointer-events-none z-0 ${className}`}>
      {/* Slow orbital path wrapper */}
      <motion.div
        animate={{
          x: [0, 40, -20, 30, 0],
          y: [0, -50, 40, -30, 0],
        }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
          delay: delay,
        }}
        className="relative"
      >
        {/* Breathing size scale wrapper */}
        <motion.div
          animate={{
            scale: [1, 1.15, 0.95, 1.1, 1],
            opacity: [0.7, 0.9, 0.6, 0.85, 0.7],
          }}
          transition={{
            duration: breathSpeed,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: delay / 2,
          }}
          className={`${size} rounded-full bg-gradient-to-br ${color} ${blur}`}
          style={{
            willChange: 'transform, opacity',
          }}
        />
      </motion.div>
    </div>
  );
};
