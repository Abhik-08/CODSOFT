import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function AnimatedCounter({ target, duration = 1.5, decimals = 0, suffix = '' }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const startVal = 0;
    const endVal = Number.parseFloat(target);

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = (now - start) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const current = startVal + (endVal - startVal) * easeOut(progress);
      setCount(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <span>
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

AnimatedCounter.propTypes = {
  target: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  duration: PropTypes.number,
  decimals: PropTypes.number,
  suffix: PropTypes.string,
};
