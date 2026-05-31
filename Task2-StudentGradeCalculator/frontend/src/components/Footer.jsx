import { motion } from 'framer-motion';
import { GraduationCap, GitBranch, ExternalLink, Globe, Mail, Heart } from 'lucide-react';
import styles from './Footer.module.css';

const FOOTER_LINKS = {
  Platform: ['Calculator', 'Features', 'About', 'Contact'],
  Resources: ['Grade Scale Guide', 'GPA Calculator', 'Study Tips', 'FAQ'],
  Tech: ['React', 'Vite', 'Framer Motion', 'Spring Boot'],
};

export default function Footer() {
  const handleNav = (href) => {
    const el = document.querySelector(`#${href.toLowerCase()}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" className={styles.footer}>
      {/* Top divider glow */}
      <div className={styles.topGlow} />

      <div className="container">
        <div className={styles.main}>
          {/* Brand Column */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}><GraduationCap size={20} color="#ff6b35" /></div>
              <span className={styles.logoText}>Grade<span className={styles.logoAccent}>IQ</span></span>
            </div>
            <p className={styles.brandDesc}>
              A premium academic performance analytics platform built for students who demand more than just a grade.
            </p>
            {/* Social Links */}
            <div className={styles.socials}>
              <motion.a
                id="footer-github"
                href="https://github.com/Abhik-08"
                target="_blank"
                rel="noreferrer"
                className={styles.socialBtn}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.94 }}
                title="GitHub"
              >
                <GitBranch size={18} />
              </motion.a>
              <motion.a
                id="footer-linkedin"
                href="https://linkedin.com/in/"
                target="_blank"
                rel="noreferrer"
                className={styles.socialBtn}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.94 }}
                title="LinkedIn"
              >
                <ExternalLink size={18} />
              </motion.a>
              <motion.a
                id="footer-portfolio"
                href="#"
                className={styles.socialBtn}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.94 }}
                title="Portfolio"
              >
                <Globe size={18} />
              </motion.a>
              <motion.a
                id="footer-email"
                href="mailto:contact@gradeiq.dev"
                className={styles.socialBtn}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.94 }}
                title="Email"
              >
                <Mail size={18} />
              </motion.a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className={styles.col}>
              <h4 className={styles.colTitle}>{section}</h4>
              <ul className={styles.colLinks}>
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className={styles.colLink}
                      onClick={(e) => { e.preventDefault(); handleNav(link.split(' ')[0]); }}
                      whileHover={{ x: 4, color: 'var(--accent-primary)' }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2025 GradeIQ — Built with <Heart size={12} style={{ display: 'inline', color: '#ef4444', marginBottom: -2 }} /> for CODSOFT Internship
          </p>
          <div className={styles.bottomLinks}>
            <button type="button" className={styles.bottomLink}>Privacy Policy</button>
            <button type="button" className={styles.bottomLink}>Terms of Use</button>
            <button type="button" className={styles.bottomLink}>Open Source</button>
          </div>
        </div>

        {/* Developer credit */}
        <motion.div
          className={styles.devCard}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.devAvatar}>A</div>
          <div>
            <div className={styles.devName}>Abhik</div>
            <div className={styles.devRole}>Full Stack Developer · CODSOFT Intern · React + Spring Boot</div>
          </div>
          <div className={styles.devLinks}>
            <motion.a
              id="dev-github-btn"
              href="https://github.com/Abhik-08"
              target="_blank"
              rel="noreferrer"
              className={`btn-glow ${styles.devBtn}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GitBranch size={14} />
              GitHub
            </motion.a>
            <motion.a
              id="dev-linkedin-btn"
              href="https://linkedin.com/in/"
              target="_blank"
              rel="noreferrer"
              className={styles.devBtnOutline}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink size={14} />
              LinkedIn
            </motion.a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
