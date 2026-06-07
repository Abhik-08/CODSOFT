import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Award, TrendingUp, Zap, Star, ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';

/* ─── split text into animated chars ─── */
function SplitText({ text, className }) {
  return (
    <span className={className} style={{ display: 'inline-block' }}>
      {text}
    </span>
  );
}

SplitText.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
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
];

const STATS = [
  { value: '100%', label: 'Accurate Results' },
  { value: '10+',  label: 'Grade Scales'     },
  { value: '∞',    label: 'Subjects'          },
];

const HERO_LINES = ['STUDENT', 'GRADE', 'CALCULATOR'];

const heroTextContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.28, delayChildren: 0.16 } },
};

const heroLine = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const rotatingWord = {
  enter: {
    opacity: 0,
    y: 50,
    rotateX: -45,
    scale: 0.95,
    filter: 'blur(8px)',
  },
  center: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -50,
    rotateX: 45,
    scale: 0.95,
    filter: 'blur(8px)',
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const subtitleVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.85 } },
};

const statsContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 1.1 } },
};

const statItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

/* ─── SUBTITLE_LINES for typewriter ─── */
const SUBTITLE_LINES = [
  'Analyze academic performance instantly.',
  'Dynamic subject management & CGPA tracking.',
  'Premium analytics. Zero compromise.',
];

export default function Hero() {
  const containerRef  = useRef(null);
  const tiltRef       = useRef(null);

  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    try {
      const mq = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(!!mq && mq.matches);
      const handler = (e) => setPrefersReduced(e.matches);
      mq.addEventListener?.('change', handler);
      return () => mq.removeEventListener?.('change', handler);
    } catch (e) {
      console.warn('Failed to detect prefers-reduced-motion', e);
    }
  }, []);
  const [navigating, setNavigating] = useState(false);
  const reducedMotion = prefersReduced || navigating;
  const [activeHeroLine, setActiveHeroLine] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = setInterval(() => {
      setActiveHeroLine((idx) => (idx + 1) % HERO_LINES.length);
    }, 2400);
    return () => clearInterval(id);
  }, [reducedMotion]);

  /* parallax */
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const scrollY   = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const fadeOut   = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* mouse 3-D tilt */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]),  { stiffness: 120, damping: 20 });
  const rotY = useSpring(useTransform(mouseX, [-500, 500], [-8, 8]), { stiffness: 120, damping: 20 });

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
  const msx  = useSpring(magX, { stiffness: 200, damping: 18 });
  const msy  = useSpring(magY, { stiffness: 200, damping: 18 });

  const handleMagMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    magX.set((e.clientX - r.left - r.width  / 2) * 0.35);
    magY.set((e.clientY - r.top  - r.height / 2) * 0.35);
  };
  const handleMagLeave = () => { magX.set(0); magY.set(0); };

  /* typewriter */
  const { text: subText, done: subDone } = useTypewriter(SUBTITLE_LINES, 38);


  const handleCTA = () => {
    const el = document.querySelector('#calculator');
    setNavigating(true);
    if (el) {
      el.classList.add('calc-enter');
      requestAnimationFrame(() => el.classList.remove('calc-enter'));
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => setNavigating(false), 900);
  };

  return (
    <div
      ref={containerRef}
      className={styles.hero}
    >
      <motion.div className={styles.parallaxBg} style={{ y: scrollY, opacity: fadeOut }}>

        {/* ── morphing blob ── */}
        <motion.div
          className={styles.blob1}
          animate={reducedMotion ? undefined : { borderRadius: ['40% 60% 70% 30%/30% 30% 70% 70%', '60% 40% 30% 70%/70% 70% 30% 30%', '40% 60% 70% 30%/30% 30% 70% 70%'] }}
          transition={reducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={styles.blob2}
          animate={reducedMotion ? undefined : { borderRadius: ['60% 40% 30% 70%/70% 70% 30% 30%', '40% 60% 70% 30%/30% 30% 70% 70%', '60% 40% 30% 70%/70% 70% 30% 30%'] }}
          transition={reducedMotion ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* ── floating icons ── */}
        {ICONS.map(({ Icon, x, y, delay, size, color }, i) => (
          <motion.div
            key={`${x}-${y}`}
            className={styles.floatingIcon}
            style={{ left: x, top: y, borderColor: `${color}35`, background: `${color}12` }}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0, rotate: -30 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
            transition={reducedMotion ? { delay: 0.1 } : { delay, type: 'spring', stiffness: 160, damping: 12 }}
          >
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
              transition={reducedMotion ? {} : { y: { delay: delay + 0.5, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }, rotate: { delay, duration: 5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Icon size={size} color={color} />
            </motion.div>
          </motion.div>
        ))}

        {/* ── scan line sweep ── */}
        <motion.div
          className={styles.scanLine}
          animate={reducedMotion ? undefined : { top: ['-5%', '110%'] }}
          transition={reducedMotion ? undefined : { duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
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
          <motion.div className={styles.heading} variants={heroTextContainer} initial="hidden" animate="show">
            <motion.div className={styles.headingKicker} variants={heroLine}>
              Student Grade Calculator
            </motion.div>
            <div className={styles.headingStage}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={reducedMotion ? 'static-heading' : HERO_LINES[activeHeroLine]}
                className={`${styles.headingLine} ${styles.rotatingWord}`}
                  data-text={HERO_LINES[activeHeroLine]}
                  variants={reducedMotion ? undefined : rotatingWord}
                  initial={reducedMotion ? false : 'enter'}
                  animate={reducedMotion ? {} : 'center'}
                  exit={reducedMotion ? undefined : 'exit'}
                >
                  <SplitText
                    text={HERO_LINES[activeHeroLine]}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <motion.div className={styles.wordTrack} variants={heroLine}>
              {HERO_LINES.map((line, index) => (
                <button
                  key={line}
                  type="button"
                  className={`${styles.wordChip} ${activeHeroLine === index ? styles.wordChipActive : ''}`}
                  onClick={() => setActiveHeroLine(index)}
                  aria-label={`Show ${line}`}
                >
                  {line}
                </button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className={styles.subtitle} variants={subtitleVariant} initial="hidden" animate="show">
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
            transition={{ delay: 1.4, type: 'spring', stiffness: 120 }}
          >
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
