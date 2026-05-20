export type QuickCvViewMode = 'split' | 'tab';

type Listener = () => void;

let mode: QuickCvViewMode = 'split';
let viewScale = 70;
const listeners = new Set<Listener>();

export const quickCvUiBridge = {
  get mode() {
    return mode;
  },
  set mode(value: QuickCvViewMode) {
    if (mode === value) return;
    mode = value;
    listeners.forEach((fn) => fn());
    window.dispatchEvent(new CustomEvent('quickcv:mode', { detail: value }));
  },
  get viewScale() {
    return viewScale;
  },
  set viewScale(value: number) {
    const next = Math.min(100, Math.max(1, Math.round(value)));
    if (viewScale === next) return;
    viewScale = next;
    listeners.forEach((fn) => fn());
    window.dispatchEvent(new CustomEvent('quickcv:viewScale', { detail: next }));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export const quickCvDemoFill = () => {
  window.dispatchEvent(new CustomEvent('quickcv:demo', { detail: { fill: true } }));
};

export const quickCvDemoClear = () => {
  window.dispatchEvent(new CustomEvent('quickcv:demo', { detail: { fill: false } }));
};

export const quickCvDownloadPdf = () => {
  window.dispatchEvent(new Event('quickcv:download'));
};
