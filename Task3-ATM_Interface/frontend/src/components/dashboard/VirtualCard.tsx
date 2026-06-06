import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'motion/react';
import { FiWifi, FiEye, FiEyeOff, FiCopy, FiLock } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

interface VirtualCardProps {
  name: string;
  cardNumber: string;
  cardType?: string;
  isFrozen?: boolean;
  expiry?: string;
}

// Helper 1: Card details and masking calculations
const getCardDetails = (cardNumber: string, isMasked: boolean) => {
  const cleanNumber = cardNumber ? cardNumber.replace(/\s+/g, '') : '4532781290128910';
  const padded = cleanNumber.padEnd(16, '•');
  const blocks = padded.match(/.{1,4}/g) || [];
  const fullCardNumber = blocks.join('  ');
  const lastFour = cleanNumber.slice(-4);
  const maskedCardNumber = `••••  ••••  ••••  ${lastFour}`;
  const displayedNumber = isMasked ? maskedCardNumber : fullCardNumber;
  return { fullCardNumber, displayedNumber };
};

interface CardTheme {
  cardBorderClass: string;
  cardBgClass: string;
  chipBgClass: string;
  borderOverlayClass: string;
  shadowValue: string;
}

const CARD_THEMES: {
  frozen: {
    dark: CardTheme;
    light: CardTheme;
  };
  active: {
    dark: {
      hovered: CardTheme;
      normal: CardTheme;
    };
    light: {
      hovered: CardTheme;
      normal: CardTheme;
    };
  };
} = {
  frozen: {
    dark: {
      cardBorderClass: 'border-zinc-800',
      cardBgClass: 'bg-zinc-900/60 text-zinc-500 opacity-60',
      chipBgClass: 'bg-zinc-700/35',
      borderOverlayClass: 'border-transparent',
      shadowValue: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    light: {
      cardBorderClass: 'border-zinc-200',
      cardBgClass: 'bg-zinc-100/70 text-zinc-400 opacity-60',
      chipBgClass: 'bg-zinc-700/35',
      borderOverlayClass: 'border-transparent',
      shadowValue: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }
  },
  active: {
    dark: {
      hovered: {
        cardBorderClass: 'border-[var(--accent)]/40',
        cardBgClass: 'bg-gradient-to-br from-[#06080a] via-[#10141a] to-[#010203] text-white',
        chipBgClass: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600',
        borderOverlayClass: 'bg-gradient-to-r from-[var(--accent)] via-indigo-400 to-cyan-300 opacity-40',
        shadowValue: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 162, 255, 0.25)',
      },
      normal: {
        cardBorderClass: 'border-white/[0.06]',
        cardBgClass: 'bg-gradient-to-br from-[#040506] via-[#0b0c0e] to-[#010203] text-[#EDEDEF]',
        chipBgClass: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600',
        borderOverlayClass: 'bg-gradient-to-r from-[var(--accent)] via-amber-500 to-[var(--accent)] opacity-15',
        shadowValue: '0 8px 32px rgba(0, 0, 0, 0.55)',
      }
    },
    light: {
      hovered: {
        cardBorderClass: 'border-indigo-400/30',
        cardBgClass: 'bg-gradient-to-br from-white via-indigo-50/50 to-zinc-100 text-black',
        chipBgClass: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-300',
        borderOverlayClass: 'bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 opacity-30',
        shadowValue: '0 15px 30px rgba(94, 106, 210, 0.15)',
      },
      normal: {
        cardBorderClass: 'border-zinc-200',
        cardBgClass: 'bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-[#0f172a]',
        chipBgClass: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-300',
        borderOverlayClass: 'bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10',
        shadowValue: '0 6px 16px rgba(0, 0, 0, 0.04)',
      }
    }
  }
};

// Helper 2: Style resolver to reduce Cognitive Complexity
const getCardThemeClasses = (isFrozen: boolean, isDark: boolean, hovered: boolean) => {
  const themeKey = isDark ? 'dark' : 'light';
  if (isFrozen) {
    return CARD_THEMES.frozen[themeKey];
  }
  const hoverKey = hovered ? 'hovered' : 'normal';
  return CARD_THEMES.active[themeKey][hoverKey];
};

export const VirtualCard: React.FC<VirtualCardProps> = ({
  name,
  cardNumber,
  cardType = 'PLATINUM DEBIT',
  isFrozen = false,
  expiry = '06/31',
}) => {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMasked, setIsMasked] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
  };

  const isDark = theme === 'dark';

  // Retrieve formatted credentials
  const { fullCardNumber, displayedNumber } = getCardDetails(cardNumber, isMasked);

  // Retrieve neumorphic layout classes
  const { cardBorderClass, cardBgClass, borderOverlayClass, shadowValue } = getCardThemeClasses(isFrozen, isDark, hovered);

  // Motion values for 3D tilt tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth rotation with spring dampening
  const springConfig = { damping: 22, stiffness: 160, mass: 0.6 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Tilt dampening factor when card is frozen
  const tiltFactor = isFrozen ? 0.08 : 1;

  // Map coordinates to rotational angles
  const rotateX = useTransform(ySpring, [-135, 135], [15 * tiltFactor, -15 * tiltFactor]);
  const rotateY = useTransform(xSpring, [-210, 210], [-15 * tiltFactor, 15 * tiltFactor]);

  // Specular glare mouse tracking
  const shineX = useTransform(xSpring, [-210, 210], [0, 100]);
  const shineY = useTransform(ySpring, [-135, 135], [0, 100]);
  
  // Motion template for specular glare background radial gradient
  const specularBg = useMotionTemplate`radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 55%)`;

  // Flip rotation state
  const flipAngle = useMotionValue(0);
  const flipSpring = useSpring(flipAngle, { damping: 25, stiffness: 120 });

  // Update flip angle when flip state changes
  React.useEffect(() => {
    flipAngle.set(isFlipped ? 180 : 0);
  }, [isFlipped, flipAngle]);

  // Combine tilt and flip Y-axis rotation (reverse tilt when card is flipped to maintain visual physics)
  const totalRotateY = useTransform([rotateY, flipSpring], ([tiltVal, flipVal]) => {
    const flipSign = (flipVal as number) > 90 ? -1 : 1;
    return (tiltVal as number) * flipSign + (flipVal as number);
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFrozen) {
      toast.error('Card is locked. Unlock in Profile to copy credentials.');
      return;
    }
    const rawNumber = fullCardNumber.replace(/\s+/g, '');
    navigator.clipboard.writeText(rawNumber);
    toast.success('Card number copied to clipboard!');
    triggerShake();
  };

  const handleToggleMask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFrozen) {
      toast.error('Card is locked. Unlock in Profile to view credentials.');
      return;
    }
    setIsMasked(prev => !prev);
    toast.success(isMasked ? 'Card details decrypted!' : 'Card details masked.');
    triggerShake();
  };


  return (
    <div className="w-full max-w-[420px] select-none flex flex-col items-center">
      {/* 3D Card Container - Interactive Card Button */}
      <button 
        type="button"
        aria-label="Interactive Virtual Credit Card, click to flip"
        className="w-full aspect-[1.58/1] cursor-pointer relative block p-0 border-0 bg-transparent text-left outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setHovered(true)}
        onClick={() => {
          if (isFrozen) {
            toast.error('Card is frozen. Unlock in Profile to interact.');
            return;
          }
          setIsFlipped(prev => !prev);
          triggerShake();
        }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY: totalRotateY,
            transformStyle: 'preserve-3d',
          }}
          animate={isShaking ? {
            rotateX: [0, 10, -10, 8, -8, 5, -3, 0],
            rotateY: [0, -10, 10, -8, 8, -5, 3, 0],
            z: [0, 8, -8, 6, -6, 4, -2, 0],
            scale: hovered && !isFrozen ? 1.025 : 1,
            boxShadow: shadowValue,
          } : {
            scale: hovered && !isFrozen ? 1.025 : 1,
            boxShadow: shadowValue,
          }}
          transition={isShaking ? {
            duration: 0.55,
            ease: "easeInOut",
          } : {
            type: 'spring', stiffness: 300, damping: 20
          }}
          className="w-full h-full relative"
        >
          {/* ==================== FRONT FACE ==================== */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`absolute inset-0 rounded-2xl overflow-hidden p-6 flex flex-col justify-between border transition-all duration-500 ${cardBorderClass} ${cardBgClass}`}
          >
            {/* Cyber mechatronic grid line/circuit overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none mix-blend-overlay opacity-60 z-1" />

            {/* Corner Screws */}
            <div className="absolute top-2.5 left-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute top-2.5 right-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute bottom-2.5 left-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute bottom-2.5 right-2.5 corner-screw opacity-40 z-20" />

            {/* Ambient Glow Orbs behind card (only visible if active) */}
            {!isFrozen && (
              <div className="absolute bottom-[-20%] right-[-10%] w-36 h-36 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none transition-all duration-300 animate-pulse-glow" />
            )}

            {/* Glowing Border Overlay */}
            <div className={`absolute inset-0 rounded-2xl p-[1px] pointer-events-none transition-opacity duration-300 ${borderOverlayClass}`} />

            {/* Dynamic Specular Glare Mouse Tracking */}
            {!isFrozen && (
              <motion.div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-80 z-10"
                style={{ background: specularBg }}
              />
            )}

            {/* Specular glare light reflection sweep */}
            {!isFrozen && (
              <div className="absolute -inset-y-12 w-16 bg-white/10 blur-md pointer-events-none z-15 animate-glare-sweep mix-blend-overlay" style={{ transformOrigin: 'center' }} />
            )}

            {/* Frost/Ice Glaze Texture Overlay when Frozen */}
            {isFrozen && (
              <div className="absolute inset-0 bg-blue-400/5 backdrop-blur-[0.5px] pointer-events-none z-10 border border-blue-400/10 rounded-2xl" />
            )}

            {/* Front Header */}
            <div className="flex justify-between items-start relative z-10 px-2" style={{ transform: 'translateZ(30px)' }}>
              <div className="flex flex-col text-left">
                <span className="text-[8.5px] font-mono opacity-50 uppercase tracking-widest font-black">
                  NEXUS SECURE SYSTEM
                </span>
                <span className="font-mono font-bold text-[12px] tracking-widest uppercase mt-0.5 text-shadow-sm">
                  {cardType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiWifi className="w-5 h-5 opacity-40 transform rotate-90" />
              </div>
            </div>

            {/* EMV Microchip & custom brand logo */}
            <div className="flex items-center justify-between relative z-10 my-2.5 px-2" style={{ transform: 'translateZ(40px)' }}>
              {/* Gold EMV Microchip with realistic gold lines and sweep shimmer */}
              <div className="w-11 h-9 rounded-lg p-[1px] relative overflow-hidden shadow-lg shadow-black/40 border border-amber-600/30 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                <div className="w-full h-full border border-black/15 rounded-lg flex flex-wrap p-0.5 opacity-80">
                  <div className="w-1/3 h-1/2 border-r border-b border-black/25" />
                  <div className="w-1/3 h-1/2 border-r border-b border-black/25" />
                  <div className="w-1/3 h-1/2 border-b border-black/25" />
                  <div className="w-1/3 h-1/2 border-r border-black/25" />
                  <div className="w-1/3 h-1/2 border-r border-black/25" />
                  <div className="w-1/3 h-1/2" />
                </div>
              </div>

              {/* Holographic Refractive Security Badge */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 via-yellow-300 via-purple-500 to-emerald-400 opacity-90 shadow-md relative overflow-hidden flex items-center justify-center p-[1px] animate-hologram">
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-black/30 mix-blend-overlay" />
                <div className="w-full h-full rounded-full bg-slate-900/85 backdrop-blur-xs flex items-center justify-center text-[7.5px] font-mono font-black text-cyan-300 tracking-tighter">
                  NXS
                </div>
              </div>
            </div>

            {/* Card Number */}
            <div className="flex flex-col justify-end gap-1 relative z-10 px-2" style={{ transform: 'translateZ(50px)' }}>
              <span className="font-mono font-black tracking-[4px] text-[15px] sm:text-[17px] text-left text-shadow-sm uppercase">
                {displayedNumber}
              </span>

              {/* Cardholder name and Expiry */}
              <div className="flex justify-between items-end mt-2.5">
                <div className="flex flex-col text-left">
                  <span className="text-[7.5px] font-mono opacity-50 uppercase tracking-widest">
                    Cardholder
                  </span>
                  <span className="font-mono font-bold text-[11px] uppercase tracking-wide">
                    {name}
                  </span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[7.5px] font-mono opacity-50 uppercase tracking-widest">
                    Expiry
                  </span>
                  <span className="font-mono font-bold text-[11px]">
                    {expiry}
                  </span>
                </div>
              </div>
            </div>

            {/* Frozen Overlay Ring / Badge */}
            {isFrozen && (
              <div className="absolute inset-0 z-30 bg-blue-900/10 backdrop-blur-[1.5px] flex items-center justify-center pointer-events-none">
                <div className="bg-slate-900/90 dark:bg-slate-950/90 border border-rose-500/35 rounded-xl px-4 py-2 flex items-center gap-2 shadow-2xl scale-100 transition-all duration-300">
                  <FiLock className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-black tracking-widest text-slate-100 uppercase">
                    CARD LOCKED
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ==================== BACK FACE ==================== */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className={`absolute inset-0 rounded-2xl overflow-hidden py-6 flex flex-col justify-between border transition-all duration-500 ${cardBorderClass} ${cardBgClass}`}
          >
            {/* Cyber grid lines for back face */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none mix-blend-overlay opacity-60 z-1" />

            {/* Magnetic Stripe */}
            <div className="w-full h-9 bg-black/90 dark:bg-black/95 relative z-10" />

            {/* Corner Screws (Back) */}
            <div className="absolute top-2.5 left-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute top-2.5 right-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute bottom-2.5 left-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute bottom-2.5 right-2.5 corner-screw opacity-40 z-20" />

            {/* Specular Glare (Back) */}
            {!isFrozen && (
              <motion.div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-80 z-10"
                style={{ background: specularBg }}
              />
            )}

            {/* Glare sweep for back face */}
            {!isFrozen && (
              <div className="absolute -inset-y-12 w-16 bg-white/10 blur-md pointer-events-none z-15 animate-glare-sweep mix-blend-overlay" />
            )}

            {/* Frost/Ice Glaze Texture Overlay when Frozen */}
            {isFrozen && (
              <div className="absolute inset-0 bg-blue-400/5 backdrop-blur-[0.5px] pointer-events-none z-10 border border-blue-400/10 rounded-2xl" />
            )}

            {/* Signature Area & CVV Panel */}
            <div className="px-6 flex items-center justify-between gap-4 mt-2.5 relative z-10" style={{ transform: 'translateZ(40px)' }}>
              {/* Signature Strip */}
              <div className="flex-1 h-8 bg-slate-200/90 dark:bg-white/10 rounded-md pl-3 flex items-center border border-slate-300/30 dark:border-white/5 shadow-inner">
                <span className="font-serif italic text-xs tracking-wide text-slate-800 dark:text-slate-200 select-none opacity-80 font-bold">
                  {name}
                </span>
              </div>

              {/* CVV Panel */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[7.5px] font-mono opacity-50 uppercase tracking-widest select-none">
                  CVV Code
                </span>
                <div className="bg-amber-100/90 dark:bg-[#1e1f29] border border-amber-300/40 dark:border-white/5 rounded-md px-3.5 h-8 flex items-center justify-center font-mono text-[11px] text-slate-800 dark:text-slate-100 font-bold shadow-sm select-none">
                  <span className="tracking-widest">{isMasked ? '•••' : '375'}</span>
                </div>
              </div>
            </div>

            {/* Holographic Watermark Circle */}
            <div className="px-6 flex justify-between items-end gap-6 relative z-10" style={{ transform: 'translateZ(50px)' }}>
              {/* Legal Warning Notice */}
              <div className="text-left max-w-[65%] flex flex-col gap-0.5">
                <span className="text-[6.5px] font-mono opacity-40 leading-snug">
                  AUTHORIZED SIGNATURE • NOT VALID UNLESS SIGNED
                </span>
                <span className="text-[5.5px] font-mono opacity-30 leading-tight">
                  This card remains the property of NEXUS SECURE VAULT. Subject to terminal banking terms.
                  Support node: terminal-node-sf4.nexus.net. Operations logged securely.
                </span>
              </div>

              {/* Holographic Seal Circle (Back) */}
              <div className={`w-9 h-9 rounded-full p-[1px] opacity-85 shadow-lg ${
                isFrozen
                  ? 'bg-slate-400/50'
                  : 'bg-gradient-to-tr from-cyan-400 via-pink-400 via-yellow-300 via-purple-500 to-emerald-400 animate-hologram'
              }`}>
                <div className="w-full h-full bg-slate-900/80 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center text-[7.5px] font-mono font-black text-cyan-300 tracking-tighter uppercase">
                  NXS
                </div>
              </div>
            </div>

            {/* Frozen Overlay Ring / Badge */}
            {isFrozen && (
              <div className="absolute inset-0 z-30 bg-blue-900/10 backdrop-blur-[1.5px] flex items-center justify-center pointer-events-none">
                <div className="bg-slate-900/90 dark:bg-slate-950/90 border border-rose-500/35 rounded-xl px-4 py-2 flex items-center gap-2 shadow-2xl">
                  <FiLock className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-black tracking-widest text-slate-100 uppercase">
                    CARD LOCKED
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </button>

      {/* Interactive Controls Bar underneath the card - styled as tactile keys */}
      <div className="flex justify-center items-center gap-3.5 mt-5 relative z-25 flex-wrap">
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider tactile-key flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <FiCopy className="w-3.5 h-3.5 text-secondary" />
          <span>Copy Number</span>
        </button>
        
        <button
          type="button"
          onClick={handleToggleMask}
          className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider tactile-key flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm"
        >
          {isMasked ? <FiEye className="w-3.5 h-3.5 text-accent" /> : <FiEyeOff className="w-3.5 h-3.5 text-accent" />}
          <span>{isMasked ? 'Reveal details' : 'Mask details'}</span>
        </button>
      </div>
    </div>
  );
};
