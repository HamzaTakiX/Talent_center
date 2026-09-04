/** Affiche un code service lisible (sans `_` / `-`). */
export function formatCatalogDisplayCode(code: string): string {
  return code
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Résout une clé i18n éventuellement courte (`catalog.attachments.x`) et évite d’afficher des `_`. */
export function resolveCatalogLabel(
  t: (key: string, options?: Record<string, unknown>) => string,
  labelKey: string,
  fallback?: string,
): string {
  const candidates = [
    labelKey,
    labelKey.startsWith('admin.') ? '' : `admin.documentsModule.${labelKey}`,
    labelKey.startsWith('catalog.') ? `admin.documentsModule.${labelKey}` : '',
  ].filter(Boolean);

  for (const key of candidates) {
    const value = t(key);
    if (value && value !== key) return value;
  }

  const raw = fallback ?? labelKey.split('.').pop() ?? labelKey;
  return formatCatalogDisplayCode(raw);
}
