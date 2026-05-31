import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminListToolbar, AdminListToolbarSection } from '../../../admin/ui';
import {
  DOCUMENT_BADGE_FILTER_VALUES,
  DOCUMENT_CATEGORY_FILTER_VALUES,
  type DocumentBadgeFilter,
  type DocumentCategoryFilter,
} from '../constants/documentsCatalog';

interface DocumentsCatalogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: DocumentCategoryFilter;
  onCategoryFilterChange: (value: DocumentCategoryFilter) => void;
  badgeFilter: DocumentBadgeFilter;
  onBadgeFilterChange: (value: DocumentBadgeFilter) => void;
}

const DocumentsCatalogToolbar: FunctionComponent<DocumentsCatalogToolbarProps> = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  badgeFilter,
  onBadgeFilterChange,
}) => {
  const { t, i18n } = useTranslation();

  const categoryOptions = useMemo(
    () =>
      DOCUMENT_CATEGORY_FILTER_VALUES.map((value) => ({
        value,
        label:
          value === 'all'
            ? t('student.documents.allCategories')
            : t(`student.documents.categories.${value}`),
      })),
    [t, i18n.language],
  );

  const badgeOptions = useMemo(
    () =>
      DOCUMENT_BADGE_FILTER_VALUES.map((value) => ({
        value,
        label:
          value === 'all'
            ? t('student.documents.allDeliveryTypes')
            : t(`student.documents.badges.${value === 'auto' ? 'auto' : 'reservation'}`),
      })),
    [t, i18n.language],
  );

  return (
    <AdminListToolbarSection>
      <AdminListToolbar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={t('student.documents.searchPlaceholder')}
        searchAriaLabel={t('student.documents.searchAria')}
        toolbarAriaLabel={t('student.documents.filterToolbarAria')}
        filter1={{
          value: categoryFilter,
          onChange: (value) => onCategoryFilterChange(value as DocumentCategoryFilter),
          options: categoryOptions,
          ariaLabel: t('student.documents.filterCategoryAria'),
        }}
        filter2={{
          value: badgeFilter,
          onChange: (value) => onBadgeFilterChange(value as DocumentBadgeFilter),
          options: badgeOptions,
          ariaLabel: t('student.documents.filterBadgeAria'),
        }}
      />
    </AdminListToolbarSection>
  );
};

export default DocumentsCatalogToolbar;
