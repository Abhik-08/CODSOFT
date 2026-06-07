import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, BookOpen, AlertCircle } from 'lucide-react';
import styles from './SubjectInput.module.css';

/** Resolve bar colour from a marks value (0-100). */
function resolveMarksColor(marksNum) {
  if (marksNum >= 90) return '#22c55e';
  if (marksNum >= 75) return '#4ade80';
  if (marksNum >= 60) return '#3b82f6';
  if (marksNum >= 50) return '#eab308';
  return '#ef4444';
}

export default function SubjectInput({ subject, index, onChange, onRemove, canRemove, error }) {
  const marksNum   = Number(subject.marks);
  const marksValid = subject.marks !== '' && marksNum >= 0 && marksNum <= 100;
  const marksColor = marksValid ? resolveMarksColor(marksNum) : null;

  const nameInputId  = `subject-name-${subject.id}`;
  const marksInputId = `subject-marks-${subject.id}`;
  const incompleteInputId = `subject-incomplete-${subject.id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`${styles.subjectRow} ${error ? styles.hasError : ''}`}
    >
      <div className={styles.indexBadge}>
        <span>{index + 1}</span>
      </div>

      <div className={styles.fields}>
        {/* Subject Name */}
        <div className={styles.field}>
          <label htmlFor={nameInputId} className={styles.label}>
            <BookOpen size={12} />
            Subject Name
          </label>
          <input
            id={nameInputId}
            type="text"
            className={`premium-input ${styles.input}`}
            placeholder="e.g. Mathematics"
            value={subject.name}
            onChange={(e) => onChange(subject.id, 'name', e.target.value)}
            maxLength={40}
          />
          {error?.name && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.errorMsg}
            >
              <AlertCircle size={11} /> {error.name}
            </motion.span>
          )}
        </div>

        {/* Marks */}
        <div className={styles.field}>
          <label htmlFor={marksInputId} className={styles.label}>
            <span>Marks</span>
            <span className={styles.marksHint}>/ 100</span>
          </label>
          <div className={styles.marksWrapper}>
            <input
              id={marksInputId}
              type="number"
              className={`premium-input ${styles.input} ${styles.marksInput}`}
              placeholder={subject.incomplete ? "---" : "0 – 100"}
              value={subject.marks}
              onChange={(e) => onChange(subject.id, 'marks', e.target.value)}
              disabled={subject.incomplete}
              min={0}
              max={100}
            />
            {subject.marks !== '' && !subject.incomplete && (
              <motion.div
                className={styles.marksBar}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.min(marksNum / 100, 1) }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ background: marksColor || 'var(--accent-primary)' }}
              />
            )}
          </div>
          {error?.marks && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.errorMsg}
            >
              <AlertCircle size={11} /> {error.marks}
            </motion.span>
          )}
        </div>

        {/* Incomplete Switch */}
        <div className={styles.field} style={{ minWidth: '90px' }}>
          <label htmlFor={incompleteInputId} className={styles.label}>
            Incomplete
          </label>
          <div className={styles.checkboxWrapper}>
            <input
              id={incompleteInputId}
              type="checkbox"
              className={styles.checkbox}
              checked={subject.incomplete || false}
              onChange={(e) => onChange(subject.id, 'incomplete', e.target.checked)}
              title="Mark this subject exam as incomplete"
            />
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <AnimatePresence>
        {canRemove && (
          <motion.button
            id={`remove-subject-${subject.id}`}
            className={styles.removeBtn}
            onClick={() => onRemove(subject.id)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.2)' }}
            whileTap={{ scale: 0.9 }}
            title="Remove subject"
          >
            <Trash2 size={15} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

SubjectInput.propTypes = {
  subject: PropTypes.shape({
    id:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name:  PropTypes.string.isRequired,
    marks: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    incomplete: PropTypes.bool,
  }).isRequired,
  index:     PropTypes.number.isRequired,
  onChange:  PropTypes.func.isRequired,
  onRemove:  PropTypes.func.isRequired,
  canRemove: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    name:  PropTypes.string,
    marks: PropTypes.string,
  }),
};

SubjectInput.defaultProps = {
  error: null,
};
