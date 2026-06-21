import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, ChevronRight } from 'lucide-react';
import type { JourneyApplication } from '../../types/journeyTypes';
import { getInternshipApplicationDetailPath } from '../../constants/routes';
import { applicationStatusLabelKey } from '../../utils/applicationStatus';

interface InternshipApplicationsPanelProps {
  applications: JourneyApplication[];
}

const InternshipApplicationsPanel: FunctionComponent<InternshipApplicationsPanelProps> = ({
  applications,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section
      aria-label={t('student.internshipOffers.journey.applicationsAria')}
      className="admin-module-panel flex w-full min-w-0 flex-col gap-3 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
          <h2 className="m-0 text-base font-semibold text-[var(--admin-text)] sm:text-lg">
            {t('student.internshipOffers.journey.applicationsTitle')}
          </h2>
        </div>
        {applications.length > 0 && (
          <button
            type="button"
            className="text-xs font-medium text-[var(--admin-brand)] hover:underline"
            onClick={() => navigate('/student/internship-offers/applications')}
          >
            {t('student.common.viewAll')}
          </button>
        )}
      </div>

      {applications.length === 0 ? (
        <p className="m-0 py-4 text-center text-sm text-[var(--admin-text-muted)]">
          {t('student.internshipOffers.journey.noApplications')}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {applications.map((app) => (
            <li key={app.uuid}>
              <button
                type="button"
                onClick={() => navigate(getInternshipApplicationDetailPath(app.uuid))}
                className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-3.5 py-3 text-left transition-colors hover:bg-[var(--admin-bg-subtle)] sm:px-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--admin-text)]">
                    {app.offer.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--admin-text-secondary)]">
                    {app.offer.company_name}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-[var(--admin-brand-muted)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--admin-brand)]">
                  {t(applicationStatusLabelKey(app.status))}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default InternshipApplicationsPanel;
