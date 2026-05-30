import { motion } from 'framer-motion';
import { Trophy, User, RotateCcw, Download, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import ProgressRing from './ProgressRing';
import StatsCards from './StatsCards';
import AnimatedCounter from './AnimatedCounter';
import styles from './ResultsDashboard.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

export default function ResultsDashboard({ results, onReset }) {
  const { studentName, grade, gradeInfo, status, percentage, totalMarks, maxTotal, performance, subjects } = results;
  const isPassed = status === 'PASS';

  const handlePrint = () => window.print();

  return (
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ——— Header Result Card ——— */}
      <motion.div
        variants={cardVariants}
        className={`${styles.resultHero} glass-card`}
        style={{ '--grade-color': gradeInfo.color }}
      >
        {/* Background grade watermark */}
        <div className={styles.gradeWatermark}>{grade}</div>

        {/* Left side */}
        <div className={styles.heroLeft}>
          <motion.div
            className={styles.studentBadge}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <User size={14} />
            Student Report
          </motion.div>

          <h2 className={styles.studentName}>{studentName}</h2>

          <div className={styles.gradeDisplay}>
            <motion.span
              className={styles.gradeLetterBig}
              style={{ color: gradeInfo.color }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            >
              {grade}
            </motion.span>
            <div>
              <div className={styles.gradeDesc} style={{ color: gradeInfo.color }}>{gradeInfo.label}</div>
              <div className={styles.gradeGpa}>GPA: {gradeInfo.gpa.toFixed(1)}</div>
            </div>
          </div>

          <motion.div
            id="result-status-badge"
            className={`${styles.statusBadge} ${isPassed ? styles.pass : styles.fail}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
          >
            {isPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {isPassed ? 'PASSED' : 'FAILED'}
          </motion.div>
        </div>

        {/* Right side — Progress Ring */}
        <div className={styles.heroRight}>
          <div className={styles.ringSection}>
            <ProgressRing
              percentage={parseFloat(percentage)}
              size={180}
              strokeWidth={12}
              color={gradeInfo.color}
            />
          </div>

          <div className={styles.marksTotal}>
            <span className={styles.marksBig}>
              <AnimatedCounter target={totalMarks} decimals={0} duration={1.5} />
            </span>
            <span className={styles.marksMax}>/ {maxTotal}</span>
          </div>
          <div className={styles.marksLabel}>Total Marks Obtained</div>
        </div>
      </motion.div>

      {/* ——— Summary Metrics ——— */}
      <motion.div variants={cardVariants} className={styles.metricsRow}>
        {[
          { label: 'Percentage', value: percentage, suffix: '%', color: gradeInfo.color, icon: '📈' },
          { label: 'Performance', value: performance.label, isText: true, icon: performance.emoji, color: performance.color },
          { label: 'Subjects', value: results.totalSubjects, suffix: '', color: '#a855f7', icon: '📚' },
        ].map((m, i) => (
          <motion.div
            key={i}
            className={`sku-card ${styles.metricCard}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <span className={styles.metricIcon}>{m.icon}</span>
            <div className={styles.metricValue} style={{ color: m.color }}>
              {m.isText ? m.value : (
                <><AnimatedCounter target={m.value} decimals={m.label === 'Percentage' ? 2 : 0} duration={1.5} />{m.suffix}</>
              )}
            </div>
            <div className={styles.metricLabel}>{m.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ——— Analytics Header ——— */}
      <motion.div variants={cardVariants} className={styles.sectionLabel}>
        <TrendingUp size={16} />
        Performance Analytics
      </motion.div>

      {/* ——— Stats Cards ——— */}
      <motion.div variants={cardVariants}>
        <StatsCards results={results} />
      </motion.div>

      {/* ——— Subject Breakdown ——— */}
      <motion.div variants={cardVariants} className={`glass-card ${styles.breakdownCard}`}>
        <h3 className={styles.breakdownTitle}>Subject Breakdown</h3>
        <div className={styles.breakdownList}>
          {subjects.map((subj, idx) => {
            const pct = Number(subj.marks);
            const barColor = pct >= 90 ? '#22c55e' : pct >= 75 ? '#4ade80' : pct >= 60 ? '#3b82f6' : pct >= 50 ? '#eab308' : '#ef4444';
            return (
              <motion.div
                key={subj.id}
                className={styles.breakdownRow}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.06 }}
              >
                <span className={styles.subjIndex}>{idx + 1}</span>
                <span className={styles.subjName}>{subj.name}</span>
                <div className={styles.barTrack}>
                  <motion.div
                    className={styles.barFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.6 + idx * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{ background: barColor }}
                  />
                </div>
                <span className={styles.subjMarks} style={{ color: barColor }}>{pct}</span>
                <span className={styles.subjMax}>/100</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ——— Actions ——— */}
      <motion.div variants={cardVariants} className={styles.dashActions}>
        <motion.button
          id="dashboard-reset-btn"
          className={styles.resetBtn}
          onClick={onReset}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <RotateCcw size={16} />
          Calculate Again
        </motion.button>
        <motion.button
          id="dashboard-print-btn"
          className={`btn-glow ${styles.printBtn}`}
          onClick={handlePrint}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Download size={16} />
          Save Report
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
