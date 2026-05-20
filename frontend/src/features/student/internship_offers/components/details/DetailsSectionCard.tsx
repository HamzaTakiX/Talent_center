import { FunctionComponent, ReactNode } from 'react';
import { DETAILS_SURFACE_CARD } from '../../constants/internshipOfferDetailsStyles';

interface DetailsSectionCardProps {
  children: ReactNode;
  className?: string;
}

const DetailsSectionCard: FunctionComponent<DetailsSectionCardProps> = ({
  children,
  className = '',
}) => {
  return (
    <section
      className={`${DETAILS_SURFACE_CARD} box-border w-full min-w-0 max-w-full px-4 py-5 sm:px-6 sm:py-6 ${className}`}
    >
      {children}
    </section>
  );
};

export default DetailsSectionCard;
