import { FunctionComponent } from 'react';
import { Calendar } from 'lucide-react';
import { srfUpcomingDeadline } from '../data/srfMock';
import { SRF_SURFACE_CARD } from '../constants/srfLayout';
import { formatMad } from '../utils/formatMad';

const SrfUpcomingDeadlinesSection: FunctionComponent = () => (
  <section aria-label="Échéances à venir" className={`${SRF_SURFACE_CARD} min-w-0`}>
    <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-start gap-2">
        <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0">
          <h2 className="m-0 font-inter text-lg font-bold leading-7 tracking-tight text-[var(--admin-text)] sm:text-xl">
            Échéances à venir
          </h2>
          <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
            Dates limites de paiement importantes
          </p>
        </div>
      </div>
    </div>

    <div className="p-4 sm:p-5">
      <article className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-solid border-red-100 bg-red-50 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-red-100 text-red-600">
            <Calendar className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">
              {srfUpcomingDeadline.feeType}
            </h3>
            <p className="m-0 mt-0.5 text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              {srfUpcomingDeadline.dueLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <span className="text-base font-bold tabular-nums leading-6 text-red-600 sm:text-lg">
            {formatMad(srfUpcomingDeadline.amount)}
          </span>
          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 font-inter text-xs font-semibold leading-4 text-red-700">
            {srfUpcomingDeadline.daysLabel}
          </span>
        </div>
      </article>
    </div>
  </section>
);

export default SrfUpcomingDeadlinesSection;
