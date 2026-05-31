import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CircleDollarSign, Search, X } from 'lucide-react';
import {
  studentSrfFinancialObligations,
  studentSrfFinancialSummary,
  studentSrfUpcomingDeadline,
} from '../data/studentSrfChatMock';
import { formatMad } from '../../utils/formatMad';
import {
  STUDENT_BADGE_DANGER,
  STUDENT_BADGE_SUCCESS,
  STUDENT_CALLOUT_INFO,
  STUDENT_ICON_CHIP_DANGER,
  STUDENT_ICON_CHIP_SUCCESS,
  STUDENT_INLINE_BADGE,
} from '../../../design-system/studentSemanticStyles';

const SrfFinancialSidebar: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const obligations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studentSrfFinancialObligations;
    return studentSrfFinancialObligations.filter(
      (item) => item.title.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <aside className="student-srf-chat-sidebar flex h-full min-h-0 w-full shrink-0 flex-col border-r border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] sm:w-[clamp(280px,34vw,360px)]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-solid border-[var(--admin-border)] px-4 py-3.5 sm:px-5">
        <h2 className="m-0 text-base font-bold tracking-tight text-[var(--admin-text)] sm:text-[17px]">
          {t('student.srf.chat.financialOverview')}
        </h2>
        <button
          type="button"
          className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            searchOpen
              ? 'bg-[var(--admin-row-hover)] text-[var(--admin-text)]'
              : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)]'
          }`}
          aria-label={t('student.srf.chat.searchObligations')}
          aria-pressed={searchOpen}
          onClick={() => setSearchOpen((v) => !v)}
        >
          <Search className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      {searchOpen ? (
        <div className="shrink-0 border-b border-solid border-[var(--admin-border)] px-4 py-2 sm:px-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('student.srf.chat.searchObligations')}
              className="admin-chat-search-input h-9 w-full rounded-lg border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] py-0 ps-9 pe-9 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-brand)]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute end-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--admin-text-muted)] hover:bg-[var(--admin-row-hover)]"
                aria-label={t('student.srf.chat.clearSearch')}
              >
                <X className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="student-srf-chat-sidebar-scroll admin-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        <article className="student-srf-chat-summary rounded-[14px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="m-0 text-xs font-medium text-[var(--admin-text-muted)]">
            {t('student.srf.chat.totalDue')}
          </p>
          <p className="m-0 mt-1 text-[1.625rem] font-bold tabular-nums leading-8 tracking-tight text-[var(--admin-text)]">
            {formatMad(studentSrfFinancialSummary.totalDue)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-solid border-[var(--admin-border)] pt-3">
            <div>
              <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t('student.srf.chat.paid')}
              </p>
              <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatMad(studentSrfFinancialSummary.totalPaid)}
              </p>
            </div>
            <div>
              <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t('student.srf.chat.remaining')}
              </p>
              <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                {formatMad(studentSrfFinancialSummary.totalRemaining)}
              </p>
            </div>
          </div>
        </article>

        <div>
          <p className="m-0 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)]">
            {t('student.srf.chat.activeObligations')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {obligations.map((item) => {
              const isPaid = item.status === 'paid';
              return (
                <li key={item.id}>
                  <article
                    className={`student-srf-chat-obligation flex items-start gap-3 rounded-[12px] border border-solid p-3 ${
                      isPaid
                        ? 'border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]'
                        : 'border-red-200 bg-red-50/60 dark:border-red-500/30 dark:bg-red-950/20'
                    }`}
                  >
                    <span
                      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${
                        isPaid ? STUDENT_ICON_CHIP_SUCCESS : STUDENT_ICON_CHIP_DANGER
                      }`}
                    >
                      <CircleDollarSign className="size-4" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">
                          {item.title}
                        </h3>
                        <span
                          className={`${STUDENT_INLINE_BADGE} ${
                            isPaid ? STUDENT_BADGE_SUCCESS : STUDENT_BADGE_DANGER
                          }`}
                        >
                          {isPaid ? t('student.srf.status.paid') : t('student.srf.status.toPay')}
                        </span>
                      </div>
                      <p className="m-0 mt-1 text-[13px] leading-5 text-[var(--admin-text-muted)]">
                        {item.detail}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>

        <article
          className={`student-srf-chat-deadline mt-auto flex items-start gap-3 rounded-[12px] p-3.5 ${STUDENT_CALLOUT_INFO}`}
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--admin-brand)_14%,transparent)] text-[var(--admin-brand)]">
            <Calendar className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-xs font-medium text-[var(--admin-text-muted)]">
              {t('student.srf.chat.nextDeadline')}
            </p>
            <p className="m-0 mt-0.5 text-sm font-semibold leading-5 text-[var(--admin-brand)]">
              {studentSrfUpcomingDeadline.label}
            </p>
          </div>
        </article>
      </div>
    </aside>
  );
};

export default SrfFinancialSidebar;
