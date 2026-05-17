const HIGHLIGHT_CLASS = 'admin-search-target-highlight';
const HIGHLIGHT_DURATION_MS = 2200;

export const scrollToSearchTarget = (sectionId: string): void => {
  const run = () => {
    const el =
      document.querySelector(`[data-admin-search-id="${sectionId}"]`) ??
      document.getElementById(sectionId);

    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add(HIGHLIGHT_CLASS);

    window.setTimeout(() => {
      el.classList.remove(HIGHLIGHT_CLASS);
    }, HIGHLIGHT_DURATION_MS);
  };

  requestAnimationFrame(() => {
    window.setTimeout(run, 120);
  });
};
