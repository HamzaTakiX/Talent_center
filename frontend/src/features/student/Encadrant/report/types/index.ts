export type ReportSectionStatus = 'complete' | 'draft' | 'empty';

export type ReportEditorTabId = 'editor' | 'preview' | 'comments';

export interface ReportSectionItem {
  id: string;
  title: string;
  wordCount: number;
  status: ReportSectionStatus;
}

export interface ReportProgressData {
  completionPercent: number;
  currentWords: number;
  targetWords: number;
}

export interface ReportEditorTab {
  id: ReportEditorTabId;
  label: string;
  count?: number;
}
