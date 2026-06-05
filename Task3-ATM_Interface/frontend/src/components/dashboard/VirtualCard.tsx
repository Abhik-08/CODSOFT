import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'motion/react';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { FiWifi, FiEye, FiEyeOff, FiCopy, FiLock } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

interface VirtualCardProps {
  name: string;
  cardNumber: string;
  balance: number;
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
        cardBorderClass: 'border-[#5e6ad2]/40',
        cardBgClass: 'bg-gradient-to-b from-white/[0.08] to-white/[0.01] text-[#EDEDEF]',
        chipBgClass: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-200',
        borderOverlayClass: 'bg-gradient-to-r from-[#5e6ad2] via-purple-400 to-pink-400 opacity-20',
        shadowValue: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 60px rgba(94, 106, 210, 0.15)',
      },
      normal: {
        cardBorderClass: 'border-white/[0.08]',
        cardBgClass: 'bg-gradient-to-b from-white/[0.08] to-white/[0.01] text-[#EDEDEF]',
        chipBgClass: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-200',
        borderOverlayClass: 'bg-gradient-to-r from-[#5e6ad2] to-[#5e6ad2] opacity-5',
        shadowValue: '0 4px 24px rgba(0, 0, 0, 0.45)',
      }
    },
    light: {
      hovered: {
        cardBorderClass: 'border-[#5e6ad2]/35',
        cardBgClass: 'bg-gradient-to-b from-white/95 to-zinc-50/90 text-[#09090b]',
        chipBgClass: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-300',
        borderOverlayClass: 'bg-gradient-to-r from-[#5e6ad2] via-purple-400 to-pink-400 opacity-20',
        shadowValue: '0 12px 25px rgba(0, 0, 0, 0.08)',
      },
      normal: {
        cardBorderClass: 'border-black/[0.08]',
        cardBgClass: 'bg-gradient-to-b from-white/95 to-zinc-50/90 text-[#09090b]',
        chipBgClass: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-300',
        borderOverlayClass: 'bg-gradient-to-r from-[#5e6ad2] to-[#5e6ad2] opacity-5',
        shadowValue: '0 4px 12px rgba(0, 0, 0, 0.03)',
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
  balance,
  cardType = 'PLATINUM DEBIT',
  isFrozen = false,
  expiry = '06/31',
}) => {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMasked, setIsMasked] = useState(true);

  const isDark = theme === 'dark';

  // Retrieve formatted credentials
  const { fullCardNumber, displayedNumber } = getCardDetails(cardNumber, isMasked);

  // Retrieve neumorphic layout classes
  const { cardBorderClass, cardBgClass, chipBgClass, borderOverlayClass, shadowValue } = getCardThemeClasses(isFrozen, isDark, hovered);

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
  };

  const handleToggleMask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFrozen) {
      toast.error('Card is locked. Unlock in Profile to view credentials.');
      return;
    }
    setIsMasked(prev => !prev);
    toast.success(isMasked ? 'Card details decrypted!' : 'Card details masked.');
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
        }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY: totalRotateY,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            scale: hovered && !isFrozen ? 1.025 : 1,
            boxShadow: shadowValue,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
            {/* Corner Screws */}
            <div className="absolute top-2.5 left-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute top-2.5 right-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute bottom-2.5 left-2.5 corner-screw opacity-40 z-20" />
            <div className="absolute bottom-2.5 right-2.5 corner-screw opacity-40 z-20" />

            {/* Ambient Glow Orbs behind card (only visible if active) */}
            {!isFrozen && (
              <div className="absolute bottom-[-20%] right-[-10%] w-36 h-36 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none transition-all duration-300 animate-pulse-glow" />
            )}

            {/* Glowing Border Overlay */}
            <div className={`absolute inset-0 rounded-2xl p-[1px] pointer-events-none transition-opacity duration-300 ${borderOverlayClass}`} />

            {/* Dynamic Specular Glare */}
            {!isFrozen && (
              <motion.div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-80"
                style={{ background: specularBg }}
              />
            )}

            {/* Frost/Ice Glaze Texture Overlay when Frozen */}
            {isFrozen && (
              <div className="absolute inset-0 bg-blue-400/5 backdrop-blur-[0.5px] pointer-events-none z-10 border border-blue-400/10 rounded-2xl" />
            )}

            {/* Front Header */}
            <div className="flex justify-between items-start relative z-10 px-2" style={{ transform: 'translateZ(30px)' }}>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest font-black">
                  NEXUS VIP PROTOCOL
                </span>
                <span className="font-mono font-bold text-[13px] tracking-wider uppercase mt-0.5">
                  {cardType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiWifi className="w-5 h-5 opacity-40 transform rotate-90" />
              </div>
            </div>

            {/* EMV Microchip & custom brand logo */}
            <div className="flex items-center justify-between relative z-10 my-2.5 px-2" style={{ transform: 'translateZ(40px)' }}>
              {/* Gold/Silver Microchip */}
              <div className={`w-10 h-8 rounded-lg p-[1px] relative overflow-hidden shadow-inner ${chipBgClass}`}>
                <div className="w-full h-full border border-black/10 rounded-lg flex flex-wrap p-0.5 opacity-60">
                  <div className="w-1/2 h-1/2 border-r border-b border-black/20" />
                  <div className="w-1/2 h-1/2 border-b border-black/20" />
                  <div className="w-1/2 h-1/2 border-r border-black/20" />
                  <div className="w-1/2 h-1/2" />
                </div>
              </div>

              {/* Circular minimalist telemetry accent */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full border border-[var(--border-dark)] bg-black/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <span className={`w-3 h-3 rounded-full ${isFrozen ? 'bg-zinc-500' : 'bg-[var(--accent)] shadow-[0_0_6px_2px_rgba(94,106,210,0.5)] animate-pulse'}`} />
              </div>
            </div>

            {/* Card Number */}
            <div className="flex flex-col justify-end gap-1 relative z-10 px-2" style={{ transform: 'translateZ(50px)' }}>
              <span className="font-mono font-black tracking-[3px] text-[14px] sm:text-[16px] text-left">
                {displayedNumber}
              </span>

              {/* Cardholder name, Expiry, and Balance */}
              <div className="flex justify-between items-end mt-2.5">
                <div className="flex flex-col text-left">
                  <span className="text-[7.5px] font-mono opacity-50 uppercase tracking-widest">
                    Cardholder
                  </span>
                  <span className="font-mono font-bold text-[11px] uppercase tracking-wide">
                    {name}
                  </span>
                </div>

                <div className="flex flex-col text-center">
                  <span className="text-[7.5px] font-mono opacity-50 uppercase tracking-widest">
                    Expiry
                  </span>
                  <span className="font-mono font-bold text-[11px]">
                    {expiry}
                  </span>
                </div>

                <div className="flex flex-col text-right items-end bg-dark-surface/10 dark:bg-black/20 border border-dark-border/10 rounded-xl px-2.5 py-0.5 shadow-recessed">
                  <span className="text-[7px] font-mono opacity-50 uppercase tracking-widest">
                    Balance
                  </span>
                  <span className="font-mono font-black text-[12px] text-primary tracking-wide">
                    <AnimatedCounter value={balance} isCurrency={true} />
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
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-80"
                style={{ background: specularBg }}
              />
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

              {/* Holographic Seal Circle */}
              <div className={`w-8 h-8 rounded-full p-[1px] opacity-75 shadow-lg ${
                isFrozen
                  ? 'bg-slate-400/50'
                  : 'bg-gradient-to-tr from-accent via-secondary to-primary animate-pulse-glow'
              }`}>
                <div className="w-full h-full bg-slate-900/60 dark:bg-black/40 rounded-full border border-white/10 flex items-center justify-center text-[7px] font-mono font-black text-white/50 uppercase tracking-widest">
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
