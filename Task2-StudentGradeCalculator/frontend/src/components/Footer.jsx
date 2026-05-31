import { Heart } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Top divider glow */}
      <div className={styles.topGlow} />

      <div className="container">
        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2026 GradeIQ — Built with <Heart size={12} style={{ display: 'inline', color: '#ef4444', marginBottom: -2 }} /> for CODSOFT Internship
          </p>
          <div className={styles.bottomLinks}>
            <button type="button" className={styles.bottomLink}>Privacy Policy</button>
            <button type="button" className={styles.bottomLink}>Terms of Use</button>
            <button type="button" className={styles.bottomLink}>Open Source</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
