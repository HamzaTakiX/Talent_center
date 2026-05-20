import { FunctionComponent } from 'react';
import { Download } from 'lucide-react';
import { srfPaymentHistoryRows } from '../data/srfMock';
import { SRF_OUTLINE_BTN } from '../constants/srfStyles';
import { SRF_SURFACE_CARD } from '../constants/srfLayout';
import { formatMad } from '../utils/formatMad';

const HISTORY_HEADERS = ['Date', 'Type', 'Description', 'Montant', 'Statut'] as const;

const typeBadgeClass =
  'inline-flex rounded-full bg-[var(--admin-surface-inset)] px-2.5 py-1 font-inter text-xs font-medium leading-4 text-[#4b5563]';

const statusClass: Record<string, string> = {
  Validé: 'text-emerald-700',
  Approuvé: 'text-emerald-700',
};

const SrfPaymentHistorySection: FunctionComponent = () => (
  <section aria-label="Historique des paiements" className={`${SRF_SURFACE_CARD} min-w-0`}>
    <div className="flex flex-col gap-3 border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
      <div className="min-w-0 flex-1">
        <h2 className="m-0 font-inter text-lg font-bold leading-7 tracking-tight text-[var(--admin-text)] sm:text-xl">
          Historique des paiements
        </h2>
        <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
          Historique complet de vos paiements, validations et ajustements
        </p>
      </div>
      <button type="button" className={`${SRF_OUTLINE_BTN} w-full shrink-0 sm:w-auto`}>
        <Download className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Exporter
      </button>
    </div>

    <div className="hidden min-w-0 overflow-x-auto lg:block">
      <table className="w-full min-w-[640px] border-collapse text-left font-inter">
        <thead>
          <tr className="border-b border-solid border-[var(--admin-border)]">
            {HISTORY_HEADERS.map((heading) => (
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
          {srfPaymentHistoryRows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-solid border-[var(--admin-border)] last:border-b-0"
            >
              <td className="px-4 py-4 text-sm leading-5 text-[var(--admin-text)] first:pl-6 sm:px-5">{row.date}</td>
              <td className="px-4 py-4 sm:px-5">
                <span className={typeBadgeClass}>{row.type}</span>
              </td>
              <td className="px-4 py-4 text-sm leading-5 text-[var(--admin-text)] sm:px-5">{row.description}</td>
              <td className="px-4 py-4 text-sm font-medium tabular-nums leading-5 text-[var(--admin-text)] sm:px-5">
                {formatMad(row.amount)}
              </td>
              <td className="px-4 py-4 text-sm font-semibold leading-5 last:pr-6 sm:px-5">
                <span className={statusClass[row.status] ?? 'text-emerald-700'}>{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex flex-col gap-3 px-4 pb-5 pt-3 sm:px-5 lg:hidden">
      {srfPaymentHistoryRows.map((row) => (
        <article
          key={row.id}
          className="flex min-w-0 flex-col gap-2 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium leading-5 text-[var(--admin-text)]">{row.date}</span>
            <span className={typeBadgeClass}>{row.type}</span>
          </div>
          <p className="m-0 text-sm leading-5 text-[var(--admin-text)]">{row.description}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium tabular-nums leading-5 text-[var(--admin-text)]">
              {formatMad(row.amount)}
            </span>
            <span className={`text-sm font-semibold leading-5 ${statusClass[row.status]}`}>
              {row.status}
            </span>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default SrfPaymentHistorySection;
