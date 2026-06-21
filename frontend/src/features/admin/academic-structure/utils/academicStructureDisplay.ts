const EM_DASH = /[\u2014\u2013]/g;
const CODE_PREFIX = /^[A-Z0-9][A-Z0-9-]*\s*[—–]\s*/i;
const CODE_PAREN_PREFIX = /^[A-Z0-9][A-Z0-9-]*\s*\(([^)]+)\)\s*$/i;

const PROGRAM_FAMILY_LABELS: Record<string, string> = {
  PGE: 'Programme Grande École',
  LME: 'Licence en Management des Entreprises',
  IBA: 'International Business Administration',
  MASTER: 'Master',
};

/** Strip "PGE — …" prefixes and em-dashes for readable table labels. */
export function humanizeAcademicLabel(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';
  let text = raw.trim();
  const paren = text.match(CODE_PAREN_PREFIX);
  if (paren) return paren[1].trim();
  text = text.replace(CODE_PREFIX, '');
  text = text.replace(EM_DASH, ', ');
  text = text.replace(/\s+/g, ' ').replace(/,\s*,/g, ',');
  return text.trim();
}

export function humanizeProgramFamily(family: string | null | undefined): string {
  if (!family?.trim()) return '';
  const key = family.trim().toUpperCase();
  return PROGRAM_FAMILY_LABELS[key] ?? humanizeAcademicLabel(family);
}

export function formatAcademicCode(code: string | null | undefined): string {
  if (!code?.trim()) return '';
  return code.trim().toUpperCase();
}

export function displayCellValue(value: string | null | undefined, fallback = ''): string {
  const cleaned = humanizeAcademicLabel(value);
  return cleaned || fallback;
}

export interface BilingualEntityName {
  name?: string | null;
  name_fr?: string | null;
  name_en?: string | null;
}

/** Resolve display label from bilingual database fields (never returns empty if any name exists). */
export function localizedEntityName(entity: BilingualEntityName, lang: string): string {
  const fr = entity.name_fr?.trim() ?? '';
  const en = entity.name_en?.trim() ?? '';
  const fallback = entity.name?.trim() ?? '';
  const baseLang = lang.split('-')[0].toLowerCase();

  if (baseLang === 'fr') {
    return fr || en || fallback;
  }
  if (baseLang === 'en') {
    return en || fr || fallback;
  }
  return en || fr || fallback;
}
