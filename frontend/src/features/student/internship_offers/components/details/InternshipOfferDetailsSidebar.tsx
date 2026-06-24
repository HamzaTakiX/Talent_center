import { FunctionComponent } from 'react';
import type { InternshipOfferDetails } from '../../types';
import { DETAILS_PAGE_SECTION_GAP } from '../../constants/internshipOfferDetailsStyles';
import InternshipOfferDetailsKeyFacts from './InternshipOfferDetailsKeyFacts';

interface InternshipOfferDetailsSidebarProps {
  offer: InternshipOfferDetails;
}

const InternshipOfferDetailsSidebar: FunctionComponent<InternshipOfferDetailsSidebarProps> = ({
  offer,
}) => {
  return (
    <aside className={`${DETAILS_PAGE_SECTION_GAP} lg:sticky lg:top-5 lg:self-start`}>
      <InternshipOfferDetailsKeyFacts offer={offer} />
    </aside>
  );
};

export default InternshipOfferDetailsSidebar;
