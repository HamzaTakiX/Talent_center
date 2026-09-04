import { useCallback, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { AxiosError } from 'axios';

import { analyzeReportPage } from '../api/reportReviewerApi';
import type {
  AnalysisIssue,
  AnalysisMode,
  AnalysisUiState,
  PageAnalysisResult,
} from '../types/pageAnalysis';
import { extractReportPage } from '../utils/extractReportPage';
import { hashPageContent } from '../utils/reportPageHash';

function errorMessageFromAxios(err: unknown): string {
  const ax = err as AxiosError<{ message?: string }>;
  const apiMsg = ax?.response?.data?.message;
  if (apiMsg) return apiMsg;
  if (err instanceof Error && err.message) return err.message;
  return 'Impossible d\'analyser cette page. Vérifiez la connexion au service IA.';
}

export function usePageAnalysis(reportId: string) {
  const [state, setState] = useState<AnalysisUiState>('idle');
  const [result, setResult] = useState<PageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
  const [activeMode, setActiveMode] = useState<AnalysisMode>('full');
  const abortRef = useRef(0);

  const visibleIssues: AnalysisIssue[] =
    result?.analysis.issues.filter((i) => !ignoredIds.has(i.id)) ?? [];

  const runAnalysis = useCallback(
    async (editor: Editor | null, mode: AnalysisMode = 'full', pageNumber?: number) => {
      if (!editor) {
        setState('error');
        setError('Éditeur non disponible.');
        return;
      }

      const token = ++abortRef.current;
      setActiveMode(mode);
      setState('loading');
      setError(null);

      try {
        const extracted = extractReportPage(editor, pageNumber);
        const text = extracted.text.trim();
        if (!text) {
          if (token !== abortRef.current) return;
          setResult(null);
          setState('error');
          setError('Cette page est vide. Ajoutez du contenu avant d\'analyser.');
          return;
        }

        const contentHash = await hashPageContent(text);
        const data = await analyzeReportPage({
          reportId,
          pageNumber: extracted.pageNumber,
          pageId: extracted.pageId,
          contentHash,
          includeContext: true,
          mode,
          page: {
            text: extracted.text,
            html: extracted.html,
            headings: extracted.headings,
            figures: extracted.figures,
            tables: extracted.tables,
            captions: extracted.captions,
          },
          context: extracted.context,
        });

        if (token !== abortRef.current) return;

        setResult(data);
        setIgnoredIds(new Set());
        const count = data.analysis.issues?.length ?? 0;
        setState(count === 0 ? 'empty' : 'success');
      } catch (err) {
        if (token !== abortRef.current) return;
        setResult(null);
        setState('error');
        setError(errorMessageFromAxios(err));
      }
    },
    [reportId],
  );

  const ignoreIssue = useCallback((id: string) => {
    setIgnoredIds((prev) => new Set(prev).add(id));
  }, []);

  const reset = useCallback(() => {
    abortRef.current += 1;
    setState('idle');
    setResult(null);
    setError(null);
    setIgnoredIds(new Set());
  }, []);

  return {
    state,
    result,
    error,
    activeMode,
    visibleIssues,
    runAnalysis,
    ignoreIssue,
    reset,
    isLoading: state === 'loading',
  };
}
