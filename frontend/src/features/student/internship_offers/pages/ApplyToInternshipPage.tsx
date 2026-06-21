import { FunctionComponent, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import BackToOfferDetailsLink from '../components/apply/BackToOfferDetailsLink';
import ApplyInternshipHeader from '../components/apply/ApplyInternshipHeader';
import ApplicationReadinessChecklist from '../components/journey/ApplicationReadinessChecklist';
import { InternshipOfferPageLoadingState } from '../components/loading/InternshipOfferPageSkeleton';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH, STUDENT_MY_APPLICATIONS_PATH } from '../constants/routes';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { useApplicationReadiness } from '../hooks/useInternshipJourney';
import { submitStudentApplication, useStudentOfferDetail } from '../hooks/useStudentStageOffers';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';

const ApplyToInternshipPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { offerId } = useParams<{ offerId: string }>();
  const { detail: offer, loading, error } = useStudentOfferDetail(offerId);
  const { readiness, loading: readinessLoading } = useApplicationReadiness(offerId);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!offerId || !readiness?.can_apply) return;
    setApplying(true);
    setApplyError(null);
    try {
      await submitStudentApplication(offerId, {});
      navigate(STUDENT_MY_APPLICATIONS_PATH);
    } catch (err) {
      setApplyError(parseAdminApiError(err, 'application_failed').message);
    } finally {
      setApplying(false);
    }
  };

  if (loading || readinessLoading) {
    return <InternshipOfferPageLoadingState variant="apply" loadingLabelKey="loadingApply" />;
  }

  if (error || !offer) {
    return <Navigate to={STUDENT_ALL_INTERNSHIP_OFFERS_PATH} replace />;
  }

  return (
    <StudentLayout>
      <div id="student-apply-internship-root" className={INTERNSHIP_OFFERS_PAGE_ROOT}>
        <BackToOfferDetailsLink offerId={offer.id} />
        <ApplyInternshipHeader offer={offer} />

        {applyError && (
          <p className="rounded-lg border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/5 px-4 py-3 text-sm text-[var(--admin-danger)]">
            {applyError}
          </p>
        )}

        {readiness && (
          <ApplicationReadinessChecklist
            readiness={readiness}
            onApply={handleApply}
            applying={applying}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default ApplyToInternshipPage;
