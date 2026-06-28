import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck2, Calendar } from 'lucide-react';
import type { SrfUpcomingDeadline } from '../types';
import { SRF_SURFACE_CARD } from '../constants/srfLayout';
import { formatMad } from '../utils/formatMad';
import {
  STUDENT_CALLOUT_DANGER,
  STUDENT_ICON_CHIP_DANGER,
  STUDENT_INLINE_BADGE,
  STUDENT_BADGE_DANGER,
} from '../../design-system/studentSemanticStyles';
import SrfEmptyState from './SrfEmptyState';

interface SrfUpcomingDeadlinesSectionProps {
  deadline: SrfUpcomingDeadline | null;
  loading?: boolean;
}

const SrfUpcomingDeadlinesSection: FunctionComponent<SrfUpcomingDeadlinesSectionProps> = ({
  deadline,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <section aria-label={t('student.srf.deadlines.title')} className={`${SRF_SURFACE_CARD} min-w-0`}>
      <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
          <div className="min-w-0">
            <h2 className="m-0 font-inter text-lg font-bold leading-7 tracking-tight text-[var(--admin-text)] sm:text-xl">
              {t('student.srf.deadlines.title')}
            </h2>
            <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              {t('student.srf.deadlines.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="h-20 w-full animate-pulse rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)]" />
        ) : !deadline ? (
          <SrfEmptyState
            icon={CalendarCheck2}
            title={t('student.srf.deadlines.title')}
            description={t('student.srf.table.empty')}
          />
        ) : (
        <article
          className={`flex min-w-0 flex-col gap-3 ${STUDENT_CALLOUT_DANGER} p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4`}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className={`inline-flex h-10 w-10 shrink-0 rounded-[10px] ${STUDENT_ICON_CHIP_DANGER}`}>
              <Calendar className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">
                {deadline.feeType}
              </h3>
              <p className="m-0 mt-0.5 text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
                {deadline.dueLabel}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
            <span className="text-base font-bold tabular-nums leading-6 text-[var(--admin-text)] sm:text-lg">
              {formatMad(deadline.amount)}
            </span>
            <span className={`${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_DANGER}`}>
              {deadline.daysLabel}
            </span>
          </div>
        </article>
        )}
      </div>
    </section>
  );
};

export default SrfUpcomingDeadlinesSection;
