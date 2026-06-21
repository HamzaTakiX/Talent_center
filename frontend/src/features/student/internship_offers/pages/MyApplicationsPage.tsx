import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import BackToOffersLink from '../components/BackToOffersLink';
import ApplicationTimeline from '../components/journey/ApplicationTimeline';
import { useStudentApplications } from '../hooks/useInternshipJourney';
import { InternshipOfferPageLoadingState } from '../components/loading/InternshipOfferPageSkeleton';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { applicationStatusLabelKey } from '../utils/applicationStatus';
import { getInternshipApplicationDetailPath, STUDENT_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import { ChevronRight } from 'lucide-react';

const PIPELINE_STEPS = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'ACCEPTED',
  'OFFER_ACCEPTED',
  'INTERNSHIP_STARTED',
  'INTERNSHIP_COMPLETED',
];

const MyApplicationsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { applications, loading, error } = useStudentApplications();

  if (loading) {
    return (
      <InternshipOfferPageLoadingState variant="applications-list" loadingLabelKey="loadingApplications" />
    );
  }

  return (
    <StudentLayout>
      <div id="student-applications-root" className={INTERNSHIP_OFFERS_PAGE_ROOT}>
        <BackToOffersLink to={STUDENT_INTERNSHIP_OFFERS_PATH} />

        <header>
          <h1 className="m-0 text-xl font-bold text-[var(--admin-text)] sm:text-2xl">
            {t('student.internshipOffers.journey.myApplicationsTitle')}
          </h1>
          <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">
            {t('student.internshipOffers.journey.myApplicationsSubtitle')}
          </p>
        </header>

        {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}

        {applications.length === 0 ? (
          <div className="admin-module-panel p-8 text-center">
            <p className="m-0 text-sm text-[var(--admin-text-muted)]">
              {t('student.internshipOffers.journey.noApplications')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app) => (
              <article key={app.uuid} className="admin-module-panel p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => navigate(getInternshipApplicationDetailPath(app.uuid))}
                  className="mb-4 flex w-full items-center justify-between gap-3 text-left"
                >
                  <span>
                    <span className="block text-base font-semibold text-[var(--admin-text)]">
                      {app.offer.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[var(--admin-text-secondary)]">
                      {app.offer.company_name}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--admin-text-muted)]" />
                </button>
                <ApplicationTimeline
                  events={[{
                    status: app.status,
                    previous_status: '',
                    at: app.last_status_change_at ?? app.applied_at,
                    reason: t(applicationStatusLabelKey(app.status)),
                    is_automated: false,
                  }]}
                  pipelineSteps={PIPELINE_STEPS}
                  currentStatus={app.status}
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default MyApplicationsPage;
