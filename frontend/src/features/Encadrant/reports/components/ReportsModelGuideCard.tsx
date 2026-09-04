import { FunctionComponent, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDot,
  Upload,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  defaultReportModelGuide,
  loadAssignedReportModel,
  saveAssignedReportModel,
} from '../../../student/reports/data/reportModelGuideMock';
import { getReportDocument } from '../../../student/reports/data/reportPlatformMock';
import { calculateReportModelProgress } from '../../../student/reports/utils/reportModelProgress';
import type { ReportModelSectionProgress } from '../../../student/reports/types/reportModelGuide';

interface ReportsModelGuideCardProps {
  studentId: string;
  studentName: string;
}

function StatusIcon({ status }: { status: ReportModelSectionProgress['status'] }) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />;
  }
  if (status === 'in_progress') {
    return <CircleDot className="h-3.5 w-3.5 text-sky-500" aria-hidden />;
  }
  return <Circle className="h-3.5 w-3.5 text-[var(--admin-text-muted)]" aria-hidden />;
}

const ReportsModelGuideCard: FunctionComponent<ReportsModelGuideCardProps> = ({
  studentId,
  studentName,
}) => {
  const { t } = useTranslation();
  const [model, setModel] = useState(() => loadAssignedReportModel());

  const progress = useMemo(() => {
    const report = getReportDocument('rpt-main-2026');
    return calculateReportModelProgress(model, report.content);
  }, [model, studentId]);

  const handleAssignDefault = () => {
    saveAssignedReportModel(defaultReportModelGuide);
    setModel(defaultReportModelGuide);
  };

  const handleClear = () => {
    saveAssignedReportModel(null);
    setModel(null);
  };

  return (
    <section
      className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-4 sm:p-5"
      aria-label={t('encadrant.reports.modelGuide.title')}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--admin-brand)]">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {t('encadrant.reports.modelGuide.title')}
          </div>
          <h3 className="m-0 text-base font-semibold text-[var(--admin-text)]">
            {t('encadrant.reports.modelGuide.studentProgress', { name: studentName })}
          </h3>
          <p className="m-0 mt-1 text-sm text-[var(--admin-text-muted)]">
            {t('encadrant.reports.modelGuide.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--admin-border)] px-3 py-2 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface)]"
            onClick={handleAssignDefault}
          >
            <Upload className="h-4 w-4" aria-hidden />
            {model ? t('encadrant.reports.modelGuide.reassign') : t('encadrant.reports.modelGuide.assign')}
          </button>
          {model && (
            <button
              type="button"
              className="rounded-xl border border-[var(--admin-border)] px-3 py-2 text-sm text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)]"
              onClick={handleClear}
            >
              {t('encadrant.reports.modelGuide.clear')}
            </button>
          )}
        </div>
      </div>

      {!model ? (
        <div className="rounded-xl border border-dashed border-[var(--admin-border)] px-4 py-8 text-center">
          <p className="m-0 text-sm text-[var(--admin-text-muted)]">
            {t('encadrant.reports.modelGuide.empty')}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[var(--admin-text)]">
              {t('encadrant.reports.modelGuide.progress')}
            </span>
            <strong className="text-sm text-[var(--admin-brand)]">{progress.overallPercent}%</strong>
          </div>
          <div
            className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--admin-surface)]"
            role="progressbar"
            aria-valuenow={progress.overallPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[var(--admin-brand)]"
              style={{ width: `${progress.overallPercent}%` }}
            />
          </div>

          <label className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--admin-text)]">
            <span>{t('encadrant.reports.modelGuide.maxPages')}</span>
            <input
              type="number"
              min={1}
              max={200}
              value={model.maxPages}
              onChange={(e) => {
                const next = Math.max(1, Math.min(200, Number(e.target.value) || 1));
                const updated = { ...model, maxPages: next, updatedAt: new Date().toISOString() };
                saveAssignedReportModel(updated);
                setModel(updated);
              }}
              className="w-20 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1.5 text-sm tabular-nums text-[var(--admin-text)]"
              aria-label={t('encadrant.reports.modelGuide.maxPages')}
            />
          </label>

          {progress.currentSectionTitle && (
            <p className="mb-3 text-sm text-[var(--admin-text-muted)]">
              {t('encadrant.reports.modelGuide.currentChapter')}:{' '}
              <strong className="text-[var(--admin-text)]">{progress.currentSectionTitle}</strong>
            </p>
          )}

          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {progress.chapters.map((chapter) => (
              <li
                key={chapter.sectionId}
                className="flex items-center gap-2 rounded-xl border border-[var(--admin-border)] px-3 py-2.5"
              >
                <StatusIcon status={chapter.status} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--admin-text)]">
                  {chapter.title}
                </span>
                <span className="text-xs font-semibold tabular-nums text-[var(--admin-text-muted)]">
                  {chapter.progressPercent}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default ReportsModelGuideCard;
