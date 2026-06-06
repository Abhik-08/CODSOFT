import React from 'react';
import { motion } from 'motion/react';

interface FloatingLayerProps {
  children: React.ReactNode;
  speed?: number; // duration in seconds
  rangeX?: number; // drift distance on X
  rangeY?: number; // drift distance on Y
  rotateRange?: number; // rotation wobble range
  delay?: number;
  className?: string;
}

export const FloatingLayer: React.FC<FloatingLayerProps> = ({
  children,
  speed = 8,
  rangeX = 15,
  rangeY = 15,
  rotateRange = 2,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      animate={{
        x: [0, rangeX, -rangeX / 2, rangeX / 1.5, 0],
        y: [0, -rangeY, rangeY / 1.5, -rangeY / 2, 0],
        rotate: [0, rotateRange, -rotateRange, rotateRange / 2, 0],
      }}
      transition={{
        duration: speed,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: delay,
      }}
      style={{
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
