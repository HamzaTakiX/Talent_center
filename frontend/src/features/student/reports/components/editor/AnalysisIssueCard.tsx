import { FunctionComponent } from 'react';
import { Eye, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { AnalysisIssue } from '../../types/pageAnalysis';

interface AnalysisIssueCardProps {
  issue: AnalysisIssue;
  onView: (issue: AnalysisIssue) => void;
  onIgnore: (id: string) => void;
}

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'is-critical',
  important: 'is-important',
  minor: 'is-minor',
  suggestion: 'is-suggestion',
};

const AnalysisIssueCard: FunctionComponent<AnalysisIssueCardProps> = ({
  issue,
  onView,
  onIgnore,
}) => {
  const { t } = useTranslation();
  const sevClass = SEVERITY_CLASS[issue.severity] || 'is-minor';

  return (
    <article className={`student-report-issue-card ${sevClass}`}>
      <div className="student-report-issue-card__top">
        <span className={`student-report-issue-card__severity ${sevClass}`}>
          {t(`student.reports.reviewer.severity.${issue.severity}`, {
            defaultValue: issue.severity,
          })}
        </span>
        <span className="student-report-issue-card__page">
          {t('student.reports.reviewer.pageLabel', { page: issue.pageNumber })}
        </span>
      </div>
      <h4 className="student-report-issue-card__title">{issue.title}</h4>
      <p className="student-report-issue-card__category">
        {t(`student.reports.reviewer.category.${issue.category}`, {
          defaultValue: issue.category,
        })}
      </p>
      <p className="student-report-issue-card__desc">{issue.description}</p>
      {issue.quote && !issue.quote.startsWith('(') && (
        <blockquote className="student-report-issue-card__quote">« {issue.quote} »</blockquote>
      )}
      {issue.suggestion && (
        <p className="student-report-issue-card__suggestion">
          <strong>{t('student.reports.reviewer.suggestion')}:</strong> {issue.suggestion}
        </p>
      )}
      <div className="student-report-issue-card__actions">
        <button
          type="button"
          className="student-report-issue-card__btn student-report-issue-card__btn--view"
          onClick={() => onView(issue)}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
          {t('student.reports.reviewer.view')}
        </button>
        <button
          type="button"
          className="student-report-issue-card__btn student-report-issue-card__btn--ignore"
          onClick={() => onIgnore(issue.id)}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          {t('student.reports.reviewer.ignore')}
        </button>
      </div>
    </article>
  );
};

export default AnalysisIssueCard;
