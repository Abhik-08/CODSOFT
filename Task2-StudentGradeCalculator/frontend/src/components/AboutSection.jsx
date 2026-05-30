import { motion } from 'framer-motion';
import { GraduationCap, Target, Code2, Rocket } from 'lucide-react';
import styles from './AboutSection.module.css';

const HIGHLIGHTS = [
  { icon: Target, color: '#ff6b35', label: 'Purpose-Built', desc: 'Designed specifically for students who want actionable insights into their academic performance.' },
  { icon: Code2, color: '#7c3aed', label: 'Clean Architecture', desc: 'Modular React components built for easy Spring Boot API integration when backend is ready.' },
  { icon: Rocket, color: '#3b82f6', label: 'Production Ready', desc: 'Premium UI, responsive layout, and optimized performance — portfolio-grade quality from day one.' },
];

export default function AboutSection() {
  return (
    <div className={`section ${styles.about}`} id="about">
      <div className="container">
        <div className={styles.inner}>
          {/* Left */}
          <motion.div
            className={styles.left}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="badge badge-orange" style={{ marginBottom: 20 }}>
              <GraduationCap size={12} />
              About This Project
            </div>
            <h2 className={styles.title}>
              Transforming Academic
              <br />
              <span className="gradient-text">Performance Tracking</span>
            </h2>
            <p className={styles.desc}>
              GradeIQ is a premium student grade calculator built as part of the CODSOFT internship program.
              It combines modern React architecture with a stunning SaaS-quality interface to deliver an academic
              analytics platform that feels professional, not academic.
            </p>
            <p className={styles.desc}>
              The application dynamically generates subject input fields based on the student's input,
              validates marks in real time, and presents results through animated dashboards complete with
              progress rings, performance metrics, and subject-wise breakdowns.
            </p>
            <p className={styles.desc}>
              Built with React + Vite for blazing-fast performance, Framer Motion for premium animations,
              and architected to seamlessly integrate with a Spring Boot REST API for full-stack deployment.
            </p>

            {/* Tech Stack Chips */}
            <div className={styles.techStack}>
              {['React', 'Vite', 'Framer Motion', 'Lucide React', 'CSS Modules', 'Spring Boot (Soon)'].map((t) => (
                <span key={t} className={styles.techChip}>{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Right — Highlights */}
          <motion.div
            className={styles.right}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.label}
                  className={`sku-card ${styles.highlightCard}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ x: 6 }}
                >
                  <div className={styles.hIcon} style={{ background: `${h.color}15`, borderColor: `${h.color}30` }}>
                    <Icon size={18} color={h.color} />
                  </div>
                  <div>
                    <div className={styles.hLabel}>{h.label}</div>
                    <div className={styles.hDesc}>{h.desc}</div>
                  </div>
                </motion.div>
              );
            })}

            {/* Stats block */}
            <motion.div
              className={`glass-card ${styles.statsBlock}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              {[
                { val: '10+', label: 'Components Built' },
                { val: '100%', label: 'Frontend Complete' },
                { val: 'A+', label: 'Code Quality' },
              ].map((s) => (
                <div key={s.label} className={styles.statItem}>
                  <span className={styles.statVal}>{s.val}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
