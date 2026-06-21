import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CircleDollarSign, Search, X } from 'lucide-react';
import { formatMad } from '../../../../student/SRF/utils/formatMad';
import {
  STUDENT_BADGE_DANGER,
  STUDENT_BADGE_SUCCESS,
  STUDENT_CALLOUT_INFO,
  STUDENT_ICON_CHIP_DANGER,
  STUDENT_ICON_CHIP_SUCCESS,
  STUDENT_INLINE_BADGE,
} from '../../../../student/design-system/studentSemanticStyles';
import type { AdminSrfConversation } from '../types/adminSrfChatTypes';

type Props = {
  conversations: AdminSrfConversation[];
  selectedId: string;
  selected: AdminSrfConversation | null;
  sidebarSearch: string;
  onSidebarSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
};

const AdminSrfFinancialSidebar: FunctionComponent<Props> = ({
  conversations,
  selectedId,
  selected,
  sidebarSearch,
  onSidebarSearchChange,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [obligationSearchOpen, setObligationSearchOpen] = useState(false);
  const [obligationSearch, setObligationSearch] = useState('');

  const obligations = useMemo(() => {
    if (!selected) return [];
    const q = obligationSearch.trim().toLowerCase();
    if (!q) return selected.obligations;
    return selected.obligations.filter(
      (item) => item.title.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q)
    );
  }, [selected, obligationSearch]);

  return (
    <aside className="student-srf-chat-sidebar flex h-full min-h-0 w-full shrink-0 flex-col border-r border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] sm:w-[clamp(280px,34vw,360px)]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-solid border-[var(--admin-border)] px-4 py-3.5 sm:px-5">
        <h2 className="m-0 text-base font-bold tracking-tight text-[var(--admin-text)] sm:text-[17px]">
          {t('student.srf.chat.financialOverview')}
        </h2>
        <button
          type="button"
          className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            obligationSearchOpen
              ? 'bg-[var(--admin-row-hover)] text-[var(--admin-text)]'
              : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)]'
          }`}
          aria-label={t('student.srf.chat.searchObligations')}
          aria-pressed={obligationSearchOpen}
          onClick={() => setObligationSearchOpen((v) => !v)}
          disabled={!selected}
        >
          <Search className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="shrink-0 border-b border-solid border-[var(--admin-border)] px-4 py-2 sm:px-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--admin-text-muted)]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => onSidebarSearchChange(e.target.value)}
            placeholder="Rechercher un étudiant…"
            className="admin-chat-search-input h-9 w-full rounded-lg border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] py-0 ps-9 pe-9 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-brand)]"
            autoComplete="off"
            spellCheck={false}
          />
          {sidebarSearch ? (
            <button
              type="button"
              onClick={() => onSidebarSearchChange('')}
              className="absolute end-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--admin-text-muted)] hover:bg-[var(--admin-row-hover)]"
              aria-label={t('student.srf.chat.clearSearch')}
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {obligationSearchOpen && selected ? (
        <div className="shrink-0 border-b border-solid border-[var(--admin-border)] px-4 py-2 sm:px-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="text"
              value={obligationSearch}
              onChange={(e) => setObligationSearch(e.target.value)}
              placeholder={t('student.srf.chat.searchObligations')}
              className="admin-chat-search-input h-9 w-full rounded-lg border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] py-0 ps-9 pe-9 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-brand)]"
            />
            {obligationSearch ? (
              <button
                type="button"
                onClick={() => setObligationSearch('')}
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
        <div>
          <p className="m-0 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)]">
            Conversations
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {conversations.length === 0 ? (
              <li className="rounded-lg px-2 py-3 text-center text-xs text-[var(--admin-text-muted)]">
                Aucun étudiant trouvé
              </li>
            ) : (
              conversations.map((conv) => {
                const active = conv.id === selectedId;
                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(conv.id)}
                      className={`flex w-full items-start gap-2.5 rounded-xl border border-solid px-2.5 py-2.5 text-start transition-colors ${
                        active
                          ? 'border-[color-mix(in_srgb,var(--admin-brand)_28%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))]'
                          : 'border-transparent hover:border-[var(--admin-border)] hover:bg-[var(--admin-row-hover)]'
                      }`}
                    >
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand)] text-xs font-bold text-white">
                        {conv.studentInitials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--admin-text)]">
                            {conv.studentName}
                          </span>
                          <span className="shrink-0 text-[11px] text-[var(--admin-text-muted)]">
                            {conv.timeLabel}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[var(--admin-text-muted)]">
                          {conv.lastPreview}
                        </span>
                        <span className="mt-1 block text-[11px] font-medium text-[var(--admin-text-secondary)]">
                          {conv.statusLabel}
                        </span>
                      </span>
                      {conv.unreadCount > 0 ? (
                        <span className="mt-1 inline-flex min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand)] px-1.5 text-[10px] font-bold text-white">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {selected ? (
          <>
            <article className="student-srf-chat-summary rounded-[14px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <p className="m-0 text-xs font-medium text-[var(--admin-text-muted)]">
                {selected.studentName} — {t('student.srf.chat.totalDue')}
              </p>
              <p className="m-0 mt-1 text-[1.625rem] font-bold tabular-nums leading-8 tracking-tight text-[var(--admin-text)]">
                {formatMad(selected.financialSummary.totalDue)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-solid border-[var(--admin-border)] pt-3">
                <div>
                  <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                    {t('student.srf.chat.paid')}
                  </p>
                  <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatMad(selected.financialSummary.totalPaid)}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                    {t('student.srf.chat.remaining')}
                  </p>
                  <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                    {formatMad(selected.financialSummary.totalRemaining)}
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
                  {selected.upcomingDeadline.label}
                </p>
              </div>
            </article>
          </>
        ) : null}
      </div>
    </aside>
  );
};

export default AdminSrfFinancialSidebar;
