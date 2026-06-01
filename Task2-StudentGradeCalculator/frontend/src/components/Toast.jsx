import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: 'rgba(20, 83, 45, 0.95)', border: '#4ade80', icon: '#86efac' },
  error:   { bg: 'rgba(127, 29, 29, 0.95)', border: '#f87171', icon: '#fca5a5' },
  warning: { bg: 'rgba(120, 53, 15, 0.95)', border: '#fb923c', icon: '#fdba74' },
  info:    { bg: 'rgba(30, 58, 138, 0.95)', border: '#60a5fa', icon: '#93c5fd' },
};

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className={styles.toastContainer} aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          const colors = COLORS[toast.type] || COLORS.info;
          return (
            <motion.div
              key={toast.id}
              className={styles.toast}
              style={{
                background: colors.bg,
                borderColor: colors.border,
              }}
              initial={{ opacity: 0, x: 60, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              layout
            >
              <Icon size={18} color={colors.icon} className={styles.toastIcon} />
              <span className={styles.toastMsg}>{toast.message}</span>
              <button
                className={styles.dismissBtn}
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
              {/* Auto-dismiss progress bar */}
              <motion.div
                className={styles.progressBar}
                style={{ background: colors.border }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

Toast.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      duration: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
