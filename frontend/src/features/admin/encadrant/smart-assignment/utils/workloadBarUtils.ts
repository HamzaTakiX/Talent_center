const LOAD_BAR_GREEN = '#22c55e';
const LOAD_BAR_ORANGE = '#f59e0b';
const LOAD_BAR_RED = '#ef4444';
const LOAD_BAR_BRAND = 'var(--admin-brand)';

export interface EncadrantLoadBarInput {
  loadPct: number;
  isOverloaded?: boolean;
  currentLoad?: number;
  maxCapacity?: number | null;
}

/** Progress bar color: green at full capacity, orange when nearing limit, red if overloaded. */
export function getEncadrantLoadBarColor({
  loadPct,
  isOverloaded = false,
  currentLoad,
  maxCapacity,
}: EncadrantLoadBarInput): string {
  if (isOverloaded) return LOAD_BAR_RED;

  const pct = Math.min(100, loadPct);
  const atFullCapacity =
    pct >= 100 ||
    (maxCapacity != null &&
      maxCapacity > 0 &&
      currentLoad != null &&
      currentLoad >= maxCapacity);

  if (atFullCapacity) return LOAD_BAR_GREEN;
  if (pct > 85) return LOAD_BAR_ORANGE;
  return LOAD_BAR_BRAND;
}

export const EncadrantLoadBarGradientFull = `linear-gradient(90deg, ${LOAD_BAR_GREEN}, #16a34a)`;
