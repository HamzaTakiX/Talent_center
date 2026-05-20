/** Short program label for admin tables (PGE, MRH, ACG-SICG, …). */

function isShortProgramCode(value: string): boolean {
  const v = value.trim();
  if (!v || v.length > 20) return false;
  if (v.includes('(') || (v.includes(' ') && v.length > 12)) return false;
  return /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(v);
}

function abbreviateProgramName(name: string): string {
  const text = name.trim();
  if (!text) return '';
  if (isShortProgramCode(text)) return text.toUpperCase();

  const paren = text.match(/\(([^)]+)\)\s*$/);
  if (paren) {
    const inner = paren[1].trim();
    if (isShortProgramCode(inner)) return inner.toUpperCase();
  }

  const leading = text.match(/^([A-Z]{2,}(?:-[A-Z0-9]+)*)\s*[\(-]/);
  if (leading) return leading[1].toUpperCase();

  return text.length <= 16 ? text : `${text.slice(0, 16)}…`;
}

/** Table cell: prefer API short code, else derive from full program name. */
export function programTableLabel(
  filiereCode?: string | null,
  programMajor?: string | null,
): string {
  const code = (filiereCode || '').trim();
  if (code && isShortProgramCode(code)) return code.toUpperCase();

  const name = (programMajor || code || '').trim();
  if (!name) return '—';
  return abbreviateProgramName(name);
}

export function scopeProgramsPreview(
  codes: string[] | undefined,
  labels: string[] | undefined,
  globalLabel: string,
  max = 3,
): string {
  const raw = (codes?.length ? codes : labels) ?? [];
  if (!raw.length) return globalLabel;

  const items = raw.map((item) => abbreviateProgramName(item));
  const shown = items.slice(0, max);
  const suffix = raw.length > max ? '…' : '';
  return `${shown.join(', ')}${suffix}`;
}
