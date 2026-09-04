import { FunctionComponent } from 'react';
import type { InternshipOfferDetails } from '../../types';
import InternshipOfferDetailsKeyFacts from './InternshipOfferDetailsKeyFacts';
import InternshipOfferDetailsRequirements from './InternshipOfferDetailsRequirements';

interface InternshipOfferDetailsSidebarProps {
  offer: InternshipOfferDetails;
  className?: string;
}

/** Key Information + Requirements — même ligne, même hauteur. */
const InternshipOfferDetailsSidebar: FunctionComponent<InternshipOfferDetailsSidebarProps> = ({
  offer,
  className = '',
}) => {
  return (
    <div
      className={`grid h-full min-h-0 min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 ${className}`.trim()}
    >
      <InternshipOfferDetailsKeyFacts offer={offer} className="h-full min-h-0" />
      <InternshipOfferDetailsRequirements offer={offer} className="h-full min-h-0" />
    </div>
  );
};

export default InternshipOfferDetailsSidebar;
