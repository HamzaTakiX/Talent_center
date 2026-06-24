import { FunctionComponent, ReactNode } from 'react';
import { DETAILS_SURFACE_CARD_ELEVATED } from '../../constants/internshipOfferDetailsStyles';

interface DetailsSectionCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Réduit le padding pour les sections légères */
  compact?: boolean;
}

const DetailsSectionCard: FunctionComponent<DetailsSectionCardProps> = ({
  children,
  className = '',
  id,
  compact = false,
}) => {
  const padding = compact ? 'px-4 py-4 sm:px-5 sm:py-4' : 'px-4 py-5 sm:px-6 sm:py-5';

  return (
    <section
      id={id}
      className={`${DETAILS_SURFACE_CARD_ELEVATED} box-border w-full min-w-0 max-w-full ${padding} ${className}`}
    >
      {children}
    </section>
  );
};

export default DetailsSectionCard;
