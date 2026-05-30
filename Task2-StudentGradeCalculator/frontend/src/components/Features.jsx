import { motion } from 'framer-motion';
import { Zap, BarChart2, Layers, LayoutDashboard, Smartphone, GitBranch } from 'lucide-react';
import styles from './Features.module.css';

const FEATURES = [
  {
    id: 'feat-instant',
    icon: Zap,
    color: '#f59e0b',
    title: 'Instant Calculation',
    desc: 'Get real-time grade computation with animated results as soon as you enter your marks. No delays, no reloads.',
  },
  {
    id: 'feat-analytics',
    icon: BarChart2,
    color: '#3b82f6',
    title: 'Performance Analytics',
    desc: 'Deep dive into your academic data with highest, lowest, average, pass percentage, and subject-wise breakdown.',
  },
  {
    id: 'feat-dynamic',
    icon: Layers,
    color: '#a855f7',
    title: 'Dynamic Subject Management',
    desc: 'Add or remove any number of subjects on the fly. No fixed limit — handle 1 to 20 subjects effortlessly.',
  },
  {
    id: 'feat-dashboard',
    icon: LayoutDashboard,
    color: '#ff6b35',
    title: 'Modern Dashboard',
    desc: 'A premium SaaS-quality interface with glassmorphism panels, animated cards, and industrial design aesthetics.',
  },
  {
    id: 'feat-responsive',
    icon: Smartphone,
    color: '#22c55e',
    title: 'Responsive Design',
    desc: 'Pixel-perfect on every device — desktop, tablet, and mobile. Optimized touch interactions and layouts.',
  },
  {
    id: 'feat-visual',
    icon: GitBranch,
    color: '#ec4899',
    title: 'Interactive Visualization',
    desc: 'Animated progress rings, bar charts, counters, and color-coded performance indicators for instant clarity.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 22 } },
};

export default function Features() {
  return (
    <div className={`section ${styles.features}`}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="badge badge-orange">Platform Features</div>
          <h2 className={styles.title}>
            Everything You Need to
            <br />
            <span className="gradient-text">Ace Your Grades</span>
          </h2>
          <p className={styles.subtitle}>
            Built with premium tooling to give students a professional-grade academic analytics experience.
          </p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                id={feat.id}
                className={`glass-card ${styles.featCard}`}
                variants={card}
                whileHover={{
                  y: -8,
                  borderColor: `${feat.color}30`,
                  boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 30px ${feat.color}15`,
                }}
                style={{ '--feat-color': feat.color }}
              >
                <motion.div
                  className={styles.iconWrap}
                  style={{ background: `${feat.color}15`, borderColor: `${feat.color}30` }}
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon size={22} color={feat.color} />
                </motion.div>

                <h3 className={styles.featTitle}>{feat.title}</h3>
                <p className={styles.featDesc}>{feat.desc}</p>

                {/* Accent line */}
                <motion.div
                  className={styles.accentLine}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ background: feat.color }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
