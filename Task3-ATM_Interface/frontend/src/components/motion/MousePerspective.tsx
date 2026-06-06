import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface MousePerspectiveProps {
  children: React.ReactNode;
  maxRotation?: number; // max tilt degrees
  maxTranslation?: number; // max slide pixels
  className?: string;
}

export const MousePerspective: React.FC<MousePerspectiveProps> = ({
  children,
  maxRotation = 10,
  maxTranslation = 8,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw coordinate motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring inertia parameters
  const smoothX = useSpring(x, { stiffness: 150, damping: 25, mass: 0.6 });
  const smoothY = useSpring(y, { stiffness: 150, damping: 25, mass: 0.6 });

  // Map mouse offsets to degrees of rotation
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxRotation, maxRotation]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxRotation, -maxRotation]);

  // Map mouse offsets to translate offsets
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-maxTranslation, maxTranslation]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-maxTranslation, maxTranslation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative position from -0.5 to +0.5
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        x: translateX,
        y: translateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        willChange: 'transform',
      }}
      className={`transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};
