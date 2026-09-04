import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, FilePenLine, LineChart } from 'lucide-react';
import {
  encadrantGlobalReportProgress,
  encadrantReportChapters,
} from '../data/encadrantMock';
import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';
import {
  studentReportEditorPath,
  STUDENT_REPORTS_PATH,
} from '../../reports/constants/routes';
import { STUDENT_PROGRESS_TRACK } from '../../design-system/studentSemanticStyles';

type ProgressTone = 'empty' | 'started' | 'progress' | 'advanced' | 'complete';

function progressTone(value: number): ProgressTone {
  if (value >= 100) return 'complete';
  if (value >= 75) return 'advanced';
  if (value >= 35) return 'progress';
  if (value > 0) return 'started';
  return 'empty';
}

const TONE_FILL: Record<ProgressTone, string> = {
  empty: 'bg-[var(--admin-text-muted)] opacity-35',
  started: 'bg-amber-500',
  progress: 'bg-[var(--admin-brand)]',
  advanced: 'bg-[color-mix(in_srgb,var(--admin-brand)_72%,#22c55e)]',
  complete: 'bg-emerald-500',
};

const TONE_BADGE: Record<ProgressTone, string> = {
  empty: 'bg-[var(--admin-surface-inset)] text-[var(--admin-text-muted)]',
  started: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  progress: 'bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]',
  advanced: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  complete: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

interface ProgressBarProps {
  label: string;
  progress: number;
  compact?: boolean;
}

const ProgressBar: FunctionComponent<ProgressBarProps> = ({ label, progress, compact = false }) => {
  const { t } = useTranslation();
  const tone = progressTone(progress);

  return (
    <div
      className={`min-w-0 rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/60 p-3 transition-colors hover:border-[color-mix(in_srgb,var(--admin-brand)_22%,var(--admin-border))] sm:p-3.5 ${
        compact ? '' : 'sm:rounded-[14px]'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[13px] font-medium leading-5 text-[var(--admin-text)] sm:text-sm">
          {label}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums leading-4 sm:text-xs ${TONE_BADGE[tone]}`}
        >
          {progress}%
        </span>
      </div>
      <div
        className={`${STUDENT_PROGRESS_TRACK} ${compact ? 'h-2' : 'h-2.5'}`}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('student.encadrant.report.progressAria', { label, progress })}
      >
        <div
          className={`${compact ? 'h-2' : 'h-2.5'} rounded-full transition-[width] duration-500 ease-out ${TONE_FILL[tone]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const EncadrantReportProgressSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const globalTone = progressTone(encadrantGlobalReportProgress);

  return (
    <section aria-label={t('student.encadrant.report.title')} className={`${ENCADRANT_SURFACE_CARD} min-w-0`}>
      <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
            <LineChart className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">
              {t('student.encadrant.report.title')}
            </h2>
            <p className="m-0 mt-0.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              {t('student.encadrant.report.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">
        <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--admin-brand)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))] p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t('student.encadrant.report.global')}
              </p>
              <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">
                {encadrantReportChapters.filter((c) => c.progress >= 100).length} / {encadrantReportChapters.length}{' '}
                {t('student.encadrant.report.chaptersComplete')}
              </p>
            </div>
            <span
              className={`inline-flex min-w-[3.25rem] items-center justify-center rounded-full px-3 py-1 text-lg font-bold tabular-nums leading-none ${TONE_BADGE[globalTone]}`}
            >
              {encadrantGlobalReportProgress}%
            </span>
          </div>
          <div
            className={`${STUDENT_PROGRESS_TRACK} h-3.5 sm:h-4`}
            role="progressbar"
            aria-valuenow={encadrantGlobalReportProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('student.encadrant.report.progressAria', {
              label: t('student.encadrant.report.global'),
              progress: encadrantGlobalReportProgress,
            })}
          >
            <div
              className={`h-3.5 rounded-full transition-[width] duration-700 ease-out sm:h-4 ${TONE_FILL[globalTone]}`}
              style={{ width: `${encadrantGlobalReportProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-3.5 lg:gap-4">
          {encadrantReportChapters.map((chapter) => (
            <ProgressBar key={chapter.id} label={chapter.label} progress={chapter.progress} compact />
          ))}
        </div>

        <div className="-mx-4 flex flex-col gap-2.5 border-t border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-muted)_55%,transparent)] px-4 py-4 sm:-mx-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-5 sm:py-4">
          <Link
            to={STUDENT_REPORTS_PATH}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--admin-text)] no-underline shadow-[var(--admin-shadow-sm)] transition-[border-color,background-color,transform] hover:border-[color-mix(in_srgb,var(--admin-brand)_30%,var(--admin-border))] hover:bg-[var(--admin-surface-muted)] active:scale-[0.99] sm:w-auto"
          >
            <Eye className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
            {t('student.encadrant.report.viewReport')}
          </Link>
          <Link
            to={studentReportEditorPath('rpt-main-2026')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[color-mix(in_srgb,var(--admin-brand)_35%,transparent)] bg-[var(--admin-brand)] px-4 py-2.5 text-center text-sm font-semibold text-white no-underline shadow-[0_4px_14px_color-mix(in_srgb,var(--admin-brand)_38%,transparent)] transition-[filter,transform] hover:brightness-105 active:scale-[0.99] sm:w-auto"
          >
            <FilePenLine className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t('student.encadrant.report.continueWriting')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EncadrantReportProgressSection;
