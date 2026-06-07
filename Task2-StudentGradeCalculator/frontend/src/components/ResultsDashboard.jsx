import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { User, RotateCcw, Download, TrendingUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import ProgressRing from './ProgressRing';
import StatsCards from './StatsCards';
import AnimatedCounter from './AnimatedCounter';
import logo from '../assets/task_2_logo.png';
import illustration from '../assets/illustration.jpg';
import styles from './ResultsDashboard.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

function getSubjectLetterGrade(subject) {
  if (subject.incomplete) return 'I';
  const m = subject.marks;
  if (m >= 90) return 'O';
  if (m >= 80) return 'E';
  if (m >= 70) return 'A';
  if (m >= 60) return 'B';
  if (m >= 50) return 'C';
  if (m >= 40) return 'D';
  return 'F';
}

function getSubjectResult(subject) {
  if (subject.incomplete) return 'INCOMPLETE';
  return Number(subject.marks) >= 40 ? 'PASS' : 'FAIL';
}

function formatMarksheetRows(subjects) {
  return subjects.map((subject, index) => {
    const isSubInc = subject.incomplete;
    const subMarksDisplay = isSubInc ? '---' : subject.marks;
    const subGradeDisplay = getSubjectLetterGrade(subject);
    const subResultDisplay = getSubjectResult(subject);
    
    return `
      <tr>
        <td>${index + 1}</td>
        <td class="subject-name">${subject.name}</td>
        <td>100</td>
        <td>${subMarksDisplay}</td>
        <td>${subGradeDisplay}</td>
        <td>${subResultDisplay}</td>
      </tr>
    `;
  }).join('');
}

function getStatusBadgeClass(status) {
  if (status === 'PASS') return styles.pass;
  if (status === 'INCOMPLETE') return styles.incomplete;
  return styles.fail;
}

function getStatusLabel(status) {
  if (status === 'PASS') return 'PASSED';
  if (status === 'INCOMPLETE') return 'INCOMPLETE';
  return 'FAILED';
}

function renderStatusIcon(status) {
  if (status === 'PASS') return <CheckCircle2 size={16} />;
  if (status === 'INCOMPLETE') return <AlertCircle size={16} />;
  return <XCircle size={16} />;
}

export default function ResultsDashboard({ results, onReset, isResetting }) {
  const { studentName, grade, gradeInfo, status, percentage, totalMarks, maxTotal, performance, subjects } = results;

  const handlePrint = () => {
    const date = new Date().toLocaleString();
    const issueDate = new Date().toLocaleDateString();
    const scholarshipStatus = results.scholarshipEligible ? 'ELIGIBLE FOR SCHOLARSHIP' : 'NOT ELIGIBLE FOR SCHOLARSHIP';

    const rows = formatMarksheetRows(results.subjects);

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>GradeIQ Marksheet - ${results.studentName || 'Student'}</title>
          <style>
            @page { size: A4; margin: 8mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 10px;
              font-family: Arial, Helvetica, sans-serif;
              background: #ffffff;
              color: #000000;
            }
            .sheet {
              max-width: 760px;
              margin: 0 auto;
              padding: 0;
              background: #ffffff;
              border: 2px solid #111111;
              position: relative;
            }
            .sheet::before {
              content: "";
              position: absolute;
              left: 50%;
              top: 52%;
              width: 390px;
              height: 390px;
              background: url("${logo}") center / contain no-repeat;
              opacity: 0.11;
              transform: translate(-50%, -50%);
              pointer-events: none;
              z-index: 0;
            }
            .sheet-content {
              position: relative;
              z-index: 1;
            }
            .school-header {
              display: grid;
              grid-template-columns: 108px 1fr;
              align-items: center;
              min-height: 108px;
              border-bottom: 2px solid #111111;
              padding: 14px 18px 12px;
            }
            .logoBox {
              width: 78px;
              height: 78px;
              margin: 0 auto;
              object-fit: contain;
            }
            .school-title {
              margin: 0;
              text-align: center;
              font-size: 31px;
              line-height: 1.05;
              font-weight: 900;
              letter-spacing: 0.01em;
            }
            .school-address {
              margin: 7px 0 0;
              text-align: center;
              font-size: 16px;
            }
            .progress-title {
              border-bottom: 2px solid #111111;
              padding: 8px 10px;
              text-align: center;
              font-size: 15px;
              font-weight: 800;
              letter-spacing: 0.04em;
            }
            .info-table,
            .marks-table,
            .result-table,
            .grade-table {
              width: 100%;
              border-collapse: collapse;
            }
            .info-table td {
              border-right: 1px solid #111111;
              border-bottom: 1px solid #111111;
              padding: 7px 10px;
              font-size: 13px;
              line-height: 1.25;
            }
            .info-table td:last-child { border-right: 0; }
            .info-table .label {
              font-weight: 800;
              white-space: nowrap;
            }
            .info-table .value {
              display: inline-block;
              min-width: 120px;
              margin-left: 4px;
              border-bottom: 1px dotted #555555;
              padding-bottom: 1px;
            }
            .marks-table th,
            .marks-table td {
              border: 1px solid #111111;
              padding: 7px 6px;
              text-align: center;
              font-size: 12px;
              height: 30px;
            }
            .marks-table {
              border-left: 0;
              border-right: 0;
            }
            .marks-table th {
              font-weight: 800;
              background: rgba(255, 255, 255, 0.88);
            }
            .subject-name { text-align: left; font-weight: 600; }
            .total-row td {
              font-weight: 800;
              background: rgba(255, 255, 255, 0.9);
            }
            .result-table td {
              border: 1px solid #111111;
              padding: 9px 10px;
              font-size: 13px;
              vertical-align: top;
            }
            .result-label {
              display: block;
              font-weight: 800;
              transform: rotate(-45deg);
              width: 54px;
              margin: 28px auto;
            }
            .result-details div {
              margin-bottom: 4px;
              line-height: 1.25;
            }
            .grade-table {
              margin: 18px 14px 24px;
              width: calc(100% - 28px);
            }
            .grade-table td {
              border: 1px solid #111111;
              padding: 8px 7px;
              text-align: center;
              font-size: 13px;
              font-weight: 700;
            }
            .signature-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 34px;
              margin: 48px 28px 28px;
              text-align: center;
            }
            .signature-box {
              min-height: 82px;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              align-items: center;
            }
            .signature-mark {
              font-size: 22px;
              line-height: 1;
              color: #111111;
              transform: rotate(-4deg);
              margin-bottom: 5px;
            }
            .signature-teacher {
              font-family: "Segoe Script", "Brush Script MT", "Snell Roundhand", cursive;
              font-size: 23px;
              font-style: italic;
              letter-spacing: 0.02em;
              transform: rotate(-7deg) skewX(-8deg);
            }
            .signature-controller {
              font-family: "Lucida Handwriting", "Bradley Hand ITC", "Comic Sans MS", cursive;
              font-size: 18px;
              letter-spacing: -0.03em;
              transform: rotate(4deg) skewX(5deg);
            }
            .signature-principal {
              font-family: "Monotype Corsiva", "Brush Script MT", "Palatino Linotype", cursive;
              font-size: 26px;
              font-weight: 700;
              letter-spacing: 0.04em;
              transform: rotate(-2deg) skewX(-12deg);
              text-shadow: 0.25px 0 #111111;
            }
            .signature-line {
              width: 100%;
              border-top: 1px solid #111111;
              padding-top: 6px;
              font-size: 12px;
              font-weight: 800;
            }
            .signature-name {
              display: block;
              margin-top: 3px;
              font-size: 12px;
              font-weight: 700;
            }
            @media print {
              body { padding: 0; }
              .sheet { border-width: 2px; max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="sheet-content">
              <div class="school-header">
                <img class="logoBox" src="${logo}" alt="GradeIQ logo" />
                <div>
                  <h1 class="school-title">GradeIQ School</h1>
                  <p class="school-address">Official Academic Performance Report</p>
                </div>
              </div>

              <div class="progress-title">PROGRESS REPORT : 2026 - 27</div>

              <table class="info-table">
                <tr>
                  <td colspan="2"><span class="label">Student Name :</span><span class="value">${results.studentName || 'Student Name'}</span></td>
                  <td><span class="label">Subjects :</span><span class="value">${results.totalSubjects}</span></td>
                </tr>
                <tr>
                  <td><span class="label">Issue Date :</span><span class="value">${issueDate}</span></td>
                  <td><span class="label">Result :</span><span class="value">${results.status}</span></td>
                  <td><span class="label">Grade :</span><span class="value">${results.grade}</span></td>
                </tr>
              </table>

              <table class="marks-table">
                <thead>
                  <tr>
                    <th style="width: 8%;">S.No.</th>
                    <th>Subject</th>
                    <th style="width: 16%;">Max Marks</th>
                    <th style="width: 18%;">Marks Obtained</th>
                    <th style="width: 14%;">Grade</th>
                    <th style="width: 14%;">Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                  <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td>${results.maxTotal}</td>
                    <td>${results.totalMarks}</td>
                    <td>${results.grade}</td>
                    <td>${results.status}</td>
                  </tr>
                </tbody>
              </table>

              <table class="result-table">
                <tr>
                  <td style="width: 10%;"><span class="result-label">Result</span></td>
                  <td class="result-details">
                    <div><strong>Pass/Fail :</strong> ${results.status}</div>
                    <div><strong>Percentage :</strong> ${results.percentage}%</div>
                    <div><strong>Division :</strong> ${results.gradeInfo.label}</div>
                    <div><strong>Rank :</strong> ${results.rankPrediction || 'N/A'}</div>
                  </td>
                  <td class="result-details">
                    <div><strong>Total Marks :</strong> ${results.totalMarks} / ${results.maxTotal}</div>
                    <div><strong>Grade :</strong> ${results.grade}</div>
                    <div><strong>CGPA :</strong> ${results.gradeInfo.gpa.toFixed(1)}</div>
                    <div><strong>Scholarship :</strong> ${scholarshipStatus}</div>
                  </td>
                  <td class="result-details">
                    <div><strong>Remarks :</strong> ${results.remark || 'No additional remarks.'}</div>
                    <div><strong>Generated :</strong> ${date}</div>
                  </td>
                </tr>
              </table>

              <table class="grade-table">
                <tr>
                  <td>O: 90-100 (10)</td>
                  <td>E: 80-89 (9)</td>
                  <td>A: 70-79 (8)</td>
                  <td>B: 60-69 (7)</td>
                  <td>C: 50-59 (6)</td>
                  <td>D: 40-49 (5)</td>
                  <td>F: &lt;40 (2)</td>
                  <td>I: Incomplete (2)</td>
                </tr>
              </table>

              <div class="signature-row">
                <div class="signature-box">
                  <div class="signature-mark signature-teacher">Priya Sharma</div>
                  <div class="signature-line">Class Teacher Sign.</div>
                  <span class="signature-name">Ms. Priya Sharma</span>
                </div>
                <div class="signature-box">
                  <div class="signature-mark signature-controller">Rohan Sen</div>
                  <div class="signature-line">Controller Sign.</div>
                  <span class="signature-name">Mr. Rohan Sen</span>
                </div>
                <div class="signature-box">
                  <div class="signature-mark signature-principal">Abhik Mukherjee</div>
                  <div class="signature-line">Principal Sign & Stamp</div>
                  <span class="signature-name">Mr. Abhik Mukherjee</span>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      globalThis.print();
      return;
    }

    printWindow.document.documentElement.innerHTML = html;
    printWindow.focus();
    // Wait for the HTML elements to render before opening print dialog
    setTimeout(() => {
      printWindow.print();
    }, 150);
  };

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
              <div className={styles.gradeGpa}>CGPA: {gradeInfo.gpa.toFixed(1)}</div>
            </div>
          </div>

          <motion.div
            id="result-status-badge"
            className={`${styles.statusBadge} ${getStatusBadgeClass(status)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
          >
            {renderStatusIcon(status)}
            {getStatusLabel(status)}
          </motion.div>
        </div>

        {/* Middle — Illustration */}
        <div className={styles.heroMiddle}>
          <motion.img
            src={illustration}
            alt="Academic analytics illustration"
            className={styles.illustrationImg}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Right side — Progress Ring */}
        <div className={styles.heroRight}>
          <div className={styles.ringSection}>
            <ProgressRing
              percentage={Number.parseFloat(percentage)}
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
            key={m.label}
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

      {/* ——— AI Academic Insights ——— */}
      {results.academicHealthScore !== undefined && (
        <motion.div variants={cardVariants} className={`glass-card ${styles.insightsCard}`}>
          <div className={styles.insightsHeader}>
            <div className={styles.panelIcon} style={{ background: 'rgba(255, 107, 53, 0.12)', borderColor: 'rgba(255, 107, 53, 0.25)' }}>
              <TrendingUp size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 className={styles.insightsTitle}>AI Academic Insights</h3>
              <p className={styles.insightsSub}>Powered by GradeIQ Analytics Engine</p>
            </div>
          </div>

          <div className={styles.insightsGrid}>
            <div className={styles.insightStat}>
              <span className={styles.insightLabel}>Academic Health Score</span>
              <span className={styles.insightValue} style={{ color: 'var(--accent-primary)' }}>
                {results.academicHealthScore.toFixed(1)}%
              </span>
            </div>

            <div className={styles.insightStat}>
              <span className={styles.insightLabel}>Scholarship Status</span>
              <span className={`${styles.insightValue} ${results.scholarshipEligible ? styles.eligible : styles.notEligible}`}>
                {results.scholarshipEligible ? 'ELIGIBLE 🎉' : 'NOT ELIGIBLE'}
              </span>
            </div>

            <div className={styles.insightStat}>
              <span className={styles.insightLabel}>Strongest Subject</span>
              <span className={styles.insightValue} style={{ color: '#d1fae5' }}>
                {results.strongestSubject || 'N/A'}
              </span>
            </div>

            <div className={styles.insightStat}>
              <span className={styles.insightLabel}>Weakest Subject</span>
              <span className={styles.insightValue} style={{ color: '#fee2e2' }}>
                {results.weakestSubject || 'N/A'}
              </span>
            </div>

            <div className={styles.insightStat}>
              <span className={styles.insightLabel}>Rank Prediction</span>
              <span className={styles.insightValue} style={{ color: '#fed7aa' }}>
                {results.rankPrediction || 'N/A'}
              </span>
            </div>
          </div>

          {results.remark && (
            <div className={styles.remarkBlock}>
              <span className={styles.remarkTitle}>Remarks:</span>
              <p className={styles.remarkText}>"{results.remark}"</p>
            </div>
          )}

          {results.improvementSuggestions && results.improvementSuggestions.length > 0 && (
            <div className={styles.suggestionsBlock}>
              <span className={styles.suggestionsTitle}>Recommendations for Improvement:</span>
              <ul className={styles.suggestionsList}>
                {results.improvementSuggestions.map((sug) => (
                  <li key={sug} className={styles.suggestionItem}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* ——— Subject Breakdown ——— */}
      <motion.div variants={cardVariants} className={`glass-card ${styles.breakdownCard}`}>
        <h3 className={styles.breakdownTitle}>Subject Breakdown</h3>
        <div className={styles.breakdownList}>
          {subjects.map((subj, idx) => {
            const pct = Number(subj.marks);
            let barColor = '#ef4444';
            if (pct >= 90) {
              barColor = '#22c55e';
            } else if (pct >= 75) {
              barColor = '#4ade80';
            } else if (pct >= 60) {
              barColor = '#3b82f6';
            } else if (pct >= 50) {
              barColor = '#eab308';
            }
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
          disabled={isResetting}
          whileHover={isResetting ? {} : { scale: 1.04 }}
          whileTap={isResetting ? {} : { scale: 0.96 }}
        >
          <motion.span
            style={{ display: 'flex' }}
            animate={isResetting ? { rotate: 360 } : { rotate: 0 }}
            transition={isResetting ? { duration: 0.7, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RotateCcw size={16} />
          </motion.span>
          {isResetting ? 'Resetting…' : 'Calculate Again'}
        </motion.button>
        <motion.button
          id="dashboard-print-btn"
          className={`btn-glow ${styles.printBtn}`}
          onClick={handlePrint}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Download size={16} />
          Save Marksheet
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

ResultsDashboard.propTypes = {
  results: PropTypes.shape({
    studentName: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    gradeInfo: PropTypes.shape({
      color: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      gpa: PropTypes.number.isRequired,
    }).isRequired,
    status: PropTypes.string.isRequired,
    percentage: PropTypes.string.isRequired,
    totalMarks: PropTypes.number.isRequired,
    maxTotal: PropTypes.number.isRequired,
    performance: PropTypes.shape({
      label: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    }).isRequired,
    totalSubjects: PropTypes.number.isRequired,
    subjects: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      marks: PropTypes.number.isRequired,
    })).isRequired,
    academicHealthScore: PropTypes.number,
    scholarshipEligible: PropTypes.bool,
    strongestSubject: PropTypes.string,
    weakestSubject: PropTypes.string,
    remark: PropTypes.string,
    improvementSuggestions: PropTypes.arrayOf(PropTypes.string),
    rankPrediction: PropTypes.string,
  }).isRequired,
  onReset: PropTypes.func.isRequired,
  isResetting: PropTypes.bool,
};

ResultsDashboard.defaultProps = {
  isResetting: false,
};
