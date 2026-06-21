import { FunctionComponent, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { AdminListToolbar, AdminListToolbarSection } from '../../../admin/ui';

import type { InternshipOfferCategoryFilter } from '../constants/internshipOfferCategories';

import {

  INTERNSHIP_OFFER_CATEGORY_ALL,

  INTERNSHIP_OFFER_CATEGORY_VALUES,

} from '../constants/internshipOfferCategories';

import { OFFER_FIELD_LIMITS } from '../../../../design-system/safeContent';



interface InternshipOffersSearchToolbarProps {

  query: string;

  onQueryChange: (value: string) => void;

  category: InternshipOfferCategoryFilter;

  onCategoryChange: (value: InternshipOfferCategoryFilter) => void;

}



const InternshipOffersSearchToolbar: FunctionComponent<InternshipOffersSearchToolbarProps> = ({

  query,

  onQueryChange,

  category,

  onCategoryChange,

}) => {

  const { t, i18n } = useTranslation();



  const categoryOptions = useMemo(

    () =>

      INTERNSHIP_OFFER_CATEGORY_VALUES.map((value) => ({

        value,

        label:

          value === INTERNSHIP_OFFER_CATEGORY_ALL

            ? t('student.internshipOffers.allCategories')

            : t(`student.internshipOffers.categories.${value}`),

      })),

    [t, i18n.language],

  );



  const handleSearchChange = (value: string) => {

    onQueryChange(value.slice(0, OFFER_FIELD_LIMITS.searchQuery));

  };



  return (

    <AdminListToolbarSection>

      <AdminListToolbar

        searchValue={query}

        onSearchChange={handleSearchChange}

        searchPlaceholder={t('student.internshipOffers.searchPlaceholder')}

        searchAriaLabel={t('student.internshipOffers.searchAria')}

        toolbarAriaLabel={t('student.internshipOffers.filterToolbarAria')}

        filter1={{

          value: category,

          onChange: (value) => onCategoryChange(value as InternshipOfferCategoryFilter),

          options: categoryOptions,

          ariaLabel: t('student.internshipOffers.filterCategoryAria'),

        }}

      />

    </AdminListToolbarSection>

  );

};



export default InternshipOffersSearchToolbar;

