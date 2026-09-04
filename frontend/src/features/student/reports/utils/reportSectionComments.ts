import type { ReportComment } from '../types';

const SECTION_ALIASES: Record<string, string[]> = {
  intro: [
    'introduction',
    'contexte',
    'problematique',
    'contexte et problematique',
    'contexte organisme d accueil et problematique',
  ],
  'lit-review': ['revue de litterature', 'litterature', 'etat de l art', 'etude de l existant'],
  methodology: ['methodologie', 'approche methodologique', 'analyse des besoins', 'specifications'],
  implementation: ['realisation', 'implementation', 'conception'],
  results: ['resultats', 'tests', 'validation'],
  discussion: ['discussion'],
  conclusion: ['conclusion'],
  references: ['references', 'webographie', 'bibliographie'],
  appendices: ['annexes', 'annexe'],
};

export function normalizeSectionKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\d+([.\-)]\d+)*[.\-)]?\s*/g, '')
    .replace(/^(?:[ivxlc]+)(?:\.\d+)*\s*/i, '')
    .replace(/^chapitre\s+[ivxlc\d]+\s*[:.\-–—]?\s*/i, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sectionIdLabel(sectionId: string): string {
  const map: Record<string, string> = {
    intro: 'Introduction',
    'lit-review': 'Revue de littérature',
    methodology: 'Méthodologie',
    implementation: 'Implémentation',
    results: 'Résultats',
    discussion: 'Discussion',
    conclusion: 'Conclusion',
    references: 'Références',
    appendices: 'Annexes',
  };
  return map[sectionId] ?? sectionId;
}

export function headingMatchesSection(heading: string, sectionId: string): boolean {
  const key = normalizeSectionKey(heading);
  if (!key) return false;
  const label = normalizeSectionKey(sectionIdLabel(sectionId));
  if (label && (key === label || key.includes(label) || label.includes(key))) return true;
  const aliases = SECTION_ALIASES[sectionId] ?? [];
  return aliases.some(
    (alias) => key === alias || key.includes(alias) || alias.includes(key),
  );
}

/** Open supervisor comments relevant to the heading currently under the cursor. */
export function findActiveSectionComments(
  headingTitle: string | null | undefined,
  comments: ReportComment[],
): ReportComment[] {
  if (!headingTitle?.trim()) return [];
  return comments.filter(
    (c) =>
      c.role === 'supervisor' &&
      !c.resolved &&
      headingMatchesSection(headingTitle, c.sectionId),
  );
}
