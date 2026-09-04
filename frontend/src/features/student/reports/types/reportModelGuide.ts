export type ReportModelSectionStatus = 'completed' | 'in_progress' | 'not_started';

export interface ReportModelSection {
  id: string;
  parentId: string | null;
  title: string;
  order: number;
  level: 1 | 2 | 3;
  /** Read-only pedagogical guide content (HTML). */
  contentHtml: string;
  /** Optional hints for matching student headings. */
  matchAliases?: string[];
}

export interface ReportModelGuide {
  id: string;
  title: string;
  supervisorName: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  /** Maximum report pages the student should not exceed. */
  maxPages: number;
  sections: ReportModelSection[];
}

export interface ReportModelSectionProgress {
  sectionId: string;
  title: string;
  level: 1 | 2 | 3;
  status: ReportModelSectionStatus;
  progressPercent: number;
  matched: boolean;
  children: ReportModelSectionProgress[];
}

export interface ReportModelProgressSnapshot {
  overallPercent: number;
  currentSectionId: string | null;
  currentSectionTitle: string | null;
  currentSectionPercent: number;
  chapters: ReportModelSectionProgress[];
}
