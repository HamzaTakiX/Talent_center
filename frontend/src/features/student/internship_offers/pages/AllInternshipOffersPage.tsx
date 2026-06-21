import { FunctionComponent, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Briefcase } from 'lucide-react';

import StudentLayout from '../../components/StudentLayout';

import BackToDashboardLink from '../components/BackToDashboardLink';

import InternshipOffersPageHeader from '../components/InternshipOffersPageHeader';

import InternshipOffersGrid from '../components/InternshipOffersGrid';

import InternshipOffersGridSkeleton from '../components/InternshipOffersGridSkeleton';

import InternshipOffersSearchToolbar from '../filters/InternshipOffersSearchToolbar';

import { useStudentAllOffers } from '../hooks/useStudentStageOffers';

import type { InternshipOfferCategoryFilter } from '../constants/internshipOfferCategories';

import { INTERNSHIP_OFFER_CATEGORY_ALL } from '../constants/internshipOfferCategories';

import {

  INTERNSHIP_OFFERS_PAGE_ROOT,

  INTERNSHIP_OFFERS_ALL_MAIN_SECTION,

} from '../constants/internshipOffersLayout';

import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';



const AllInternshipOffersPage: FunctionComponent = () => {

  const { t } = useTranslation();

  const [query, setQuery] = useState('');

  const [category, setCategory] = useState<InternshipOfferCategoryFilter>(INTERNSHIP_OFFER_CATEGORY_ALL);

  const { offers, loading, error } = useStudentAllOffers(query, category);

  return (

    <StudentLayout>

      <div

        id="student-all-internship-offers-root"

        className={INTERNSHIP_OFFERS_PAGE_ROOT}

      >

        <InternshipOffersPageHeader
          backLink={<BackToDashboardLink />}
          icon={Briefcase}
          title={t('student.internshipOffers.allTitle')}
          subtitle={t('student.internshipOffers.allSubtitle')}
          iconChipClassName={STUDENT_ICON_CHIP_INFO}
        />



        <section

          aria-label={t('student.internshipOffers.allFeedAria')}

          className={INTERNSHIP_OFFERS_ALL_MAIN_SECTION}

        >

          <InternshipOffersSearchToolbar

            query={query}

            onQueryChange={setQuery}

            category={category}

            onCategoryChange={setCategory}

          />



          {error && (
            <p className="px-1 text-sm text-[var(--admin-danger)]">{error}</p>
          )}

          {loading ? (
            <InternshipOffersGridSkeleton layout="all" loadingLabelKey="loadingAllOffers" />
          ) : (
            <InternshipOffersGrid offers={offers} layout="all" />
          )}

        </section>

      </div>

    </StudentLayout>

  );

};



export default AllInternshipOffersPage;

