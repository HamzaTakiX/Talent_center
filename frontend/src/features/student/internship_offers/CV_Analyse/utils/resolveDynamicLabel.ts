/** Display i18n key or raw dynamic text from CV Intelligence API. */
export function resolveDynamicLabel(
  t: (key: string, options?: Record<string, unknown>) => string,
  value: string,
  isDynamic?: boolean,
): string {
  if (!value) return '';
  if (isDynamic || !value.includes('.')) {
    return value;
  }
  const translated = t(value);
  return translated === value ? value : translated;
}

/** Strip legacy separators after "Entretien" in interview suggestion titles. */
export function formatInterviewSuggestionTitle(title: string): string {
  return title.replace(/^Entretien\s*[—–-]\s*/i, 'Entretien ').trim();
}
