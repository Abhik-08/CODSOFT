import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Hash, Plus, RotateCcw, Calculator, ChevronRight,
  AlertCircle, CheckCircle2, Loader2, Award
} from 'lucide-react';
import SubjectInput from './SubjectInput';
import ResultsDashboard from './ResultsDashboard';
import { calculateResults, createEmptySubject, GRADE_SCALE } from '../utils/gradeUtils';
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

  // Step 1 → 2
  const handleGenerateSubjects = useCallback(() => {
    const errs = {};
    if (!studentName.trim()) errs.studentName = 'Student name is required';
    const count = parseInt(subjectCount, 10);
    if (!subjectCount || isNaN(count) || count < 1 || count > 20) {
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
      return next;
    });
  }, []);

  const handleAddSubject = useCallback(() => {
    setSubjects((prev) => [...prev, createEmptySubject(genId())]);
  }, []);

  const handleRemoveSubject = useCallback((id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Validate all subjects
  const validateSubjects = () => {
    const errs = {};
    subjects.forEach((s) => {
      if (!s.name.trim()) errs[`subject_${s.id}_name`] = 'Required';
      const m = Number(s.marks);
      if (s.marks === '') errs[`subject_${s.id}_marks`] = 'Required';
      else if (isNaN(m) || m < 0 || m > 100) errs[`subject_${s.id}_marks`] = '0–100 only';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Calculate
  const handleCalculate = useCallback(() => {
    if (!validateSubjects()) return;
    setCalculating(true);
    setTimeout(() => {
      const res = calculateResults(studentName.trim(), subjects);
      setResults(res);
      setStep(3);
      setCalculating(false);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 900);
  }, [studentName, subjects]);

  // Reset
  const handleReset = () => {
    setStep(1);
    setStudentName('');
    setSubjectCount('');
    setSubjects([]);
    setErrors({});
    setResults(null);
    setCalculating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSubjectError = (id) => {
    const n = errors[`subject_${id}_name`];
    const m = errors[`subject_${id}_marks`];
    if (!n && !m) return null;
    return { name: n, marks: m };
  };

  return (
    <div className={`section ${styles.calculatorSection}`}>
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
              {['Setup', 'Subjects', 'Results'].map((label, i) => (
                <div key={label} className={styles.stepItem}>
                  <motion.div
                    className={`${styles.stepDot} ${step > i + 1 ? styles.stepDone : step === i + 1 ? styles.stepActive : ''}`}
                    animate={step === i + 1 ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    {step > i + 1 ? <CheckCircle2 size={12} /> : i + 1}
                  </motion.div>
                  <span className={styles.stepLabel}>{label}</span>
                  {i < 2 && (
                    <div className={`${styles.stepLine} ${step > i + 1 ? styles.stepLineDone : ''}`} />
                  )}
                </div>
              ))}
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
              <div className={`glass-card ${styles.subjectsCard}`}>
                <div className={styles.subjectsHeader}>
                  <div className={styles.panelIcon}><Calculator size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <h3 className={styles.panelTitle}>Subject Marks Entry</h3>
                    <p className={styles.panelSub}>
                      {subjects.length} subject{subjects.length !== 1 ? 's' : ''} — fill in all fields
                    </p>
                  </div>
                  <motion.button
                    id="add-subject-btn"
                    className={styles.addSubjectBtn}
                    onClick={handleAddSubject}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

                <div className={styles.calcActions}>
                  <motion.button
                    id="reset-btn"
                    className={styles.resetBtn}
                    onClick={handleReset}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <RotateCcw size={16} /> Reset All
                  </motion.button>

                  <motion.button
                    id="calculate-btn"
                    className={`btn-glow ${styles.calcBtn}`}
                    onClick={handleCalculate}
                    disabled={calculating}
                    whileHover={!calculating ? { scale: 1.04 } : {}}
                    whileTap={!calculating ? { scale: 0.97 } : {}}
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
                        Calculating…
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
              <ResultsDashboard results={results} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
