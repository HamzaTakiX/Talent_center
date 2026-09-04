import type { ReportModelGuide, ReportModelSection } from '../types/reportModelGuide';

const MODEL_STORAGE_KEY = 'tc-report-model-guide-v1';

function section(
  partial: Omit<ReportModelSection, 'contentHtml'> & { contentHtml?: string },
): ReportModelSection {
  return {
    ...partial,
    contentHtml:
      partial.contentHtml ??
      `<p>Cette section du modèle décrit les attentes pédagogiques pour « ${partial.title} ». Structurez votre propre contenu autour de ces idées, sans reprendre le texte du modèle.</p>`,
  };
}

export const DEFAULT_REPORT_MAX_PAGES = 105;

export const defaultReportModelGuide: ReportModelGuide = {
  id: 'model-pfe-esca-2026',
  title: 'Modèle officiel PFE ESCA',
  supervisorName: 'Dr. Amine Benali',
  createdAt: '2026-01-10T08:00:00',
  updatedAt: '2026-05-20T10:00:00',
  notes: 'Utilisez ce modèle comme guide de structure et de rédaction. Ne copiez pas son contenu.',
  maxPages: DEFAULT_REPORT_MAX_PAGES,
  sections: [
    section({
      id: 'm-intro',
      parentId: null,
      title: '1. Introduction',
      order: 1,
      level: 1,
      matchAliases: ['Introduction', 'Contexte et problématique'],
      contentHtml: `<h2>1. Introduction</h2><p>Présentez le contexte du PFE, la problématique et les objectifs. Une introduction claire oriente le lecteur dès les premières pages.</p><ul><li>Contexte institutionnel et métier</li><li>Problématique motivée</li><li>Objectifs généraux et spécifiques</li></ul>`,
    }),
    section({
      id: 'm-intro-1',
      parentId: 'm-intro',
      title: '1.1 Contexte',
      order: 2,
      level: 2,
      matchAliases: ['Contexte'],
    }),
    section({
      id: 'm-intro-2',
      parentId: 'm-intro',
      title: '1.2 Problématique',
      order: 3,
      level: 2,
      matchAliases: ['Problématique'],
    }),
    section({
      id: 'm-intro-3',
      parentId: 'm-intro',
      title: '1.3 Objectifs',
      order: 4,
      level: 2,
      matchAliases: ['Objectifs'],
    }),
    section({
      id: 'm-analyse',
      parentId: null,
      title: '2. Analyse',
      order: 5,
      level: 1,
      matchAliases: ['Analyse', 'Revue de littérature', 'État de l\'art'],
      contentHtml: `<h2>2. Analyse</h2><p>Analysez l'existant, les besoins fonctionnels et non fonctionnels. Cette partie prépare la conception.</p>`,
    }),
    section({
      id: 'm-analyse-1',
      parentId: 'm-analyse',
      title: '2.1 Étude de l\'existant',
      order: 6,
      level: 2,
      matchAliases: ['Étude de l\'existant', 'État de l\'art'],
    }),
    section({
      id: 'm-analyse-2',
      parentId: 'm-analyse',
      title: '2.2 Besoins fonctionnels',
      order: 7,
      level: 2,
      matchAliases: ['Besoins fonctionnels'],
    }),
    section({
      id: 'm-analyse-3',
      parentId: 'm-analyse',
      title: '2.3 Besoins non fonctionnels',
      order: 8,
      level: 2,
      matchAliases: ['Besoins non fonctionnels'],
    }),
    section({
      id: 'm-conception',
      parentId: null,
      title: '3. Conception',
      order: 9,
      level: 1,
      matchAliases: ['Conception', 'Méthodologie'],
      contentHtml: `<h2>3. Conception</h2><p>Décrivez l'architecture, les diagrammes et le modèle de données. Montrez les choix techniques justifiés.</p>`,
    }),
    section({
      id: 'm-conception-1',
      parentId: 'm-conception',
      title: '3.1 Architecture',
      order: 10,
      level: 2,
      matchAliases: ['Architecture'],
    }),
    section({
      id: 'm-conception-2',
      parentId: 'm-conception',
      title: '3.2 Diagrammes',
      order: 11,
      level: 2,
      matchAliases: ['Diagrammes'],
    }),
    section({
      id: 'm-conception-3',
      parentId: 'm-conception',
      title: '3.3 Modèle de données',
      order: 12,
      level: 2,
      matchAliases: ['Modèle de données'],
    }),
    section({
      id: 'm-realisation',
      parentId: null,
      title: '4. Réalisation',
      order: 13,
      level: 1,
      matchAliases: ['Réalisation', 'Implémentation'],
      contentHtml: `<h2>4. Réalisation</h2><p>Présentez les technologies et l'implémentation. Illustrez les parties clés du système développé.</p>`,
    }),
    section({
      id: 'm-realisation-1',
      parentId: 'm-realisation',
      title: '4.1 Technologies',
      order: 14,
      level: 2,
      matchAliases: ['Technologies'],
    }),
    section({
      id: 'm-realisation-2',
      parentId: 'm-realisation',
      title: '4.2 Implémentation',
      order: 15,
      level: 2,
      matchAliases: ['Implémentation'],
    }),
    section({
      id: 'm-tests',
      parentId: null,
      title: '5. Tests et validation',
      order: 16,
      level: 1,
      matchAliases: ['Tests', 'Tests et validation', 'Résultats'],
      contentHtml: `<h2>5. Tests et validation</h2><p>Documentez la stratégie de tests, les scénarios et les résultats de validation.</p>`,
    }),
    section({
      id: 'm-conclusion',
      parentId: null,
      title: '6. Conclusion',
      order: 17,
      level: 1,
      matchAliases: ['Conclusion'],
      contentHtml: `<h2>6. Conclusion</h2><p>Synthétisez les apports, limites et perspectives. La conclusion doit répondre à la problématique initiale.</p>`,
    }),
  ],
};

export function loadAssignedReportModel(): ReportModelGuide | null {
  try {
    const raw = localStorage.getItem(MODEL_STORAGE_KEY);
    if (raw === 'null') return null;
    if (!raw) return defaultReportModelGuide;
    const parsed = JSON.parse(raw) as ReportModelGuide;
    const maxPages =
      typeof parsed.maxPages === 'number' && parsed.maxPages > 0
        ? parsed.maxPages === 40
          ? DEFAULT_REPORT_MAX_PAGES
          : parsed.maxPages
        : DEFAULT_REPORT_MAX_PAGES;
    return {
      ...parsed,
      maxPages,
    };
  } catch {
    return defaultReportModelGuide;
  }
}

export function saveAssignedReportModel(model: ReportModelGuide | null): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(model));
  } catch {
    /* ignore */
  }
}

export function getAssignedReportModelForStudent(_studentId?: string): ReportModelGuide | null {
  return loadAssignedReportModel();
}
