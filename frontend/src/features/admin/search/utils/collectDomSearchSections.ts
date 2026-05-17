export interface LiveSearchSection {
  id: string;
  title: string;
  sectionId: string;
  path: string;
}

/** Sections marked in the DOM on the current page (`data-admin-search-id`). */
export const collectDomSearchSections = (pathname: string): LiveSearchSection[] => {
  if (typeof document === 'undefined') return [];

  return Array.from(document.querySelectorAll<HTMLElement>('[data-admin-search-id]')).map((el) => {
    const sectionId = el.getAttribute('data-admin-search-id')!;
    const title =
      el.getAttribute('data-admin-search-title') ??
      el.querySelector('h1, h2, h3')?.textContent?.trim().slice(0, 120) ??
      sectionId.replace(/-/g, ' ');

    return {
      id: `live-${pathname}-${sectionId}`,
      title,
      sectionId,
      path: pathname,
    };
  });
};
