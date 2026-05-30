import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import styles from './StatsCards.module.css';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function StatsCards({ results }) {
  const stats = [
    {
      id: 'stat-highest',
      label: 'Highest Marks',
      value: results.highest,
      suffix: '/100',
      decimals: 0,
      icon: '🏆',
      color: '#22c55e',
      desc: `${results.subjects.find(s => Number(s.marks) === results.highest)?.name || '–'}`,
    },
    {
      id: 'stat-lowest',
      label: 'Lowest Marks',
      value: results.lowest,
      suffix: '/100',
      decimals: 0,
      icon: '📉',
      color: '#ef4444',
      desc: `${results.subjects.find(s => Number(s.marks) === results.lowest)?.name || '–'}`,
    },
    {
      id: 'stat-average',
      label: 'Average Marks',
      value: results.average,
      suffix: '',
      decimals: 1,
      icon: '📊',
      color: '#3b82f6',
      desc: 'Per subject average',
    },
    {
      id: 'stat-subjects',
      label: 'Total Subjects',
      value: results.totalSubjects,
      suffix: '',
      decimals: 0,
      icon: '📚',
      color: '#a855f7',
      desc: `${results.passed} passed`,
    },
    {
      id: 'stat-pass-pct',
      label: 'Pass Percentage',
      value: results.passPercentage,
      suffix: '%',
      decimals: 1,
      icon: '✅',
      color: '#f59e0b',
      desc: `${results.passed} / ${results.totalSubjects} subjects`,
    },
    {
      id: 'stat-total',
      label: 'Total Marks',
      value: results.totalMarks,
      suffix: `/${results.maxTotal}`,
      decimals: 0,
      icon: '🎯',
      color: '#ff6b35',
      desc: `Score obtained`,
    },
  ];

  return (
    <motion.div
      className={styles.grid}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.id}
          id={stat.id}
          className={`sku-card ${styles.statCard}`}
          variants={item}
          whileHover={{ y: -6, boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 20px ${stat.color}20` }}
          style={{ '--card-color': stat.color }}
        >
          <div className={styles.cardTop}>
            <span className={styles.icon}>{stat.icon}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
          <div className={styles.value} style={{ color: stat.color }}>
            <AnimatedCounter
              target={stat.value}
              decimals={stat.decimals}
              duration={1.4}
            />
            <span className={styles.suffix}>{stat.suffix}</span>
          </div>
          <div className={styles.desc}>{stat.desc}</div>

          {/* Bottom accent bar */}
          <motion.div
            className={styles.accentBar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
