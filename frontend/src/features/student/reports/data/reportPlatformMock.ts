import type {
  ReportAcademicProgress,
  ReportComment,
  ReportReference,
  ReportSection,
  ReportVersion,
  StudentReportDocument,
  StudentReportSummary,
} from '../types';

const DEFAULT_SECTIONS: Omit<ReportSection, 'content'>[] = [
  { id: 'intro', title: 'Introduction', wordCount: 145, completionPercent: 85, status: 'complete' },
  { id: 'lit-review', title: 'Revue de littérature', wordCount: 580, completionPercent: 62, status: 'draft' },
  { id: 'methodology', title: 'Méthodologie', wordCount: 215, completionPercent: 45, status: 'draft' },
  { id: 'implementation', title: 'Implémentation', wordCount: 0, completionPercent: 0, status: 'empty' },
  { id: 'results', title: 'Résultats', wordCount: 0, completionPercent: 0, status: 'empty' },
  { id: 'discussion', title: 'Discussion', wordCount: 0, completionPercent: 0, status: 'empty' },
  { id: 'conclusion', title: 'Conclusion', wordCount: 0, completionPercent: 0, status: 'empty' },
  { id: 'references', title: 'Références', wordCount: 42, completionPercent: 30, status: 'draft' },
  { id: 'appendices', title: 'Annexes', wordCount: 0, completionPercent: 0, status: 'empty' },
];

const SECTION_CONTENT: Record<string, string> = {
  intro: `<h2>Contexte et problématique</h2><p>Ce mémoire s'inscrit dans le cadre du Projet de Fin d'Études (PFE) au sein de la filière Informatique. L'objectif principal est de concevoir et développer une plateforme moderne de gestion des talents académiques.</p><p>La problématique centrale concerne l'optimisation du suivi des stages et de la rédaction des rapports académiques dans un environnement universitaire numérique.</p>`,
  'lit-review': `<h2>État de l'art</h2><p>Les systèmes de gestion académique (LMS) ont connu une évolution significative ces dernières années. Des plateformes comme Moodle, Canvas et Blackboard dominent le marché éducatif.</p><ul><li>Approches collaboratives de rédaction</li><li>Outils de suivi de stage</li><li>Intégration IA pour l'assistance à la rédaction</li></ul>`,
  methodology: `<h2>Approche méthodologique</h2><p>Nous adoptons une méthodologie agile combinant des sprints de deux semaines avec des revues régulières auprès de l'encadrant académique.</p>`,
  references: `<p>Les références bibliographiques seront générées automatiquement via le gestionnaire intégré.</p>`,
};

export const REPORT_STORAGE_PREFIX = 'tc-student-report-';

export const academicProgress: ReportAcademicProgress = {
  reportCompletion: 42,
  researchCompletion: 68,
  supervisorReviews: 3,
  documentCompletion: 55,
};

export const hubReports: StudentReportSummary[] = [
  {
    id: 'rpt-main-2026',
    title: 'Mémoire PFE — Talent Center Platform',
    lastModified: '2026-05-30T14:22:00',
    progress: 42,
    supervisor: 'Dr. Amine Benali',
    status: 'draft',
    wordCount: 982,
    category: 'my',
  },
  {
    id: 'rpt-draft-notes',
    title: 'Notes préliminaires — Chapitre 2',
    lastModified: '2026-05-28T09:15:00',
    progress: 18,
    supervisor: 'Dr. Amine Benali',
    status: 'draft',
    wordCount: 340,
    category: 'drafts',
  },
  {
    id: 'rpt-interim-may',
    title: 'Rapport intermédiaire — Mai 2026',
    lastModified: '2026-05-15T16:40:00',
    progress: 100,
    supervisor: 'Dr. Amine Benali',
    status: 'under_review',
    wordCount: 4200,
    category: 'submitted',
  },
  {
    id: 'rpt-template-pfe',
    title: 'Modèle officiel PFE ESCA',
    lastModified: '2026-01-10T08:00:00',
    progress: 0,
    supervisor: '—',
    status: 'draft',
    wordCount: 0,
    category: 'templates',
    isTemplate: true,
  },
  {
    id: 'rpt-template-ieee',
    title: 'Modèle IEEE — Article technique',
    lastModified: '2026-01-10T08:00:00',
    progress: 0,
    supervisor: '—',
    status: 'draft',
    wordCount: 0,
    category: 'templates',
    isTemplate: true,
  },
  {
    id: 'rpt-2025-archive',
    title: 'Rapport de stage — Été 2025',
    lastModified: '2025-09-20T11:30:00',
    progress: 100,
    supervisor: 'Prof. Leila Mansouri',
    status: 'approved',
    wordCount: 8500,
    category: 'archived',
  },
];

const defaultComments: ReportComment[] = [
  {
    id: 'c1',
    author: 'Dr. Amine Benali',
    role: 'supervisor',
    text: 'La problématique est bien formulée, mais il manque une citation récente sur les LMS modernes.',
    sectionId: 'intro',
    createdAt: '2026-05-29T10:00:00',
    resolved: false,
    fixed: false,
    replies: [],
  },
  {
    id: 'c2',
    author: 'Dr. Amine Benali',
    role: 'supervisor',
    text: 'Développez la section sur les approches collaboratives avec au moins 3 références académiques.',
    sectionId: 'lit-review',
    createdAt: '2026-05-27T15:30:00',
    resolved: false,
    fixed: true,
    replies: [
      {
        id: 'r1',
        author: 'Vous',
        text: 'J\'ai ajouté les références demandées dans la revue de littérature.',
        createdAt: '2026-05-28T09:00:00',
      },
    ],
  },
];

const defaultReferences: ReportReference[] = [
  {
    id: 'ref1',
    style: 'apa',
    authors: 'Smith, J., & Johnson, M.',
    title: 'Collaborative Writing in Academic Settings',
    year: '2024',
    source: 'Journal of Educational Technology, 45(2), 112-128',
  },
  {
    id: 'ref2',
    style: 'ieee',
    authors: 'Chen, L. et al.',
    title: 'AI-Assisted Academic Report Management',
    year: '2025',
    source: 'IEEE Transactions on Learning Technologies, 18(1), 45-58',
  },
];

function buildSections(): ReportSection[] {
  return DEFAULT_SECTIONS.map((s) => ({
    ...s,
    content: SECTION_CONTENT[s.id] ?? '',
  }));
}

function mergeSectionsContent(sections: ReportSection[]): string {
  return sections
    .filter((s) => s.content.trim())
    .map((s) => s.content)
    .join('');
}

function countWordsInHtml(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

export function ensureReportContent(doc: StudentReportDocument): StudentReportDocument {
  if (doc.content?.trim()) return doc;
  return { ...doc, content: mergeSectionsContent(doc.sections) };
}

export function createDefaultReport(id: string): StudentReportDocument {
  const sections = buildSections();
  const content = mergeSectionsContent(sections);
  const wordCount = countWordsInHtml(content);
  const snapshot = { body: content, ...Object.fromEntries(sections.map((s) => [s.id, s.content])) };

  return {
    id,
    title: 'Mémoire PFE — Talent Center Platform',
    status: 'draft',
    supervisor: 'Dr. Amine Benali',
    targetWords: 8000,
    content,
    sections,
    comments: defaultComments,
    references: defaultReferences,
    versions: [
      {
        id: 'v3',
        label: 'Version 3 — Retours encadrant',
        createdAt: '2026-05-30T14:22:00',
        wordCount,
        snapshot,
        isCurrent: true,
      },
      {
        id: 'v2',
        label: 'Version 2 — Revue littérature',
        createdAt: '2026-05-25T11:00:00',
        wordCount: 720,
        snapshot: { ...snapshot, 'lit-review': SECTION_CONTENT['lit-review'] ?? '' },
      },
      {
        id: 'v1',
        label: 'Version 1 — Première ébauche',
        createdAt: '2026-05-20T09:30:00',
        wordCount: 145,
        snapshot: { intro: SECTION_CONTENT.intro ?? '' },
      },
    ],
    analytics: academicProgress,
    lastModified: new Date().toISOString(),
  };
}

export function loadReportFromStorage(reportId: string): StudentReportDocument | null {
  try {
    const raw = localStorage.getItem(`${REPORT_STORAGE_PREFIX}${reportId}`);
    if (!raw) return null;
    return ensureReportContent(JSON.parse(raw) as StudentReportDocument);
  } catch {
    return null;
  }
}

export function saveReportToStorage(report: StudentReportDocument): void {
  try {
    localStorage.setItem(`${REPORT_STORAGE_PREFIX}${report.id}`, JSON.stringify(report));
  } catch {
    /* ignore quota errors */
  }
}

export function getReportDocument(reportId: string): StudentReportDocument {
  return loadReportFromStorage(reportId) ?? createDefaultReport(reportId);
}

export const aiAssistantActions = [
  { id: 'improve', labelKey: 'improveWriting' },
  { id: 'summarize', labelKey: 'summarizeSection' },
  { id: 'rewrite', labelKey: 'rewriteAcademic' },
  { id: 'grammar', labelKey: 'grammarCheck' },
  { id: 'conclusion', labelKey: 'generateConclusion' },
  { id: 'abstract', labelKey: 'generateAbstract' },
  { id: 'references', labelKey: 'suggestReferences' },
] as const;

export const workflowSteps = [
  { status: 'draft' as const, labelKey: 'statusDraft' },
  { status: 'submitted' as const, labelKey: 'statusSubmitted' },
  { status: 'under_review' as const, labelKey: 'statusUnderReview' },
  { status: 'needs_revision' as const, labelKey: 'statusNeedsRevision' },
  { status: 'approved' as const, labelKey: 'statusApproved' },
];

export const activeHubReport = hubReports[0];

export const hubKpiMetrics = {
  wordCount: 982,
  targetWords: 8000,
  completion: 42,
  sectionsComplete: 2,
  totalSections: 9,
  references: 2,
  pendingFeedback: 2,
  readingMinutes: 5,
};

export const reportJourneySteps = [
  { id: 'draft', labelKey: 'journeyDraft', state: 'done' as const, date: '2026-05-20' },
  { id: 'writing', labelKey: 'journeyWriting', state: 'current' as const, date: '2026-05-30' },
  { id: 'review', labelKey: 'journeyReview', state: 'upcoming' as const },
  { id: 'revision', labelKey: 'journeyRevision', state: 'upcoming' as const },
  { id: 'submission', labelKey: 'journeySubmission', state: 'upcoming' as const },
  { id: 'approved', labelKey: 'journeyApproved', state: 'upcoming' as const },
];

export const hubRecentActivity = [
  {
    id: 'a1',
    type: 'edit' as const,
    title: 'Section Méthodologie mise à jour',
    description: 'Mémoire PFE — Talent Center Platform',
    time: '2026-05-30T14:22:00',
    reportId: 'rpt-main-2026',
  },
  {
    id: 'a2',
    type: 'feedback' as const,
    title: 'Nouveau commentaire encadrant',
    description: 'Revue de littérature — 3 références demandées',
    time: '2026-05-29T10:00:00',
    reportId: 'rpt-main-2026',
  },
  {
    id: 'a3',
    type: 'version' as const,
    title: 'Version 3 enregistrée',
    description: 'Retours encadrant intégrés',
    time: '2026-05-30T14:22:00',
    reportId: 'rpt-main-2026',
  },
  {
    id: 'a4',
    type: 'reference' as const,
    title: 'Référence APA ajoutée',
    description: 'Smith & Johnson (2024)',
    time: '2026-05-28T11:30:00',
    reportId: 'rpt-main-2026',
  },
  {
    id: 'a5',
    type: 'submit' as const,
    title: 'Rapport intermédiaire soumis',
    description: 'En attente de validation encadrant',
    time: '2026-05-15T16:40:00',
    reportId: 'rpt-interim-may',
  },
];

export const hubSupervisorFeedback = [
  {
    id: 'sf1',
    author: 'Dr. Amine Benali',
    text: 'La problématique est bien formulée, mais il manque une citation récente sur les LMS modernes.',
    section: 'Introduction',
    priority: 'high' as const,
    createdAt: '2026-05-29T10:00:00',
    resolved: false,
  },
  {
    id: 'sf2',
    author: 'Dr. Amine Benali',
    text: 'Développez la section sur les approches collaboratives avec au moins 3 références académiques.',
    section: 'Revue de littérature',
    priority: 'medium' as const,
    createdAt: '2026-05-27T15:30:00',
    resolved: false,
  },
  {
    id: 'sf3',
    author: 'Dr. Amine Benali',
    text: 'Bon travail sur la méthodologie agile — précisez les critères d\'évaluation.',
    section: 'Méthodologie',
    priority: 'low' as const,
    createdAt: '2026-05-25T09:15:00',
    resolved: true,
  },
];

export const hubDocumentsReferences = [
  {
    id: 'd1',
    name: 'Smith & Johnson (2024)',
    type: 'reference' as const,
    meta: 'APA · Journal of Educational Technology',
    updatedAt: '2026-05-28T11:30:00',
  },
  {
    id: 'd2',
    name: 'Chen et al. (2025)',
    type: 'reference' as const,
    meta: 'IEEE · Learning Technologies',
    updatedAt: '2026-05-26T14:00:00',
  },
  {
    id: 'd3',
    name: 'Modèle officiel PFE ESCA',
    type: 'template' as const,
    meta: 'Structure · 9 sections',
    updatedAt: '2026-01-10T08:00:00',
  },
  {
    id: 'd4',
    name: 'Bibliographie_Mai2026.bib',
    type: 'bibliography' as const,
    meta: 'BibTeX · 12 entrées',
    updatedAt: '2026-05-20T16:00:00',
  },
  {
    id: 'd5',
    name: 'Chapter_2_Draft.pdf',
    type: 'attachment' as const,
    meta: 'PDF · 2.4 Mo',
    updatedAt: '2026-05-22T10:45:00',
  },
];
