import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useAnimationFrame } from 'motion/react';

interface ScrollExperienceProps {
  children: React.ReactNode;
  scrollSpeedFactor?: number; // how much it reacts to scroll
  driftSpeed?: number; // scale the self-drift speed
  driftRange?: number; // max pixels it moves on its own
  className?: string;
}

export const ScrollExperience: React.FC<ScrollExperienceProps> = ({
  children,
  scrollSpeedFactor = 0.15,
  driftSpeed = 0.001,
  driftRange = 10,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion value for continuous drift
  const driftY = useMotionValue(0);
  const driftX = useMotionValue(0);

  // Scroll tracking
  const { scrollY } = useScroll();
  const scrollYOffset = useTransform(scrollY, [0, 1500], [0, -1500 * scrollSpeedFactor]);

  // Smooth springs to merge scroll and drift offsets
  const smoothDriftX = useSpring(driftX, { stiffness: 60, damping: 15 });
  const smoothDriftY = useSpring(driftY, { stiffness: 60, damping: 15 });

  // Continuous loop driving the slow weightless floating phase
  useAnimationFrame((time) => {
    // Trigonometric breathing cycle
    const offsetX = Math.sin(time * driftSpeed) * driftRange;
    const offsetY = Math.cos(time * driftSpeed * 0.8) * driftRange;
    
    driftX.set(offsetX);
    driftY.set(offsetY);
  });

  return (
    <motion.div
      ref={containerRef}
      style={{
        x: smoothDriftX,
        y: useTransform([smoothDriftY, scrollYOffset], ([dy, sy]) => (dy as number) + (sy as number)),
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
