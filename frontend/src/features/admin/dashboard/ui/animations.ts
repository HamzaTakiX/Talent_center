/** Shared Framer Motion presets for admin dashboard */
export const easePremium = [0.16, 1, 0.3, 1] as const;

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easePremium },
  },
};

export const scaleTap = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
};

export const sidebarTransition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
} as const;
