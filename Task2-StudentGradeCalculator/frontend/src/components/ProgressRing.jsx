import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './ProgressRing.module.css';

export default function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 10,
  color = '#ff6b35',
  label,
  sublabel,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView) setTimeout(() => setAnimated(true), 200);
  }, [inView]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = animated ? ((100 - percentage) / 100) * circumference : circumference;

  const getColor = (pct) => {
    if (pct >= 90) return '#22c55e';
    if (pct >= 75) return '#4ade80';
    if (pct >= 60) return '#3b82f6';
    if (pct >= 50) return '#eab308';
    return '#ef4444';
  };

  const ringColor = color || getColor(percentage);
  const perfLabel =
    percentage >= 90 ? 'Excellent' :
    percentage >= 75 ? 'Good' :
    percentage >= 60 ? 'Average' : 'Needs Improvement';

  return (
    <div ref={ref} className={styles.ringWrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.ring}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Progress arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
          filter={`url(#glow-${size})`}
        />
      </svg>

      {/* Center content */}
      <div className={styles.center}>
        <motion.span
          className={styles.pctValue}
          style={{ color: ringColor }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={animated ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {animated ? `${parseFloat(percentage).toFixed(1)}%` : '0%'}
        </motion.span>
        {sublabel && (
          <motion.span
            className={styles.sublabel}
            initial={{ opacity: 0 }}
            animate={animated ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            {sublabel}
          </motion.span>
        )}
      </div>

      {/* Performance label below */}
      <motion.div
        className={styles.perfLabel}
        initial={{ opacity: 0, y: 8 }}
        animate={animated ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2 }}
        style={{ color: ringColor }}
      >
        {label || perfLabel}
      </motion.div>
    </div>
  );
}
