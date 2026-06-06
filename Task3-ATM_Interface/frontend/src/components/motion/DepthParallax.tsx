import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';

interface DepthParallaxProps {
  background?: React.ReactNode;
  middle?: React.ReactNode;
  foreground?: React.ReactNode;
  className?: string;
  intensity?: number; // scale the parallax strength
}

export const DepthParallax: React.FC<DepthParallaxProps> = ({
  background,
  middle,
  foreground,
  className = '',
  intensity = 1,
}) => {
  const { scrollY } = useScroll();

  // Scroll transforms for depth layers
  const bgScrollY = useTransform(scrollY, [0, 1000], [0, -100 * intensity]);
  const mdScrollY = useTransform(scrollY, [0, 1000], [0, -250 * intensity]);
  const fgScrollY = useTransform(scrollY, [0, 1000], [0, -400 * intensity]);

  // Mouse movement values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse movement inertia
  const smoothMouseX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  // Map mouse movement to different offsets for background, middle, foreground
  const bgMouseX = useTransform(smoothMouseX, [-500, 500], [-15 * intensity, 15 * intensity]);
  const bgMouseY = useTransform(smoothMouseY, [-500, 500], [-15 * intensity, 15 * intensity]);

  const mdMouseX = useTransform(smoothMouseX, [-500, 500], [-35 * intensity, 35 * intensity]);
  const mdMouseY = useTransform(smoothMouseY, [-500, 500], [-35 * intensity, 35 * intensity]);

  const fgMouseX = useTransform(smoothMouseX, [-500, 500], [-60 * intensity, 60 * intensity]);
  const fgMouseY = useTransform(smoothMouseY, [-500, 500], [-60 * intensity, 60 * intensity]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate cursor offset from center of window
      const x = e.clientX - globalThis.innerWidth / 2;
      const y = e.clientY - globalThis.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    globalThis.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => globalThis.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {/* Background layer - deepest */}
      {background && (
        <motion.div
          style={{
            y: bgScrollY,
            x: bgMouseX,
            translateY: bgMouseY,
            willChange: 'transform',
            zIndex: 10,
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {background}
        </motion.div>
      )}

      {/* Middle layer - focus depth */}
      {middle && (
        <motion.div
          style={{
            y: mdScrollY,
            x: mdMouseX,
            translateY: mdMouseY,
            willChange: 'transform',
            zIndex: 20,
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {middle}
        </motion.div>
      )}

      {/* Foreground layer - pop depth */}
      {foreground && (
        <motion.div
          style={{
            y: fgScrollY,
            x: fgMouseX,
            translateY: fgMouseY,
            willChange: 'transform',
            zIndex: 30,
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {foreground}
        </motion.div>
      )}
    </div>
  );
};
