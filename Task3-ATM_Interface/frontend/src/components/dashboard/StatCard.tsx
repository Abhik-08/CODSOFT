import React from 'react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import type { IconType } from 'react-icons';

export type StatGradientId = 'primary-grad' | 'secondary-grad' | 'rose-grad' | 'accent-grad';

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  gradientId: StatGradientId;
  isCurrency?: boolean;
  trendText?: string;
  trendType?: 'up' | 'down' | 'neutral';
  delay?: number;
}

const GRADIENTS = {
  'primary-grad': {
    from: '#10b981', // emerald
    to: '#3b82f6',   // cyber blue
    glow: 'rgba(16, 185, 129, 0.22)',
  },
  'secondary-grad': {
    from: '#3b82f6', // cyber blue
    to: '#8b5cf6',   // royal purple
    glow: 'rgba(59, 130, 246, 0.22)',
  },
  'rose-grad': {
    from: '#f43f5e', // rose
    to: '#fb923c',   // orange
    glow: 'rgba(244, 63, 94, 0.22)',
  },
  'accent-grad': {
    from: '#8b5cf6', // purple
    to: '#10b981',   // emerald
    glow: 'rgba(139, 92, 246, 0.22)',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  gradientId,
  isCurrency = false,
  trendText,
  trendType = 'neutral',
  delay = 0,
}) => {
  const gradConfig = GRADIENTS[gradientId] || GRADIENTS['primary-grad'];

  const getTrendStyles = () => {
    if (trendType === 'up') {
      return {
        color: 'text-primary',
        bg: 'bg-primary/10 border-primary/15 dark:border-primary/10',
      };
    }
    if (trendType === 'down') {
      return {
        color: 'text-rose-500',
        bg: 'bg-rose-500/10 border-rose-500/15 dark:border-rose-500/10',
      };
    }
    return {
      color: 'text-dark-text/50 dark:text-dark-text/45 light:text-light-text/50',
      bg: 'bg-dark-border/20 light:bg-light-border/40 border-transparent',
    };
  };

  const getTrendIconSymbol = () => {
    if (trendType === 'up') return '▲';
    if (trendType === 'down') return '▼';
    return '•';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 22,
        delay,
      }}
      whileHover={{
        y: -3,
        scale: 1.01,
      }}
      className="glass-card rounded-2xl p-5 border border-[var(--border-dark)] relative overflow-hidden flex flex-col justify-between group transition-all duration-300"
    >
      {/* Hidden SVG Gradient Definition Injector */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradConfig.from} />
            <stop offset="100%" stopColor={gradConfig.to} />
          </linearGradient>
        </defs>
      </svg>

      {/* Ambient background glow orb */}
      <div 
        style={{ backgroundColor: gradConfig.from }}
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] dark:opacity-[0.02] blur-xl pointer-events-none group-hover:opacity-[0.06] dark:group-hover:opacity-[0.04] transition-all duration-300" 
      />

      <div className="flex justify-between items-start mb-4 select-none px-1 mt-1">
        <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-widest uppercase font-bold">
          {title}
        </span>
        
        {/* Modern Icon Holder Box */}
        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border-dark)] flex items-center justify-center transition-all duration-200 mr-2">
          <Icon 
            className="w-4 h-4 transition-transform duration-300 group-hover:scale-105" 
            style={{ fill: `url(#${gradientId})` }} 
          />
        </div>
      </div>

      <div className="px-1 mb-1">
        <h3 className="font-display font-semibold text-[24px] sm:text-[27px] text-[var(--text-primary)] tracking-tight mb-1">
          <AnimatedCounter value={value} isCurrency={isCurrency} />
        </h3>
        
        {trendText && (
          <div className="flex items-center gap-2 mt-2 select-none text-[11.5px]">
            <span className={`font-mono font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[10.5px] uppercase tracking-wider ${getTrendStyles().color} ${getTrendStyles().bg}`}>
              <span className="text-[9px]">{getTrendIconSymbol()}</span>
              <span>{trendText}</span>
            </span>
            <span className="font-mono text-[var(--text-muted)]/60">vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
