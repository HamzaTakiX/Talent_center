import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CircleDollarSign } from 'lucide-react';
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

interface Props {
  conversation: AdminSrfConversation;
}

const SrfFinancialContextPanel: FunctionComponent<Props> = ({ conversation }) => {
  const { t } = useTranslation();
  const [obligationSearch, setObligationSearch] = useState('');

  const obligations = useMemo(() => {
    const q = obligationSearch.trim().toLowerCase();
    if (!q) return conversation.obligations;
    return conversation.obligations.filter(
      (item) => item.title.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q),
    );
  }, [conversation.obligations, obligationSearch]);

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">
          {t('student.srf.chat.contextTitle', { defaultValue: 'Contexte' })}
        </span>
      </header>

      <div className="isi-inspector-section-title">
        {t('student.srf.chat.financialOverview')}
      </div>

      <article className="student-srf-chat-summary mx-1 rounded-[14px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <p className="m-0 text-xs font-medium text-[var(--admin-text-muted)]">
          {conversation.studentName} — {t('student.srf.chat.totalDue')}
        </p>
        <p className="m-0 mt-1 text-[1.625rem] font-bold tabular-nums leading-8 tracking-tight text-[var(--admin-text)]">
          {formatMad(conversation.financialSummary.totalDue)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-solid border-[var(--admin-border)] pt-3">
          <div>
            <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
              {t('student.srf.chat.paid')}
            </p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatMad(conversation.financialSummary.totalPaid)}
            </p>
          </div>
          <div>
            <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
              {t('student.srf.chat.remaining')}
            </p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
              {formatMad(conversation.financialSummary.totalRemaining)}
            </p>
          </div>
        </div>
      </article>

      <div className="mt-4 px-1">
        <input
          type="search"
          value={obligationSearch}
          onChange={(e) => setObligationSearch(e.target.value)}
          placeholder={t('student.srf.chat.searchObligations')}
          className="admin-input mb-3 h-9 w-full text-sm"
          aria-label={t('student.srf.chat.searchObligations')}
        />
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
        className={`student-srf-chat-deadline mx-1 mt-4 flex items-start gap-3 rounded-[12px] p-3.5 ${STUDENT_CALLOUT_INFO}`}
      >
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--admin-brand)_14%,transparent)] text-[var(--admin-brand)]">
          <Calendar className="size-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-xs font-medium text-[var(--admin-text-muted)]">
            {t('student.srf.chat.nextDeadline')}
          </p>
          <p className="m-0 mt-0.5 text-sm font-semibold leading-5 text-[var(--admin-brand)]">
            {conversation.upcomingDeadline.label}
          </p>
        </div>
      </article>
    </aside>
  );
};

export default SrfFinancialContextPanel;
