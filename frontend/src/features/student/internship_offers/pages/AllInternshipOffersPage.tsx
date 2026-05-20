import { FunctionComponent, useMemo, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import BackToDashboardLink from '../components/BackToDashboardLink';
import InternshipOffersGrid from '../components/InternshipOffersGrid';
import InternshipOffersSearchToolbar from '../filters/InternshipOffersSearchToolbar';
import { allInternshipOffers } from '../data/internshipOffersMock';
import { filterInternshipOffers } from '../helpers/filterInternshipOffers';
import type { InternshipOfferCategoryFilter } from '../constants/internshipOfferCategories';
import { INTERNSHIP_OFFER_CATEGORY_ALL } from '../constants/internshipOfferCategories';
import {
  INTERNSHIP_OFFERS_PAGE_HEADER,
  INTERNSHIP_OFFERS_PAGE_ROOT,
} from '../constants/internshipOffersLayout';

const AllInternshipOffersPage: FunctionComponent = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<InternshipOfferCategoryFilter>(INTERNSHIP_OFFER_CATEGORY_ALL);

  const filteredOffers = useMemo(
    () => filterInternshipOffers(allInternshipOffers, query, category),
    [query, category]
  );

  return (
    <StudentLayout>
      <div
        id="student-all-internship-offers-root"
        className={INTERNSHIP_OFFERS_PAGE_ROOT}
      >
        <header className={INTERNSHIP_OFFERS_PAGE_HEADER}>
          <BackToDashboardLink />
          <h1 className="m-0 min-w-0 max-w-full break-words text-2xl font-semibold leading-8 tracking-tight text-[var(--admin-text)] sm:text-[28px] sm:leading-9">
            All Internship Offers
          </h1>
        </header>

        <InternshipOffersSearchToolbar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
        />

        <section className="min-w-0 max-w-full overflow-x-clip">
          <InternshipOffersGrid offers={filteredOffers} />
        </section>
      </div>
    </StudentLayout>
  );
};

export default AllInternshipOffersPage;
