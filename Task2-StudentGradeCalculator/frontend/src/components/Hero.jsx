import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Award, TrendingUp, Zap, Star, ArrowRight, Sparkles } from 'lucide-react';
import styles from './Hero.module.css';

/* ─── split text into animated chars ─── */
function SplitText({ text, className, delay = 0, stagger = 0.04, fromY = 80, blur = true }) {
  const chars = text.split('').map((ch, idx) => ({ ch, id: `${ch}-${idx}` }));
  return (
    <span className={className} style={{ display: 'inline-block' }}>
      {chars.map(({ ch, id }, i) => (
        <motion.span
          key={id}
          style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
          initial={{ opacity: 0, y: fromY, rotateX: -90, filter: blur ? 'blur(12px)' : 'none' }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
          transition={{
            delay: delay + i * stagger,
            duration: 0.65,
            type: 'spring',
            stiffness: 120,
            damping: 14,
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}

SplitText.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  stagger: PropTypes.number,
  fromY: PropTypes.number,
  blur: PropTypes.bool,
};

/* ─── typewriter hook ─── */
function useTypewriter(lines, speed = 45) {
  const [lineIdx, setLineIdx] = useState(0);
  const [text, setText] = useState('');

  const done = lineIdx >= lines.length;

  useEffect(() => {
    if (done) return;
    const target = lines[lineIdx];
    if (text.length < target.length) {
      const t = setTimeout(() => setText(target.slice(0, text.length + 1)), speed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setLineIdx(i => i + 1); setText(''); }, 600);
    return () => clearTimeout(t);
  }, [text, lineIdx, lines, speed, done]);

  return { text: done ? lines[lines.length - 1] : text, done };
}

/* ─── floating icons config ─── */
const ICONS = [
  { Icon: GraduationCap, x: '8%',  y: '18%', delay: 0.2,  size: 26, color: '#ff6b35' },
  { Icon: BookOpen,      x: '84%', y: '14%', delay: 0.5,  size: 22, color: '#7c3aed' },
  { Icon: Award,         x: '78%', y: '68%', delay: 0.8,  size: 24, color: '#3b82f6' },
  { Icon: TrendingUp,    x: '12%', y: '72%', delay: 1.1,  size: 20, color: '#22c55e' },
  { Icon: Zap,           x: '91%', y: '42%', delay: 1.4,  size: 18, color: '#f59e0b' },
  { Icon: Star,          x: '4%',  y: '48%', delay: 1.7,  size: 16, color: '#ec4899' },
  { Icon: Sparkles,      x: '50%', y: '6%',  delay: 0.9,  size: 18, color: '#ff6b35' },
];

const STATS = [
  { value: '100%', label: 'Accurate Results' },
  { value: '10+',  label: 'Grade Scales'     },
  { value: '∞',    label: 'Subjects'          },
];

/* ─── SUBTITLE_LINES for typewriter ─── */
const SUBTITLE_LINES = [
  'Analyze academic performance instantly.',
  'Dynamic subject management & GPA tracking.',
  'Premium analytics. Zero compromise.',
];

export default function Hero() {
  const containerRef  = useRef(null);
  const tiltRef       = useRef(null);

  /* parallax */
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const scrollY   = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const fadeOut   = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* mouse 3-D tilt */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]),  { stiffness: 200, damping: 30 });
  const rotY = useSpring(useTransform(mouseX, [-500, 500], [-8, 8]), { stiffness: 200, damping: 30 });

  const handleMouseMove = useCallback((e) => {
    const rect = tiltRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width  / 2);
    mouseY.set(e.clientY - rect.top  - rect.height / 2);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  /* magnetic CTA */
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const msx  = useSpring(magX, { stiffness: 300, damping: 20 });
  const msy  = useSpring(magY, { stiffness: 300, damping: 20 });

  const handleMagMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    magX.set((e.clientX - r.left - r.width  / 2) * 0.35);
    magY.set((e.clientY - r.top  - r.height / 2) * 0.35);
  };
  const handleMagLeave = () => { magX.set(0); magY.set(0); };

  /* typewriter */
  const { text: subText, done: subDone } = useTypewriter(SUBTITLE_LINES, 38);

  /* glitch toggle */
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const handleCTA = () => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div
      ref={containerRef}
      className={styles.hero}
    >
      <motion.div className={styles.parallaxBg} style={{ y: scrollY, opacity: fadeOut }}>

        {/* ── morphing blob ── */}
        <motion.div
          className={styles.blob1}
          animate={{ borderRadius: ['40% 60% 70% 30%/30% 30% 70% 70%', '60% 40% 30% 70%/70% 70% 30% 30%', '40% 60% 70% 30%/30% 30% 70% 70%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={styles.blob2}
          animate={{ borderRadius: ['60% 40% 30% 70%/70% 70% 30% 30%', '40% 60% 70% 30%/30% 30% 70% 70%', '60% 40% 30% 70%/70% 70% 30% 30%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* ── floating icons ── */}
        {ICONS.map(({ Icon, x, y, delay, size, color }, i) => (
          <motion.div
            key={`${x}-${y}`}
            className={styles.floatingIcon}
            style={{ left: x, top: y, borderColor: `${color}35`, background: `${color}12` }}
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay, type: 'spring', stiffness: 160, damping: 12 }}
          >
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
              transition={{ y: { delay: delay + 0.5, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }, rotate: { delay, duration: 5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Icon size={size} color={color} />
            </motion.div>
          </motion.div>
        ))}

        {/* ── scan line sweep ── */}
        <motion.div
          className={styles.scanLine}
          animate={{ top: ['-5%', '110%'] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
        />

        {/* ── 3D tilt card ── */}
        <motion.div
          ref={tiltRef}
          className={styles.content}
          style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
        >
          {/* badge */}
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <motion.span
              className={styles.badgePulse}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Academic Analytics Platform
            <motion.span
              className={styles.badgeShimmer}
              animate={{ x: ['-120%', '200%'] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
            />
          </motion.div>

          {/* ── HEADING ── */}
          <h1 className={styles.heading} style={{ perspective: '800px' }}>
            {/* STUDENT */}
            <span className={styles.headingLine}>
              <SplitText text="STUDENT" delay={0.25} stagger={0.055} fromY={100} />
            </span>

            {/* GRADE — gradient + glitch */}
            <span className={`${styles.headingLine} ${styles.accentLine}`}>
              <motion.span
                className={`${styles.gradientWord} ${glitch ? styles.glitch : ''}`}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                data-text="GRADE"
              >
                <SplitText text="GRADE" delay={0.52} stagger={0.07} fromY={120} blur />
              </motion.span>
            </span>

            {/* CALCULATOR */}
            <span className={styles.headingLine}>
              <SplitText text="CALCULATOR" delay={0.85} stagger={0.045} fromY={90} />
            </span>
          </h1>

          {/* animated underline under CALCULATOR */}
          <motion.div
            className={styles.headingUnderline}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* ── typewriter subtitle ── */}
          <motion.div
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <span>{subText}</span>
            <AnimatePresence>
              {!subDone && (
                <motion.span
                  className={styles.cursor}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
                  exit={{ opacity: 0 }}
                >|</motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div
            className={styles.ctaGroup}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, type: 'spring', stiffness: 120 }}
          >
            {/* magnetic primary CTA */}
            <motion.button
              id="hero-cta-btn"
              className={`btn-glow ${styles.primaryCta}`}
              style={{ x: msx, y: msy }}
              onMouseMove={handleMagMove}
              onMouseLeave={handleMagLeave}
              onClick={handleCTA}
              whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(255,107,53,0.6), 0 0 100px rgba(255,107,53,0.2)' }}
              whileTap={{ scale: 0.94 }}
            >
              <GraduationCap size={18} />
              Start Calculating
              <ArrowRight size={16} className={styles.ctaArrow} />
              {/* ripple shimmer */}
              <motion.span
                className={styles.ctaShimmer}
                animate={{ x: ['-120%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
              />
            </motion.button>

            <motion.button
              className={styles.secondaryCta}
              onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,107,53,0.4)', color: 'var(--text-primary)' }}
              whileTap={{ scale: 0.96 }}
            >
              Explore Features
            </motion.button>
          </motion.div>

          {/* ── Stats ── */}
          <motion.div
            className={styles.statsRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + i * 0.12, type: 'spring', stiffness: 200 }}
                whileHover={{ y: -4, scale: 1.06 }}
              >
                <motion.span
                  className={styles.statValue}
                  animate={{ textShadow: ['0 0 8px rgba(255,107,53,0)', '0 0 20px rgba(255,107,53,0.6)', '0 0 8px rgba(255,107,53,0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  {s.value}
                </motion.span>
                <span className={styles.statLabel}>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── scroll cue ── */}
        <motion.div
          className={styles.scrollCue}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <motion.div
            className={styles.scrollMouse}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className={styles.scrollWheel}
              animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          <span className={styles.scrollLabel}>scroll</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
