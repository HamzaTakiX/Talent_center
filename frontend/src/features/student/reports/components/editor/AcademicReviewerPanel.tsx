import { FunctionComponent } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type {
  AnalysisIssue,
  AnalysisMode,
  AnalysisUiState,
  PageAnalysisResult,
} from '../../types/pageAnalysis';
import AnalysisIssueCard from './AnalysisIssueCard';

interface AcademicReviewerPanelProps {
  state: AnalysisUiState;
  result: PageAnalysisResult | null;
  error: string | null;
  visibleIssues: AnalysisIssue[];
  isLoading: boolean;
  currentPageNumber: number;
  onAnalyzePage: () => void;
  onAnalyzeMode: (mode: AnalysisMode) => void;
  onViewIssue: (issue: AnalysisIssue) => void;
  onIgnoreIssue: (id: string) => void;
}

const SECONDARY_ACTIONS: { mode: AnalysisMode; labelKey: string }[] = [
  { mode: 'language', labelKey: 'checkLanguage' },
  { mode: 'coherence', labelKey: 'checkCoherence' },
  { mode: 'structure', labelKey: 'checkStructure' },
  { mode: 'formatting', labelKey: 'checkFormatting' },
];

const AcademicReviewerPanel: FunctionComponent<AcademicReviewerPanelProps> = ({
  state,
  result,
  error,
  visibleIssues,
  isLoading,
  currentPageNumber,
  onAnalyzePage,
  onAnalyzeMode,
  onViewIssue,
  onIgnoreIssue,
}) => {
  const { t } = useTranslation();
  const summary = result?.analysis.summary;

  return (
    <div className="student-report-ai-panel student-report-reviewer">
      <header className="student-report-reviewer__header">
        <div className="student-report-reviewer__brand">
          <Sparkles className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          <div>
            <h3 className="student-report-reviewer__title">{t('student.reports.reviewer.title')}</h3>
            <p className="student-report-reviewer__subtitle">
              {t('student.reports.reviewer.subtitle')}
            </p>
          </div>
        </div>
      </header>

      <div className="student-report-reviewer__actions">
        <button
          type="button"
          className="student-report-ai-action student-report-ai-action--primary"
          onClick={onAnalyzePage}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {t('student.reports.reviewer.analyzePage')}
        </button>

        <button
          type="button"
          className="student-report-ai-action"
          disabled
          title={t('student.reports.reviewer.chapterSoon')}
        >
          {t('student.reports.reviewer.analyzeChapter')}
        </button>

        {SECONDARY_ACTIONS.map(({ mode, labelKey }) => (
          <button
            key={mode}
            type="button"
            className="student-report-ai-action"
            onClick={() => onAnalyzeMode(mode)}
            disabled={isLoading}
          >
            {t(`student.reports.reviewer.${labelKey}`)}
          </button>
        ))}
      </div>

      <div className="student-report-reviewer__body" aria-live="polite">
        {state === 'idle' && (
          <p className="student-report-reviewer__idle">
            {t('student.reports.reviewer.idleHint', { page: currentPageNumber })}
          </p>
        )}

        {state === 'loading' && (
          <div className="student-report-reviewer__loading">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-brand)]" aria-hidden />
            <p>{t('student.reports.reviewer.loading', { page: currentPageNumber })}</p>
          </div>
        )}

        {state === 'error' && (
          <p className="student-report-reviewer__error" role="alert">
            {error || t('student.reports.reviewer.errorGeneric')}
          </p>
        )}

        {state === 'empty' && result && (
          <div className="student-report-reviewer__empty">
            <p className="student-report-reviewer__score">
              {t('student.reports.reviewer.score', { score: result.analysis.score })}
            </p>
            <p>{t('student.reports.reviewer.noIssues')}</p>
          </div>
        )}

        {state === 'success' && result && (
          <>
            <div className="student-report-reviewer__summary">
              <p className="student-report-reviewer__summary-title">
                {t('student.reports.reviewer.analysisOfPage', { page: result.pageNumber })}
                {result.cached ? (
                  <span className="student-report-reviewer__cached">
                    {t('student.reports.reviewer.cached')}
                  </span>
                ) : null}
              </p>
              <p className="student-report-reviewer__score">
                {t('student.reports.reviewer.score', { score: result.analysis.score })}
              </p>
              {summary && (
                <ul className="student-report-reviewer__counts">
                  <li className="is-critical">
                    {t('student.reports.reviewer.countCritical', { count: summary.critical })}
                  </li>
                  <li className="is-important">
                    {t('student.reports.reviewer.countImportant', { count: summary.important })}
                  </li>
                  <li className="is-minor">
                    {t('student.reports.reviewer.countMinor', { count: summary.minor })}
                  </li>
                  <li className="is-suggestion">
                    {t('student.reports.reviewer.countSuggestion', { count: summary.suggestion })}
                  </li>
                </ul>
              )}
            </div>

            <h4 className="student-report-reviewer__list-title">
              {t('student.reports.reviewer.problemsDetected')}
            </h4>
            <div className="student-report-reviewer__list">
              {visibleIssues.map((issue) => (
                <AnalysisIssueCard
                  key={issue.id}
                  issue={issue}
                  onView={onViewIssue}
                  onIgnore={onIgnoreIssue}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AcademicReviewerPanel;
