import { FunctionComponent, useEffect, useMemo, useRef } from 'react';
import { BookOpen, FileText, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ReportModelGuide } from '../../types/reportModelGuide';
import { flattenModelSections } from '../../utils/reportModelProgress';

type PanelState = 'loading' | 'ready' | 'empty' | 'error';

interface ReportModelComparePaneProps {
  model: ReportModelGuide | null;
  loadState?: PanelState;
  focusSectionId?: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

const ReportModelComparePane: FunctionComponent<ReportModelComparePaneProps> = ({
  model,
  loadState = 'ready',
  focusSectionId = null,
  onClose,
  onRetry,
}) => {
  const { t } = useTranslation();
  const docRef = useRef<HTMLDivElement>(null);

  const fullHtml = useMemo(() => {
    if (!model) return '';
    return flattenModelSections(model.sections)
      .filter((s) => s.level === 1 || s.contentHtml.trim())
      .map((s) => {
        const hasHeading = /<h[1-3]\b/i.test(s.contentHtml);
        const block = hasHeading
          ? s.contentHtml
          : `<h${Math.min(s.level + 1, 3)}>${s.title}</h${Math.min(s.level + 1, 3)}>${s.contentHtml}`;
        return `<section id="model-sec-${s.id}" data-model-section="${s.id}">${block}</section>`;
      })
      .join('');
  }, [model]);

  useEffect(() => {
    if (!focusSectionId || !docRef.current) return;
    const el = docRef.current.querySelector(`#model-sec-${focusSectionId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusSectionId, fullHtml]);

  return (
    <aside className="student-report-model-compare" aria-label={t('student.reports.modelGuide.title')}>
      <header className="student-report-model-compare__header">
        <div className="min-w-0">
          <div className="student-report-model-panel__eyebrow">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {t('student.reports.modelGuide.eyebrow')}
          </div>
          <h2 className="m-0 truncate text-sm font-bold">
            {model?.title ?? t('student.reports.modelGuide.title')}
          </h2>
          <p className="m-0 mt-0.5 truncate text-xs text-[var(--admin-text-muted)]">
            {model
              ? t('student.reports.modelGuide.subtitleWithSupervisor', { name: model.supervisorName })
              : t('student.reports.modelGuide.subtitle')}
          </p>
        </div>
        <button
          type="button"
          className="student-report-action student-report-action--ghost"
          onClick={onClose}
          aria-label={t('student.reports.modelGuide.closeCompare')}
          title={t('student.reports.modelGuide.closeCompare')}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="student-report-model-compare__body">
        {loadState === 'loading' && (
          <div className="student-report-model-empty" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-brand)]" aria-hidden />
            <p>{t('student.reports.modelGuide.loading')}</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="student-report-model-empty">
            <p>{t('student.reports.modelGuide.error')}</p>
            {onRetry && (
              <button type="button" className="student-report-action student-report-action--primary" onClick={onRetry}>
                {t('student.reports.modelGuide.retry')}
              </button>
            )}
          </div>
        )}

        {(loadState === 'empty' || (loadState === 'ready' && !model)) && (
          <div className="student-report-model-empty">
            <FileText className="h-8 w-8 text-[var(--admin-text-muted)]" aria-hidden />
            <h3>{t('student.reports.modelGuide.emptyTitle')}</h3>
            <p>{t('student.reports.modelGuide.emptyBody')}</p>
          </div>
        )}

        {loadState === 'ready' && model && (
          <article
            ref={docRef}
            className="student-report-model-compare__doc"
            dangerouslySetInnerHTML={{ __html: fullHtml }}
          />
        )}
      </div>
    </aside>
  );
};

export default ReportModelComparePane;
