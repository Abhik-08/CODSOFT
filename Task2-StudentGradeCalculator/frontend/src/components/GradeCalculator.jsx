import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Hash, Plus, RotateCcw, Calculator, ChevronRight,
  AlertCircle, CheckCircle2, Loader2, Award
} from 'lucide-react';
import SubjectInput from './SubjectInput';
import ResultsDashboard from './ResultsDashboard';
import { createEmptySubject, GRADE_SCALE } from '../utils/gradeUtils';
import { apiService } from '../utils/apiService';
import styles from './GradeCalculator.module.css';

let idCounter = 1;
function genId() { return idCounter++; }

/* ===== Grade Legend Panel ===== */
function GradeLegendPanel() {
  return (
    <motion.div
      className={`glass-card ${styles.legendPanel}`}
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      <div className={styles.panelHeader}>
        <div
          className={styles.panelIcon}
          style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.3)' }}
        >
          <Award size={18} color="#7c3aed" />
        </div>
        <div>
          <h3 className={styles.panelTitle}>Grade Scale</h3>
          <p className={styles.panelSub}>Standard grading reference</p>
        </div>
      </div>

      <div className={styles.gradeList}>
        {GRADE_SCALE.map((g, i) => (
          <motion.div
            key={g.grade}
            className={styles.gradeRow}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ x: 4 }}
          >
            <span
              className={styles.gradeBadge}
              style={{
                background: `${g.color}20`,
                color: g.color,
                borderColor: `${g.color}40`,
              }}
            >
              {g.grade}
            </span>
            <span className={styles.gradeRange}>{g.min}% – {g.max}%</span>
            <span className={styles.gradeLabel} style={{ color: g.color }}>{g.label}</span>
            <span className={styles.gradeGpa}>GPA {g.gpa}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ===== Main Calculator ===== */
export default function GradeCalculator() {
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [subjectCount, setSubjectCount] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Step 1 → 2
  const handleGenerateSubjects = useCallback(() => {
    const errs = {};
    if (!studentName.trim()) errs.studentName = 'Student name is required';
    const count = Number.parseInt(subjectCount, 10);
    if (!subjectCount || Number.isNaN(count) || count < 1 || count > 20) {
      errs.subjectCount = 'Enter a number between 1 and 20';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const generated = Array.from({ length: count }, () => createEmptySubject(genId()));
    setSubjects(generated);
    setStep(2);
    setTimeout(() => {
      document.getElementById('subjects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [studentName, subjectCount]);

  // Change individual subject field
  const handleSubjectChange = useCallback((id, field, value) => {
    setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`subject_${id}_${field}`];
      delete next.general;
      return next;
    });
  }, []);

  const handleAddSubject = useCallback(() => {
    setSubjects((prev) => [...prev, createEmptySubject(genId())]);
  }, []);

  const handleRemoveSubject = useCallback((id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Calculate
  const handleCalculate = useCallback(async () => {
    const validateSubjects = () => {
      const errs = {};
      subjects.forEach((s) => {
        if (!s.name.trim()) errs[`subject_${s.id}_name`] = 'Required';
        const m = Number(s.marks);
        if (s.marks === '') errs[`subject_${s.id}_marks`] = 'Required';
        else if (Number.isNaN(m) || m < 0 || m > 100) errs[`subject_${s.id}_marks`] = '0–100 only';
      });
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };

    if (!validateSubjects()) return;
    setCalculating(true);
    setErrors({});

    try {
      const res = await apiService.calculateGrades(studentName.trim(), subjects);
      setResults(res);
      setStep(3);
      setCalculating(false);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setCalculating(false);
      if (err.validationErrors) {
        const mappedErrors = {};
        Object.entries(err.validationErrors).forEach(([key, msg]) => {
          if (key === 'studentName') {
            mappedErrors.studentName = msg;
          } else {
            // Match backend field: subjects[index].subjectName or subjects[index].marks
            const match = /subjects\[(\d+)\]\.(subjectName|marks)/.exec(key);
            if (match) {
              const idx = Number.parseInt(match[1], 10);
              const field = match[2] === 'subjectName' ? 'name' : 'marks';
              if (subjects[idx]) {
                mappedErrors[`subject_${subjects[idx].id}_${field}`] = msg;
              }
            }
          }
        });
        setErrors(mappedErrors);
      } else {
        setErrors({ general: err.message || 'An unexpected connection error occurred.' });
      }
    }
  }, [studentName, subjects]);

  // Reset — two-phase: animate out first, then wipe state
  const handleReset = useCallback(() => {
    if (isResetting) return;
    setIsResetting(true);

    // Phase 1: clear results so AnimatePresence exit plays
    setResults(null);
    setCalculating(false);
    setErrors({});

    // Phase 2: after exit animation (~500 ms), reset everything else
    setTimeout(() => {
      setStep(1);
      setStudentName('');
      setSubjectCount('');
      setSubjects([]);
      setIsResetting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 480);
  }, [isResetting]);

  const getSubjectError = (id) => {
    const n = errors[`subject_${id}_name`];
    const m = errors[`subject_${id}_marks`];
    if (!n && !m) return null;
    return { name: n, marks: m };
  };

  return (
    <div id="calculator" className={`section ${styles.calculatorSection}`}>
      <div className="container">

        {/* Section Header */}
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="badge badge-orange">
            <Calculator size={12} />
            Live Calculator
          </div>
          <h2 className={styles.sectionTitle}>
            Grade <span className="gradient-text">Calculator</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Enter your details, add subjects dynamically, and get instant performance analytics.
          </p>
        </motion.div>

        {/* Setup + Grade Scale Grid */}
        <div className={styles.calcGrid}>
          {/* Setup Panel */}
          <motion.div
            className={`glass-card ${styles.setupPanel}`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelIcon}><User size={18} /></div>
              <div>
                <h3 className={styles.panelTitle}>Student Setup</h3>
                <p className={styles.panelSub}>Enter basic information to begin</p>
              </div>
            </div>

            {/* Student Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="student-name-input">
                <User size={13} /> Student Name
              </label>
              <input
                id="student-name-input"
                type="text"
                className={`premium-input ${styles.formInput}`}
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => { setStudentName(e.target.value); setErrors((p) => ({ ...p, studentName: '' })); }}
                maxLength={60}
              />
              {errors.studentName && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.fieldError}>
                  <AlertCircle size={12} /> {errors.studentName}
                </motion.p>
              )}
            </div>

            {/* Subject Count */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="subject-count-input">
                <Hash size={13} /> Number of Subjects
                <span className={styles.hint}>(1 – 20)</span>
              </label>
              <input
                id="subject-count-input"
                type="number"
                className={`premium-input ${styles.formInput}`}
                placeholder="e.g. 5"
                value={subjectCount}
                onChange={(e) => { setSubjectCount(e.target.value); setErrors((p) => ({ ...p, subjectCount: '' })); }}
                min={1}
                max={20}
              />
              {errors.subjectCount && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.fieldError}>
                  <AlertCircle size={12} /> {errors.subjectCount}
                </motion.p>
              )}
            </div>

            {/* Generate Button */}
            <motion.button
              id="generate-subjects-btn"
              className={`btn-glow ${styles.generateBtn}`}
              onClick={handleGenerateSubjects}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ChevronRight size={18} />
              Generate Subject Fields
            </motion.button>

            {/* Steps Indicator */}
            <div className={styles.stepsIndicator}>
              {['Setup', 'Subjects', 'Results'].map((label, i) => {
                const isDone = step > i + 1;
                const isActive = step === i + 1;
                let stepClass = '';
                if (isDone) {
                  stepClass = styles.stepDone;
                } else if (isActive) {
                  stepClass = styles.stepActive;
                }
                const stepDotClass = `${styles.stepDot} ${stepClass}`;
                return (
                  <div key={label} className={styles.stepItem}>
                    <motion.div
                      className={stepDotClass}
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      {isDone ? <CheckCircle2 size={12} /> : i + 1}
                    </motion.div>
                    <span className={styles.stepLabel}>{label}</span>
                    {i < 2 && (
                      <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Grade Legend Panel */}
          <GradeLegendPanel />
        </div>

        {/* ====== SUBJECTS SECTION ====== */}
        <AnimatePresence>
          {step >= 2 && subjects.length > 0 && (
            <motion.div
              id="subjects-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={styles.subjectsSection}
            >
              <div className={`glass-card ${styles.subjectsCard} ${calculating ? styles.isCalculating : ''}`}>
                {/* Top sweeping progress bar during calculation */}
                <AnimatePresence>
                  {calculating && (
                    <motion.div
                      className={styles.calcProgressBar}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <div className={styles.subjectsHeader}>
                  <div className={styles.panelIcon}><Calculator size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <h3 className={styles.panelTitle}>Subject Marks Entry</h3>
                    <p className={styles.panelSub}>
                      {subjects.length} subject{subjects.length === 1 ? '' : 's'} — fill in all fields
                    </p>
                  </div>
                  <motion.button
                    id="add-subject-btn"
                    className={styles.addSubjectBtn}
                    onClick={handleAddSubject}
                    disabled={calculating}
                    whileHover={calculating ? {} : { scale: 1.05 }}
                    whileTap={calculating ? {} : { scale: 0.95 }}
                  >
                    <Plus size={15} /> Add Subject
                  </motion.button>
                </div>

                <div className={styles.subjectsList}>
                  <AnimatePresence mode="popLayout">
                    {subjects.map((subj, idx) => (
                      <SubjectInput
                        key={subj.id}
                        subject={subj}
                        index={idx}
                        onChange={handleSubjectChange}
                        onRemove={handleRemoveSubject}
                        canRemove={subjects.length > 1}
                        error={getSubjectError(subj.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#fee2e2',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <AlertCircle size={16} color="#fee2e2" />
                    <span>{errors.general}</span>
                  </motion.div>
                )}

                <div className={styles.calcActions}>
                  <motion.button
                    id="reset-btn"
                    className={styles.resetBtn}
                    onClick={handleReset}
                    disabled={isResetting}
                    whileHover={isResetting ? {} : { scale: 1.03 }}
                    whileTap={isResetting ? {} : { scale: 0.97 }}
                  >
                    <motion.span
                      style={{ display: 'flex' }}
                      animate={isResetting ? { rotate: 360 } : { rotate: 0 }}
                      transition={isResetting ? { duration: 0.7, repeat: Infinity, ease: 'linear' } : {}}
                    >
                      <RotateCcw size={16} />
                    </motion.span>
                    {isResetting ? 'Resetting…' : 'Reset All'}
                  </motion.button>

                  <motion.button
                    id="calculate-btn"
                    className={`btn-glow ${styles.calcBtn}`}
                    onClick={handleCalculate}
                    disabled={calculating || isResetting}
                    whileHover={calculating ? {} : { scale: 1.04 }}
                    whileTap={calculating ? {} : { scale: 0.97 }}
                  >
                    {calculating ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ display: 'flex' }}
                        >
                          <Loader2 size={17} />
                        </motion.span>
                        Calculating
                        <span className={styles.calcDots}>
                          <span /><span /><span />
                        </span>
                      </>
                    ) : (
                      <><Calculator size={17} /> Calculate Result</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== RESULTS SECTION ====== */}
        <AnimatePresence>
          {step === 3 && results && (
            <motion.div
              id="results-section"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <ResultsDashboard results={results} onReset={handleReset} isResetting={isResetting} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

GradeCalculator.propTypes = {};

GradeCalculator.defaultProps = {};
