export type AnalysisSeverity = 'critical' | 'important' | 'minor' | 'suggestion';

export type AnalysisCategory =
  | 'orthography'
  | 'grammar'
  | 'punctuation'
  | 'typography'
  | 'academic_style'
  | 'clarity'
  | 'repetition'
  | 'coherence'
  | 'technical_coherence'
  | 'structure'
  | 'terminology'
  | 'figure'
  | 'table'
  | 'reference'
  | 'formatting';

export type AnalysisMode = 'full' | 'language' | 'coherence' | 'structure' | 'formatting';

export type AnalysisUiState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface AnalysisIssue {
  id: string;
  category: AnalysisCategory | string;
  severity: AnalysisSeverity | string;
  title: string;
  description: string;
  suggestion: string;
  quote: string;
  pageNumber: number;
  confidence: number;
  source: 'deterministic' | 'ai' | string;
}

export interface AnalysisSummaryCounts {
  critical: number;
  important: number;
  minor: number;
  suggestion: number;
}

export interface PageAnalysisResult {
  pageId: string;
  pageNumber: number;
  cached: boolean;
  model: string | null;
  analysis: {
    score: number;
    summary: AnalysisSummaryCounts;
    issues: AnalysisIssue[];
  };
}

export interface OutlineContextItem {
  level: number;
  title: string;
  number?: string;
}

export interface ExtractedPagePayload {
  pageNumber: number;
  pageId: string;
  text: string;
  html: string;
  headings: string[];
  figures: string[];
  tables: string[];
  captions: string[];
  context: {
    chapterTitle: string;
    sectionTitle: string;
    previousExcerpt: string;
    nextExcerpt: string;
    outline: OutlineContextItem[];
  };
}

export interface AnalyzePageRequest {
  reportId: string;
  pageNumber: number;
  pageId: string;
  contentHash: string;
  includeContext?: boolean;
  mode?: AnalysisMode;
  force?: boolean;
  page: {
    text: string;
    html: string;
    headings: string[];
    figures: string[];
    tables: string[];
    captions: string[];
  };
  context: ExtractedPagePayload['context'];
}
