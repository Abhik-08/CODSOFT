import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Menu, X, Home, Calculator } from 'lucide-react';
import logo from '../assets/task_2_logo.png';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Features', href: '#features', icon: BarChart3 },
  { label: 'Calculator', href: '#calculator', icon: Calculator },
];

export default function Navbar({ activeSection, onLogoClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    if (onLogoClick) onLogoClick();
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.inner}>
        {/* Logo */}
        <motion.a
          href="#home"
          className={styles.logo}
          onClick={(e) => { e.preventDefault(); handleNavClick('#home'); }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <img src={logo} alt="GradeIQ logo" className={styles.logoImage} />
          <div className={styles.logoTextWrap}>
            <span className={styles.logoText}>Grade<span className={styles.logoAccent}>IQ</span></span>
          </div>
        </motion.a>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
              className={`${styles.navLink} ${activeSection === link.href.slice(1) ? styles.active : ''}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -2 }}
            >
              {link.label}
              {activeSection === link.href.slice(1) && (
                <motion.div
                  className={styles.activeDot}
                  layoutId="activeDot"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.a>
          ))}
        </nav>

        {/* CTA / Hamburger */}
        <div className={styles.navRight}>
          <motion.button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
            id="hamburger-btn"
          >
            <AnimatePresence mode="wait">
              {menuOpen
                ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={20} /></motion.span>
                : <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu size={20} /></motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_LINKS.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  className={`${styles.mobileLink} ${activeSection === link.href.slice(1) ? styles.mobileActive : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Icon size={16} />
                  {link.label}
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

Navbar.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onLogoClick: PropTypes.func,
};

Navbar.defaultProps = {
  onLogoClick: null,
};
