import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, Download, MessageSquare, Wallet } from 'lucide-react';
import type { SrfFeeRow } from '../types';
import { STUDENT_SRF_CHAT_PATH } from '../constants/routes';
import {
  SRF_TABLE_BTN_MOBILE,
  SRF_TABLE_OUTLINE_BTN,
  SRF_TABLE_PRIMARY_BTN,
  SRF_TABLE_PRIMARY_BTN_MOBILE,
} from '../constants/srfStyles';
import { formatMad } from '../utils/formatMad';
import SrfFeeStatusBadges from './SrfFeeStatusBadges';
import SrfEmptyState from './SrfEmptyState';
import {
  SRF_AMOUNT_PAID,
  SRF_AMOUNT_REMAINING_DUE,
  SRF_AMOUNT_REMAINING_ZERO,
} from '../constants/srfBadgeStyles';

interface SrfFeesTableProps {
  rows: SrfFeeRow[];
  loading?: boolean;
  onPayClick: (row: SrfFeeRow) => void;
}

const tableHeaderKeys = [
  'feeType',
  'dueDate',
  'expected',
  'paid',
  'remaining',
  'status',
  'actions',
] as const;

const TABLE_ACTIONS = 'flex flex-nowrap items-center justify-center gap-1.5';
const TABLE_ACTION_ICON = 'h-3.5 w-3.5 shrink-0';

function navigateToPaymentAsk(
  navigate: ReturnType<typeof useNavigate>,
  row: SrfFeeRow,
) {
  navigate(STUDENT_SRF_CHAT_PATH, {
    state: {
      paymentAsk: {
        installmentId: row.installmentId,
        feeType: row.feeType,
        dueDate: row.dueDate,
        amountRemaining: row.amountRemaining,
      },
    },
  });
}

function FeeRowActions({
  row,
  onPayClick,
}: {
  row: SrfFeeRow;
  onPayClick: (row: SrfFeeRow) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAsk = () => {
    navigateToPaymentAsk(navigate, row);
  };

  if (row.status === 'paid') {
    return (
      <div className={TABLE_ACTIONS}>
        <button type="button" className={SRF_TABLE_OUTLINE_BTN}>
          <Download className={TABLE_ACTION_ICON} strokeWidth={1.75} aria-hidden />
          {t('student.srf.table.receipt')}
        </button>
      </div>
    );
  }

  if (row.status === 'pending') {
    return (
      <div className="flex items-center justify-center">
        <span className="text-[13px] leading-5 text-[var(--admin-text-muted)]">
          {t('student.srf.table.awaitingValidation')}
        </span>
      </div>
    );
  }

  if (row.canPay) {
    return (
      <div className={TABLE_ACTIONS}>
        <button type="button" className={SRF_TABLE_OUTLINE_BTN} onClick={handleAsk}>
          <MessageSquare className={TABLE_ACTION_ICON} strokeWidth={1.75} aria-hidden />
          {t('student.srf.table.ask')}
        </button>
        <button type="button" className={SRF_TABLE_PRIMARY_BTN} onClick={() => onPayClick(row)}>
          <CreditCard className={TABLE_ACTION_ICON} strokeWidth={1.75} aria-hidden />
          {t('student.srf.table.pay')}
        </button>
      </div>
    );
  }

  return null;
}

const SrfFeesTable: FunctionComponent<SrfFeesTableProps> = ({ rows, loading = false, onPayClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <div className="hidden min-w-0 overflow-x-auto lg:block">
        <table className="admin-table w-full min-w-[720px] border-collapse text-left font-inter">
          <thead>
            <tr className="border-b border-solid border-[var(--admin-border)]">
              {tableHeaderKeys.map((key) => (
                <th
                  key={key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold text-[var(--admin-text-muted)] first:pl-6 last:pr-6 sm:px-5 sm:py-3.5 sm:text-[13px] sm:font-medium${
                    key === 'actions' ? ' text-center' : ''
                  }`}
                >
                  {t(`student.srf.table.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`fees-skeleton-${index}`} className="border-b border-solid border-[var(--admin-border)]">
                  {tableHeaderKeys.map((key) => (
                    <td key={`${index}-${key}`} className="px-4 py-4 first:pl-6 sm:px-5">
                      <div className="h-5 w-full animate-pulse rounded bg-[var(--admin-surface-muted)]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={tableHeaderKeys.length} className="p-0">
                  <SrfEmptyState icon={Wallet} title={t('student.srf.table.empty')} />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-solid border-[var(--admin-border)] last:border-b-0"
                >
                  <td className="px-4 py-4 text-sm font-medium leading-5 text-[var(--admin-text)] first:pl-6 sm:px-5">
                    {row.feeType}
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <span className="inline-flex items-center gap-1.5 text-sm leading-5 text-[var(--admin-text-muted)]">
                      <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {row.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium tabular-nums leading-5 text-[var(--admin-text)] sm:px-5">
                    {formatMad(row.amountExpected)}
                  </td>
                  <td className={`px-4 py-4 text-sm leading-5 sm:px-5 ${SRF_AMOUNT_PAID}`}>
                    {formatMad(row.amountPaid)}
                  </td>
                  <td
                    className={`px-4 py-4 text-sm leading-5 sm:px-5 ${
                      row.amountRemaining > 0 ? SRF_AMOUNT_REMAINING_DUE : SRF_AMOUNT_REMAINING_ZERO
                    }`}
                  >
                    {formatMad(row.amountRemaining)}
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <SrfFeeStatusBadges status={row.status} />
                  </td>
                  <td className="px-4 py-3 last:pr-6 sm:px-5">
                    <FeeRowActions row={row} onPayClick={onPayClick} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-5 pt-1 sm:px-5 lg:hidden">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`fees-mobile-skeleton-${index}`}
              className="h-28 animate-pulse rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)]"
            />
          ))
        ) : rows.length === 0 ? (
          <SrfEmptyState icon={Wallet} title={t('student.srf.table.empty')} />
        ) : (
          rows.map((row) => (
            <article
              key={row.id}
              className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3.5 sm:p-4"
            >
              <div className="min-w-0">
                <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">{row.feeType}</h3>
                <p className="m-0 mt-1 inline-flex items-center gap-1.5 text-[13px] leading-5 text-[var(--admin-text-muted)]">
                  <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                  {row.dueDate}
                </p>
              </div>
              <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px] leading-5">
                <div>
                  <dt className="text-[var(--admin-text-muted)]">{t('student.srf.table.expected')}</dt>
                  <dd className="m-0 font-medium tabular-nums text-[var(--admin-text)]">{formatMad(row.amountExpected)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--admin-text-muted)]">{t('student.srf.table.paid')}</dt>
                  <dd className={`m-0 ${SRF_AMOUNT_PAID}`}>{formatMad(row.amountPaid)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--admin-text-muted)]">{t('student.srf.table.remaining')}</dt>
                  <dd
                    className={`m-0 ${
                      row.amountRemaining > 0 ? SRF_AMOUNT_REMAINING_DUE : SRF_AMOUNT_REMAINING_ZERO
                    }`}
                  >
                    {formatMad(row.amountRemaining)}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">{t('student.srf.table.status')}</dt>
                  <dd className="m-0">
                    <SrfFeeStatusBadges status={row.status} />
                  </dd>
                </div>
              </dl>
              {row.status === 'paid' ? (
                <button type="button" className={SRF_TABLE_BTN_MOBILE}>
                  <Download className={TABLE_ACTION_ICON} strokeWidth={1.75} aria-hidden />
                  {t('student.srf.table.receipt')}
                </button>
              ) : row.status === 'pending' ? (
                <span className="text-center text-[13px] text-[var(--admin-text-muted)]">
                  {t('student.srf.table.awaitingValidation')}
                </span>
              ) : row.canPay ? (
                <div className="flex flex-col gap-1.5 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    className={SRF_TABLE_BTN_MOBILE}
                    onClick={() => navigateToPaymentAsk(navigate, row)}
                  >
                    <MessageSquare className={TABLE_ACTION_ICON} strokeWidth={1.75} aria-hidden />
                    {t('student.srf.table.ask')}
                  </button>
                  <button type="button" className={SRF_TABLE_PRIMARY_BTN_MOBILE} onClick={() => onPayClick(row)}>
                    <CreditCard className={TABLE_ACTION_ICON} strokeWidth={1.75} aria-hidden />
                    {t('student.srf.table.pay')}
                  </button>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </>
  );
};

export default SrfFeesTable;
