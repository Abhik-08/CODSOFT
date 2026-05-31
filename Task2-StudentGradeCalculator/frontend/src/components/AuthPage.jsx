import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { apiService } from '../utils/apiService';
import logo from '../assets/task_2_logo.png';
import styles from './AuthPage.module.css';

const formVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 100 : -100,
    scale: 0.98
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 28 }
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction < 0 ? 100 : -100,
    scale: 0.98,
    transition: { duration: 0.2, ease: 'easeIn' }
  })
};


export default function AuthPage({ currentMode, onNavigate, onSuccess, initialAlert = '', canGoBack = true }) {
  const [direction, setDirection] = useState(1); // 1 for register -> login, -1 for login -> register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleModeSwitch = (newMode) => {
    setDirection(newMode === 'login' ? 1 : -1);
    setUsername('');
    setEmail('');
    setPassword('');
    setFormErrors({});
    setServerError('');
    setSuccessMsg('');
    setLoading(false);
    onNavigate(newMode);
  };

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (currentMode === 'register' && !username.trim()) {
      errs.username = 'Username is required';
    } else if (currentMode === 'register' && username.trim().length < 3) {
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
      if (currentMode === 'login') {
        const response = await apiService.login(email.trim(), password);
        setSuccessMsg(response.message || 'Login successful! Welcome back.');
        setTimeout(() => {
          onSuccess?.();
        }, 800);
      } else {
        const response = await apiService.register(username.trim(), email.trim(), password);
        setSuccessMsg(response.message || 'Registration successful! Redirecting to login...');
        setTimeout(() => {
          handleModeSwitch('login');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      if (err.validationErrors) {
        setFormErrors(err.validationErrors);
      } else {
        setServerError(err.message || 'An unexpected authentication error occurred.');
      }
    }
  };

  const submitButtonText = currentMode === 'login' ? 'Sign In' : 'Create Account';

  return (
    <div className={styles.authContainer}>
      <motion.div
        className={`glass-card ${styles.authCard} ${loading ? styles.isLoading : ''}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        {/* Top sweeping progress bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className={styles.progressBar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Subtle blur overlay during loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className={styles.loadingOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
        {/* Back Button */}
        {canGoBack && (
          <motion.button
            type="button"
            className={styles.backBtn}
            onClick={() => onNavigate('main')}
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={14} /> Back to Home
          </motion.button>
        )}

        {/* Logo Section */}
        <div className={styles.logoHeader}>
          <div className={styles.logoIcon}>
            <img src={logo} alt="GradeIQ logo" />
          </div>
          <h1 className={styles.logoText}>
            Grade<span className={styles.logoAccent}>IQ</span>
          </h1>
          <p className={styles.subText}>Premium Student Grade Calculation Suite</p>
        </div>


        {/* Banners */}
        {initialAlert && !serverError && !successMsg && (
          <motion.div className={styles.promptBanner} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertCircle size={15} />
            <span>{initialAlert}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div className={styles.successBanner} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {serverError && (
          <motion.div className={styles.errorBanner} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </motion.div>
        )}

        {/* Sliding Forms */}
        <div className={styles.formContainer}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentMode}
              custom={direction}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={styles.formSlide}
            >
              <h2 className={styles.formTitle}>
                {currentMode === 'login' ? 'Sign In' : 'Register Account'}
              </h2>
              <p className={styles.formSub}>
                {currentMode === 'login'
                  ? 'Access secure grade calculations and performance metrics.'
                  : 'Get started to calculate subject analytics and GPA distributions.'}
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Username (Register Only) */}
                {currentMode === 'register' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <User size={13} /> Username
                    </label>
                    <input
                      type="text"
                      className={`premium-input ${styles.input}`}
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setFormErrors(p => ({ ...p, username: '' })); }}
                      disabled={loading}
                    />
                    {formErrors.username && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.fieldError}>
                        <AlertCircle size={11} /> {formErrors.username}
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Mail size={13} /> Email Address
                  </label>
                  <input
                    type="text"
                    className={`premium-input ${styles.input}`}
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormErrors(p => ({ ...p, email: '' })); }}
                    disabled={loading}
                  />
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
                  <input
                    type="password"
                    className={`premium-input ${styles.input}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormErrors(p => ({ ...p, password: '' })); }}
                    disabled={loading}
                  />
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
                      {currentMode === 'login' ? 'Signing in' : 'Creating account'}
                      <span className={styles.dots}>
                        <span /><span /><span />
                      </span>
                    </>
                  ) : (
                    submitButtonText
                  )}
                </motion.button>
              </form>

              {/* Toggle links */}
              <div className={styles.toggleFooter}>
                {currentMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button type="button" className={styles.toggleLink} onClick={() => handleModeSwitch('register')}>
                      Register here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button type="button" className={styles.toggleLink} onClick={() => handleModeSwitch('login')}>
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

AuthPage.propTypes = {
  currentMode: PropTypes.oneOf(['login', 'register']).isRequired,
  onNavigate: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  initialAlert: PropTypes.string,
  canGoBack: PropTypes.bool,
};

AuthPage.defaultProps = {
  initialAlert: '',
  canGoBack: true,
};
