import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { InternshipOffer } from '../types';
import { STUDENT_EMPTY_STATE } from '../constants/internshipOffersStyles';
import InternshipOfferCard from '../cards/InternshipOfferCard';
import StudentSearchEmptyState from '../../ui/StudentSearchEmptyState';

interface InternshipOffersGridProps {
  offers: InternshipOffer[];
  emptyMessage?: string;
  /** État vide avec icône recherche bleue (pages filtrées) vs texte simple (recommandations). */
  emptyVariant?: 'search' | 'text';
  /** Grille 2 colonnes max (page principale) vs 3 colonnes (liste complète). */
  layout?: 'recommended' | 'all';
}

const gridLayoutClass: Record<NonNullable<InternshipOffersGridProps['layout']>, string> = {
  recommended: 'grid-cols-1 md:grid-cols-2',
  all: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const InternshipOffersGrid: FunctionComponent<InternshipOffersGridProps> = ({
  offers,
  emptyMessage,
  emptyVariant = 'search',
  layout = 'all',
}) => {
  const { t } = useTranslation();
  const message = emptyMessage ?? t('student.internshipOffers.noResults');

  if (offers.length === 0) {
    if (emptyVariant === 'search') {
      return (
        <StudentSearchEmptyState
          title={message}
          className="max-w-full min-w-0"
        />
      );
    }

    return (
      <div className={`${STUDENT_EMPTY_STATE} max-w-full min-w-0`}>
        <p className="min-w-0 break-words text-sm font-medium text-[var(--admin-text-secondary)]">{message}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid w-full min-w-0 max-w-full gap-3 max-[429px]:gap-2.5 sm:gap-4 ${gridLayoutClass[layout]}`}
    >
      {offers.map((offer) => (
        <InternshipOfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
};

export default InternshipOffersGrid;
