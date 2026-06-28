import { ui } from './index.svelte';

export const MOBILE_CV_BREAKPOINT = 768;

/** A4 width at 96dpi — used to fit preview on narrow screens. */
export const CV_DOC_WIDTH_PX = 794;

let isMobileViewport = $state(
  typeof window !== 'undefined'
    ? window.matchMedia(`(max-width: ${MOBILE_CV_BREAKPOINT}px)`).matches
    : false,
);
let mobileFitScale = $state(70);

export function getIsMobileViewport(): boolean {
  return isMobileViewport;
}

export function setMobileFitScale(scale: number): void {
  mobileFitScale = scale;
}

export function initViewportListeners(): () => void {
  if (typeof window === 'undefined') return () => {};

  const mq = window.matchMedia(`(max-width: ${MOBILE_CV_BREAKPOINT}px)`);
  const sync = () => {
    isMobileViewport = mq.matches;
  };
  sync();
  mq.addEventListener('change', sync);
  return () => mq.removeEventListener('change', sync);
}

export function computeMobileFitScale(containerWidth: number): number {
  const pad = 20;
  const available = Math.max(0, containerWidth - pad * 2);
  const ratio = available / CV_DOC_WIDTH_PX;
  return Math.min(100, Math.max(30, Math.round(ratio * 100)));
}

export function effectiveViewScale(): number {
  if (!isMobileViewport) return ui.viewScale;
  const fit = mobileFitScale;
  const user = ui.viewScale;
  return Math.min(100, Math.max(30, Math.round((fit * user) / 70)));
}
