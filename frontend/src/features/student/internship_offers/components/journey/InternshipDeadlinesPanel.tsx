import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock } from 'lucide-react';
import type { JourneyDeadline } from '../../types/journeyTypes';
import { formatJourneyDate } from '../../utils/applicationStatus';
import { getInternshipOfferDetailsPath } from '../../constants/routes';

interface InternshipDeadlinesPanelProps {
  deadlines: JourneyDeadline[];
}

const InternshipDeadlinesPanel: FunctionComponent<InternshipDeadlinesPanelProps> = ({ deadlines }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (deadlines.length === 0) return null;

  return (
    <section
      aria-label={t('student.internshipOffers.journey.deadlinesAria')}
      className="admin-module-panel flex w-full min-w-0 flex-col gap-3 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={1.75} aria-hidden />
        <h2 className="m-0 text-base font-semibold text-[var(--admin-text)] sm:text-lg">
          {t('student.internshipOffers.journey.deadlinesTitle')}
        </h2>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {deadlines.map((item) => (
          <li key={`${item.offer_uuid}-${item.deadline}`}>
            <button
              type="button"
              onClick={() => navigate(getInternshipOfferDetailsPath(item.offer_uuid))}
              className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-3.5 py-3 text-left transition-colors hover:bg-[var(--admin-bg-subtle)] sm:px-4"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--admin-text)]">
                  {item.offer_title}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">
                  {item.company_name}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {formatJourneyDate(item.deadline)}
                </span>
                <span className="text-[10px] text-[var(--admin-text-muted)]">
                  {t(`student.internshipOffers.journey.deadlineType.${item.type}`)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default InternshipDeadlinesPanel;
