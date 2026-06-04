import React, { useState, useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowGradient?: string;
  glowColor?: string; // e.g. "rgba(0, 255, 136, 0.3)"
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  glowGradient = 'linear-gradient(137deg, #00ff88, #00d4ff, #00ff88)',
  glowColor = 'rgba(0, 255, 136, 0.35)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glowStyle, setGlowStyle] = useState({ opacity: 0.25, left: 0, top: 0, show: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max 6 degrees tilt for high-tech control
    const rotateX = ((centerY - y) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`);
    
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
      opacity: 0.25,
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
      {/* 3D Cursor-following Glow Background */}
      <div 
        className="absolute rounded-full blur-[80px] pointer-events-none transition-opacity duration-300"
        style={{
          background: glowGradient,
          opacity: glowStyle.show ? glowStyle.opacity : 0.15,
          left: glowStyle.show ? `${glowStyle.left}px` : '50%',
          top: glowStyle.show ? `${glowStyle.top}px` : '50%',
          width: '240px',
          height: '240px',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />

      {/* Double Clipped Cyberpunk Card Container */}
      <div 
        className="cyber-chamfer relative z-10 w-full h-full"
        style={{
          background: glowStyle.show ? glowGradient : '#2a2a3a',
          padding: '1.5px', // Creates the 1.5px border width
          transform: 'translateZ(20px)',
          transition: 'background 0.3s ease',
          filter: glowStyle.show ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
        }}
      >
        <div className="cyber-chamfer bg-cyber-card w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};
