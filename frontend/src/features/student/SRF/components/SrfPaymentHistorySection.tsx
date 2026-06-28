import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ReceiptText } from 'lucide-react';
import type { SrfPaymentHistoryRow } from '../types';
import { SRF_OUTLINE_BTN } from '../constants/srfStyles';
import { SRF_SURFACE_CARD } from '../constants/srfLayout';
import {
  SRF_HISTORY_STATUS_BADGE,
  SRF_HISTORY_TYPE_BADGE,
} from '../constants/srfBadgeStyles';
import { formatMad } from '../utils/formatMad';
import SrfEmptyState from './SrfEmptyState';

const historyHeaderKeys = ['date', 'type', 'description', 'amount', 'status'] as const;

interface SrfPaymentHistorySectionProps {
  rows: SrfPaymentHistoryRow[];
  loading?: boolean;
}

const SrfPaymentHistorySection: FunctionComponent<SrfPaymentHistorySectionProps> = ({
  rows,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <section aria-label={t('student.srf.paymentHistory.title')} className={`${SRF_SURFACE_CARD} min-w-0`}>
      <div className="flex flex-col gap-3 border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 font-inter text-lg font-bold leading-7 tracking-tight text-[var(--admin-text)] sm:text-xl">
            {t('student.srf.paymentHistory.title')}
          </h2>
          <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
            {t('student.srf.paymentHistory.subtitle')}
          </p>
        </div>
        <button type="button" className={`${SRF_OUTLINE_BTN} w-full shrink-0 sm:w-auto`}>
          <Download className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('student.srf.paymentHistory.export')}
        </button>
      </div>

      <div className="hidden min-w-0 overflow-x-auto lg:block">
        <table className="admin-table w-full min-w-[640px] border-collapse text-left font-inter">
          <thead>
            <tr className="border-b border-solid border-[var(--admin-border)]">
              {historyHeaderKeys.map((key) => (
                <th
                  key={key}
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold text-[var(--admin-text-muted)] first:pl-6 last:pr-6 sm:px-5 sm:py-3.5 sm:text-[13px] sm:font-medium"
                >
                  {t(`student.srf.paymentHistory.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`history-skeleton-${index}`} className="border-b border-solid border-[var(--admin-border)]">
                  {historyHeaderKeys.map((key) => (
                    <td key={`${index}-${key}`} className="px-4 py-4 first:pl-6 sm:px-5">
                      <div className="h-5 w-full animate-pulse rounded bg-[var(--admin-surface-muted)]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={historyHeaderKeys.length} className="p-0">
                  <SrfEmptyState icon={ReceiptText} title={t('student.srf.table.empty')} />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-solid border-[var(--admin-border)] last:border-b-0"
              >
                <td className="px-4 py-4 text-sm leading-5 text-[var(--admin-text)] first:pl-6 sm:px-5">{row.date}</td>
                <td className="px-4 py-4 sm:px-5">
                  <span className={SRF_HISTORY_TYPE_BADGE}>
                    {t(`student.srf.paymentHistory.types.${row.type}`)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm leading-5 text-[var(--admin-text)] sm:px-5">{row.description}</td>
                <td className="px-4 py-4 text-sm font-medium tabular-nums leading-5 text-[var(--admin-text)] sm:px-5">
                  {formatMad(row.amount)}
                </td>
                <td className="px-4 py-4 last:pr-6 sm:px-5">
                  <span className={SRF_HISTORY_STATUS_BADGE[row.status] ?? SRF_HISTORY_STATUS_BADGE.pending}>
                    {t(`student.srf.paymentHistory.statuses.${row.status}`)}
                  </span>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-5 pt-3 sm:px-5 lg:hidden">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`history-mobile-skeleton-${index}`}
              className="h-24 animate-pulse rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)]"
            />
          ))
        ) : rows.length === 0 ? (
          <SrfEmptyState icon={ReceiptText} title={t('student.srf.table.empty')} />
        ) : (
          rows.map((row) => (
          <article
            key={row.id}
            className="flex min-w-0 flex-col gap-2 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium leading-5 text-[var(--admin-text)]">{row.date}</span>
              <span className={SRF_HISTORY_TYPE_BADGE}>
                {t(`student.srf.paymentHistory.types.${row.type}`)}
              </span>
            </div>
            <p className="m-0 text-sm leading-5 text-[var(--admin-text)]">{row.description}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium tabular-nums leading-5 text-[var(--admin-text)]">
                {formatMad(row.amount)}
              </span>
              <span className={SRF_HISTORY_STATUS_BADGE[row.status] ?? SRF_HISTORY_STATUS_BADGE.pending}>
                {t(`student.srf.paymentHistory.statuses.${row.status}`)}
              </span>
            </div>
          </article>
          ))
        )}
      </div>
    </section>
  );
};

export default SrfPaymentHistorySection;
