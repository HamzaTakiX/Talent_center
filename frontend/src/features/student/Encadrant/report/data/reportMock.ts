import type { ReportEditorTab, ReportProgressData, ReportSectionItem } from '../types';

export const reportSections: ReportSectionItem[] = [
  { id: 'intro', title: 'Introduction', wordCount: 145, status: 'complete' },
  { id: 'lit-review', title: 'Revue de littérature', wordCount: 58, status: 'draft' },
  { id: 'methodology', title: 'Méthodologie', wordCount: 15, status: 'draft' },
  { id: 'implementation', title: 'Implémentation', wordCount: 0, status: 'empty' },
  { id: 'results', title: 'Résultats', wordCount: 0, status: 'empty' },
  { id: 'conclusion', title: 'Conclusion', wordCount: 0, status: 'empty' },
];

export const reportProgress: ReportProgressData = {
  completionPercent: 65,
  currentWords: 218,
  targetWords: 8000,
};

export const reportEditorTabs: ReportEditorTab[] = [
  { id: 'editor', label: 'Éditeur' },
  { id: 'preview', label: 'Aperçu' },
  { id: 'comments', label: 'Commentaires', count: 2 },
];

export const reportAiAssistantText = "Sélectionnez du texte pour l'améliorer avec l'IA";
