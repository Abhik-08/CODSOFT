import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, X, AlertCircle, Loader2, CheckCircle2, GraduationCap } from 'lucide-react';
import { apiService } from '../utils/apiService';
import styles from './AuthModal.module.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.92, 
    y: 15,
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login', messagePrompt = '' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setFormErrors({});
    setServerError('');
    setSuccessMsg('');
    setLoading(false);
  };

  // Sync mode with initialMode when modal toggles open
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(initialMode);
      clearForm();
    }
  }, [isOpen, initialMode]);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register' && !username.trim()) {
      errs.username = 'Username is required';
    } else if (mode === 'register' && username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const response = await apiService.login(email.trim(), password);
        setSuccessMsg(response.message || 'Login successful! Welcome back.');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        const response = await apiService.register(username.trim(), email.trim(), password);
        setSuccessMsg(response.message || 'Registration successful! Logged in.');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      }
    } catch (err) {
      setLoading(false);
      // Map API Error properties
      if (err.validationErrors) {
        setFormErrors(err.validationErrors);
      } else {
        setServerError(err.message || 'An unexpected authentication error occurred.');
      }
    }
  };

  // Prevent clicking through the modal body from closing it
  const handleModalClick = (e) => e.stopPropagation();

  const submitButtonText = mode === 'login' ? 'Sign In' : 'Create Account';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className={`glass-card ${styles.modal}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleModalClick}
          >
            {/* Close Button */}
            <motion.button
              className={styles.closeBtn}
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              title="Close Modal"
            >
              <X size={18} />
            </motion.button>

            {/* Header / Logo */}
            <div className={styles.header}>
              <div className={styles.logoIcon}>
                <GraduationCap size={28} color="#ff6b35" />
              </div>
              <h2 className={styles.logoText}>
                Grade<span className={styles.logoAccent}>IQ</span> Auth
              </h2>
              <p className={styles.subtext}>
                {mode === 'login' ? 'Sign in to access secure calculations' : 'Create an account to track academic progress'}
              </p>
            </div>

            {/* System/Prompt message (e.g. from calculation guard) */}
            {messagePrompt && !serverError && !successMsg && (
              <motion.div
                className={styles.promptBanner}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={14} />
                <span>{messagePrompt}</span>
              </motion.div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <motion.div
                className={styles.successBanner}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Server Error Banner */}
            {serverError && (
              <motion.div
                className={styles.errorBanner}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </motion.div>
            )}

            {/* Tab selection */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
                onClick={() => { setMode('login'); setServerError(''); setFormErrors({}); }}
              >
                Sign In
                {mode === 'login' && (
                  <motion.div className={styles.tabIndicator} layoutId="authTabIndicator" />
                )}
              </button>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
                onClick={() => { setMode('register'); setServerError(''); setFormErrors({}); }}
              >
                Register
                {mode === 'register' && (
                  <motion.div className={styles.tabIndicator} layoutId="authTabIndicator" />
                )}
              </button>
            </div>

            {/* Forms */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Username field (Register Only) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    className={styles.formGroup}
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className={styles.label}>
                      <User size={13} /> Username
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        className={`premium-input ${styles.input}`}
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setFormErrors(p => ({ ...p, username: '' })); }}
                        disabled={loading}
                      />
                    </div>
                    {formErrors.username && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.fieldError}>
                        <AlertCircle size={11} /> {formErrors.username}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Mail size={13} /> Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={`premium-input ${styles.input}`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormErrors(p => ({ ...p, email: '' })); }}
                    disabled={loading}
                  />
                </div>
                {formErrors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.fieldError}>
                    <AlertCircle size={11} /> {formErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Lock size={13} /> Password
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    className={`premium-input ${styles.input}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormErrors(p => ({ ...p, password: '' })); }}
                    disabled={loading}
                  />
                </div>
                {formErrors.password && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.fieldError}>
                    <AlertCircle size={11} /> {formErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                className={`btn-glow ${styles.submitBtn}`}
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'flex' }}
                    >
                      <Loader2 size={16} />
                    </motion.span>
                    Processing...
                  </>
                ) : (
                  submitButtonText
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialMode: PropTypes.oneOf(['login', 'register']),
  messagePrompt: PropTypes.string,
};

