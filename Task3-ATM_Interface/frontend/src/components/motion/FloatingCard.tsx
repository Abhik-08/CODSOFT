import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface FloatingCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  maxTilt = 15,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Mouse coords mapped from -0.5 to 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 180,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 180,
    damping: 20,
  });

  // Glare / Reflection position values in percentages
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), {
    stiffness: 120,
    damping: 25,
  });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), {
    stiffness: 120,
    damping: 25,
  });

  // Inertia drift (attraction towards cursor)
  const driftX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 25,
  });
  const driftY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Relative coordinates (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(relativeX);
    mouseY.set(relativeY);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        x: driftX,
        y: driftY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        willChange: 'transform',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic light reflection sweep (glare) */}
      <motion.div
        className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hovered ? 0.15 : 0,
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) => {
              const xVal = typeof gx === 'number' ? gx : Number(gx);
              const yVal = typeof gy === 'number' ? gy : Number(gy);
              return `radial-gradient(circle at ${xVal}% ${yVal}%, rgba(255,255,255,0.8) 0%, transparent 60%)`;
            }
          ),
          mixBlendMode: 'overlay',
          willChange: 'opacity, background',
        }}
      />
      {children}
    </motion.div>
  );
};
