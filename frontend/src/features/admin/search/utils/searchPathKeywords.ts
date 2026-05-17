/** Turn `/admin/internship-offers/active` into searchable tokens. */
export const pathToSearchKeywords = (path?: string): string[] => {
  if (!path) return [];
  return path
    .split('/')
    .filter((segment) => segment && segment !== 'admin')
    .flatMap((segment) => {
      const spaced = segment.replace(/-/g, ' ');
      return [segment, spaced];
    });
};
