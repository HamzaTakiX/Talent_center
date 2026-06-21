import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import BackToOffersLink from '../components/BackToOffersLink';
import ApplicationTimeline from '../components/journey/ApplicationTimeline';
import { useApplicationDetail } from '../hooks/useInternshipJourney';
import { InternshipOfferPageLoadingState } from '../components/loading/InternshipOfferPageSkeleton';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { applicationStatusLabelKey } from '../utils/applicationStatus';
import { STUDENT_INTERNSHIP_OFFERS_PATH, STUDENT_MY_APPLICATIONS_PATH } from '../constants/routes';
import { Navigate, useParams } from 'react-router-dom';

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

const ApplicationDetailPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { appId } = useParams<{ appId: string }>();
  const { detail, loading, error } = useApplicationDetail(appId);

  if (loading) {
    return (
      <InternshipOfferPageLoadingState variant="application" loadingLabelKey="loadingApplication" />
    );
  }

  if (error || !detail) {
    return <Navigate to={`${STUDENT_INTERNSHIP_OFFERS_PATH}/applications`} replace />;
  }

  return (
    <StudentLayout>
      <div id="student-application-detail-root" className={INTERNSHIP_OFFERS_PAGE_ROOT}>
        <BackToOffersLink
          label={t('student.internshipOffers.journey.backToApplications')}
          to={STUDENT_MY_APPLICATIONS_PATH}
        />

        <header className="flex flex-col gap-2">
          <h1 className="m-0 text-xl font-bold text-[var(--admin-text)] sm:text-2xl">
            {detail.offer.title}
          </h1>
          <p className="m-0 text-sm text-[var(--admin-text-secondary)]">{detail.offer.company_name}</p>
          <span className="inline-flex w-fit rounded-md bg-[var(--admin-brand-muted)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[var(--admin-brand)]">
            {t(applicationStatusLabelKey(detail.status))}
          </span>
        </header>

        <section className="admin-module-panel p-4 sm:p-6">
          <h2 className="m-0 mb-4 text-base font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.journey.timelineTitle')}
          </h2>
          <ApplicationTimeline
            events={detail.timeline}
            pipelineSteps={PIPELINE_STEPS}
            currentStatus={detail.status}
          />
        </section>

        {detail.interviews.length > 0 && (
          <section className="admin-module-panel p-4 sm:p-6">
            <h2 className="m-0 mb-3 text-base font-semibold text-[var(--admin-text)]">
              {t('student.internshipOffers.journey.interviewsTitle')}
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {detail.interviews.map((interview) => (
                <li
                  key={interview.uuid}
                  className="rounded-xl border border-[var(--admin-border)] px-4 py-3 text-sm"
                >
                  <span className="font-medium text-[var(--admin-text)]">
                    {new Date(interview.scheduled_at).toLocaleString()}
                  </span>
                  <span className="ml-2 text-[var(--admin-text-muted)]">{interview.interview_type}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </StudentLayout>
  );
};

export default ApplicationDetailPage;
