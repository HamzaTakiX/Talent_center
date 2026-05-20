import { FunctionComponent, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedStatValueProps {
  value: number;
  className?: string;
  suffix?: string;
}

const AnimatedStatValue: FunctionComponent<AnimatedStatValueProps> = ({
  value,
  className = '',
  suffix = '',
}) => {
  const spring = useSpring(0, { stiffness: 90, damping: 22 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
  const [text, setText] = useState(`0${suffix}`);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v));
    return () => unsub();
  }, [display]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-live="polite"
    >
      {text}
    </motion.span>
  );
};

export default AnimatedStatValue;
