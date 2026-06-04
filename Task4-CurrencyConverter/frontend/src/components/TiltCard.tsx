import React, { useState, useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowGradient?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  glowGradient = 'linear-gradient(137deg, #3b82f6, #a855f7, #22d3ee, #3b82f6)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glowStyle, setGlowStyle] = useState({ opacity: 0.3, left: 0, top: 0, show: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation angles (max 10 degrees tilt)
    const rotateX = ((centerY - y) / centerY) * 8; // tilt up/down
    const rotateY = ((x - centerX) / centerX) * 8; // tilt left/right

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    
    setGlowStyle({
      opacity: 0.55,
      left: x,
      top: y,
      show: true,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlowStyle({
      opacity: 0.3,
      left: 0,
      top: 0,
      show: false,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="none"
      className={`relative w-full transition-all duration-300 ease-out h-full ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: transformStyle,
      }}
    >
      {/* Dynamic Cursor-following Glow Background */}
      <div 
        className="absolute rounded-full blur-3xl pointer-events-none transition-opacity duration-300 animate-border-glow"
        style={{
          background: glowGradient,
          backgroundSize: '200% 200%',
          opacity: glowStyle.show ? glowStyle.opacity : 0.25,
          left: glowStyle.show ? `${glowStyle.left}px` : '50%',
          top: glowStyle.show ? `${glowStyle.top}px` : '50%',
          width: '280px',
          height: '280px',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />
      {/* Foreground Container */}
      <div 
        className="relative z-10 w-full rounded-3xl overflow-hidden border-[3px] border-transparent animate-border-glow h-full"
        style={{
          background: `linear-gradient(#151518, #151518) padding-box, ${glowGradient} border-box`,
          backgroundSize: '200% 200%',
          transform: 'translateZ(20px)', // 3D depth layer
        }}
      >
        {children}
      </div>
    </div>
  );
};
