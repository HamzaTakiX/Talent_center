import { FunctionComponent } from 'react';
import { Calendar, CreditCard, Download } from 'lucide-react';
import type { SrfFeeRow } from '../types';
import { SRF_OUTLINE_BTN, SRF_PRIMARY_BTN } from '../constants/srfStyles';
import { formatMad } from '../utils/formatMad';
import SrfFeeStatusBadges from './SrfFeeStatusBadges';

interface SrfFeesTableProps {
  rows: SrfFeeRow[];
  onPayClick: (row: SrfFeeRow) => void;
}

const TABLE_HEADERS = [
  'Type de frais',
  'Date limite',
  'Montant attendu',
  'Montant payé',
  'Montant restant',
  'Statut',
  'Actions',
] as const;

const btnMobile = (className: string) => `${className} w-full justify-center sm:w-auto`;

const SrfFeesTable: FunctionComponent<SrfFeesTableProps> = ({ rows, onPayClick }) => (
  <>
    <div className="hidden min-w-0 overflow-x-auto lg:block">
      <table className="w-full min-w-[720px] border-collapse text-left font-inter">
        <thead>
          <tr className="border-b border-solid border-[var(--admin-border)]">
            {TABLE_HEADERS.map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-4 py-3 text-xs font-semibold text-[var(--admin-text-muted)] first:pl-6 last:pr-6 sm:px-5 sm:py-3.5 sm:text-[13px] sm:font-medium"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={TABLE_HEADERS.length}
                className="px-6 py-10 text-center text-sm leading-5 text-[var(--admin-text-muted)]"
              >
                Aucun frais dans cette catégorie.
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
                <td className="px-4 py-4 text-sm font-medium tabular-nums leading-5 text-emerald-600 sm:px-5">
                  {formatMad(row.amountPaid)}
                </td>
                <td
                  className={`px-4 py-4 text-sm font-medium tabular-nums leading-5 sm:px-5 ${
                    row.amountRemaining > 0 ? 'text-orange-600' : 'text-orange-500'
                  }`}
                >
                  {formatMad(row.amountRemaining)}
                </td>
                <td className="px-4 py-4 sm:px-5">
                  <SrfFeeStatusBadges status={row.status} />
                </td>
                <td className="px-4 py-4 last:pr-6 sm:px-5">
                  {row.status === 'paid' ? (
                    <button type="button" className={SRF_OUTLINE_BTN}>
                      <Download className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      Reçu
                    </button>
                  ) : (
                    <button type="button" className={SRF_PRIMARY_BTN} onClick={() => onPayClick(row)}>
                      <CreditCard className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      Payer
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="flex flex-col gap-3 px-4 pb-5 pt-1 sm:px-5 lg:hidden">
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm leading-5 text-[var(--admin-text-muted)]">Aucun frais dans cette catégorie.</p>
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
                <dt className="text-[var(--admin-text-muted)]">Montant attendu</dt>
                <dd className="m-0 font-medium tabular-nums text-[var(--admin-text)]">{formatMad(row.amountExpected)}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-muted)]">Montant payé</dt>
                <dd className="m-0 font-medium tabular-nums text-emerald-600">{formatMad(row.amountPaid)}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-muted)]">Montant restant</dt>
                <dd
                  className={`m-0 font-medium tabular-nums ${
                    row.amountRemaining > 0 ? 'text-orange-600' : 'text-orange-500'
                  }`}
                >
                  {formatMad(row.amountRemaining)}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Statut</dt>
                <dd className="m-0">
                  <SrfFeeStatusBadges status={row.status} />
                </dd>
              </div>
            </dl>
            {row.status === 'paid' ? (
              <button type="button" className={btnMobile(SRF_OUTLINE_BTN)}>
                <Download className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Reçu
              </button>
            ) : (
              <button type="button" className={btnMobile(SRF_PRIMARY_BTN)} onClick={() => onPayClick(row)}>
                <CreditCard className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Payer
              </button>
            )}
          </article>
        ))
      )}
    </div>
  </>
);

export default SrfFeesTable;
