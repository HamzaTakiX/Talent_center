import { FunctionComponent, useState } from 'react';
import InternshipOffersGrid from './InternshipOffersGrid';
import InternshipOffersGridSkeleton from './InternshipOffersGridSkeleton';
import InternshipOffersSearchToolbar from '../filters/InternshipOffersSearchToolbar';
import { useStudentAllOffers } from '../hooks/useStudentStageOffers';
import {
  DEFAULT_INTERNSHIP_OFFER_LIST_FILTERS,
  type InternshipOfferDateFilter,
  type InternshipOfferDistanceSort,
} from '../constants/internshipOfferFilters';
import { STUDENT_ALL_OFFERS_SECTION_ID } from '../constants/routes';

const AllInternshipOffersSection: FunctionComponent = () => {
  const [query, setQuery] = useState(DEFAULT_INTERNSHIP_OFFER_LIST_FILTERS.search);
  const [dateFilter, setDateFilter] = useState<InternshipOfferDateFilter>(
    DEFAULT_INTERNSHIP_OFFER_LIST_FILTERS.dateFilter,
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState(
    DEFAULT_INTERNSHIP_OFFER_LIST_FILTERS.maxDistanceKm,
  );
  const [distanceSort, setDistanceSort] = useState<InternshipOfferDistanceSort>(
    DEFAULT_INTERNSHIP_OFFER_LIST_FILTERS.distanceSort,
  );

  const { offers, loading, error, studentLocation } = useStudentAllOffers({
    search: query,
    dateFilter,
    maxDistanceKm,
    distanceSort,
  });

  return (
    <InternshipOffersSearchToolbar
      id={STUDENT_ALL_OFFERS_SECTION_ID}
      query={query}
      onQueryChange={setQuery}
      dateFilter={dateFilter}
      onDateFilterChange={setDateFilter}
      maxDistanceKm={maxDistanceKm}
      onMaxDistanceKmChange={setMaxDistanceKm}
      distanceSort={distanceSort}
      onDistanceSortChange={setDistanceSort}
      studentLocation={studentLocation}
      searchLoading={loading}
      totalCount={offers.length}
    >
      {error && (
        <p className="m-0 px-1 text-sm text-[var(--admin-danger)]">{error}</p>
      )}

      {loading ? (
        <InternshipOffersGridSkeleton layout="all" loadingLabelKey="loadingAllOffers" />
      ) : (
        <InternshipOffersGrid offers={offers} layout="all" />
      )}
    </InternshipOffersSearchToolbar>
  );
};

export default AllInternshipOffersSection;
