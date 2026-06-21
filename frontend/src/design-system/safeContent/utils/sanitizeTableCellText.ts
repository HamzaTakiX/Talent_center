const HTML_TAG_RE = /<[^>]*>/g;
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F-\u009F]/g;
const MULTI_SPACE_RE = /\s+/g;

/** Nettoie une valeur importée ou saisie avant affichage en cellule de table. */
export function sanitizeTableCellText(value: string | null | undefined): string {
  if (value == null) return '';
  let text = String(value);
  text = text.replace(HTML_TAG_RE, '');
  text = text.replace(CONTROL_CHAR_RE, '');
  text = text.replace(MULTI_SPACE_RE, ' ').trim();
  return text;
}
