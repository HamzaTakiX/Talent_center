import { FunctionComponent } from 'react';
import type { InternshipOfferDetails } from '../../types';
import { DETAILS_MATCH_ZONE } from '../../constants/internshipOfferDetailsStyles';
import OfferCvMatchSection from './OfferCvMatchSection';
import OfferInterviewSimulationSection from './OfferInterviewSimulationSection';

interface OfferAiCoachPanelProps {
  offer: InternshipOfferDetails;
}

const OfferAiCoachPanel: FunctionComponent<OfferAiCoachPanelProps> = ({ offer }) => {
  return (
    <div id="student-offer-ai-coach" className={DETAILS_MATCH_ZONE}>
      <OfferCvMatchSection offer={offer} />
      <OfferInterviewSimulationSection offer={offer} />
    </div>
  );
};

export default OfferAiCoachPanel;
