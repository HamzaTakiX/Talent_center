import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Sparkles } from 'lucide-react';
import { buildInterviewSimulatorOfferPath } from '../../interview_Simulator/constants/routes';
import {
  DETAILS_SECTION_SUBTITLE,
  DETAILS_SECTION_TITLE,
  DETAILS_SIMULATION_CTA,
} from '../../constants/internshipOfferDetailsStyles';
import type { InternshipOfferDetails } from '../../types';
import DetailsSectionCard from './DetailsSectionCard';

interface OfferInterviewSimulationSectionProps {
  offer: InternshipOfferDetails;
}

const OfferInterviewSimulationSection: FunctionComponent<OfferInterviewSimulationSectionProps> = ({
  offer,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    navigate(buildInterviewSimulatorOfferPath(offer.id), {
      state: { offerSnapshot: offer },
    });
  }, [navigate, offer]);

  return (
    <DetailsSectionCard className="student-interview-sim-section">
      <div className="mb-3 flex min-w-0 items-start gap-2.5">
        <div className="student-icon-chip student-icon-chip--brand flex h-9 w-9 shrink-0 items-center justify-center">
          <MessageSquare className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>
            {t('student.internshipOffers.details.interviewSim.title')}
          </h2>
          <p className={`${DETAILS_SECTION_SUBTITLE} m-0 mt-1`}>
            {t('student.internshipOffers.details.interviewSim.subtitle')}
          </p>
        </div>
      </div>

      <div className="student-interview-sim-intro">
        <div className="student-interview-sim-intro__content">
          <div className="student-interview-sim-intro__icon" aria-hidden>
            <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="student-interview-sim-intro__text">
            {t('student.internshipOffers.details.interviewSim.intro', {
              title: offer.title,
              company: offer.company,
            })}
          </p>
        </div>

        <button type="button" className={DETAILS_SIMULATION_CTA} onClick={handleStart}>
          <span className="student-interview-sim-cta__icon" aria-hidden>
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          {t('student.internshipOffers.details.interviewSim.start')}
        </button>
      </div>
    </DetailsSectionCard>
  );
};

export default OfferInterviewSimulationSection;
