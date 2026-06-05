import React, { useEffect, useState, useRef } from 'react';
import { animate, useMotionValue } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  isCurrency?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  isCurrency = false,
}) => {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(isCurrency ? '₹0.00' : '0');
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const formatter = (val: number) => {
      if (isCurrency) {
        return `₹${val.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
      return Math.round(val).toLocaleString('en-IN');
    };

    const controls = animate(count, valueRef.current, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(formatter(latest));
      },
    });
    return () => controls.stop();
  }, [value, duration, count, isCurrency]);

  return <span>{displayValue}</span>;
};
