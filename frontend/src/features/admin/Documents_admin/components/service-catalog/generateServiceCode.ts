const STOP_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'd', 'l', 'a', 'au', 'aux']);

/** Generate a backend-safe internal code from a human-readable document name. */
export function generateServiceCode(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (!normalized) return '';

  const code = normalized
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()))
    .join('_')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64);

  return code;
}
