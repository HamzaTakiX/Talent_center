import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminPagination from '../../../admin/ui/AdminPagination';
import { useAdminPagination } from '../../../admin/shared/hooks/useAdminPagination';
import type { ResolvedDocumentCatalogItem } from '../types';
import DocumentCatalogCard from './DocumentCatalogCard';
import DocumentsCatalogToolbar from './DocumentsCatalogToolbar';
import StudentSearchEmptyState from '../../ui/StudentSearchEmptyState';
import {
  DOCUMENT_CATALOG_PAGE_SIZE,
  type DocumentBadgeFilter,
  type DocumentCategoryFilter,
} from '../constants/documentsCatalog';

interface DocumentsCatalogSectionProps {
  items: ResolvedDocumentCatalogItem[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: DocumentCategoryFilter;
  onCategoryFilterChange: (value: DocumentCategoryFilter) => void;
  badgeFilter: DocumentBadgeFilter;
  onBadgeFilterChange: (value: DocumentBadgeFilter) => void;
}

const DocumentsCatalogSection: FunctionComponent<DocumentsCatalogSectionProps> = ({
  items,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  badgeFilter,
  onBadgeFilterChange,
}) => {
  const { t } = useTranslation();
  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } = useAdminPagination(
    items,
    DOCUMENT_CATALOG_PAGE_SIZE,
  );

  return (
    <section className="min-w-0 space-y-4 sm:space-y-5" aria-labelledby="documents-catalog-heading">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2
            id="documents-catalog-heading"
            className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl"
          >
            {t('student.documents.catalogTitle')}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--admin-text-muted)] sm:text-base">
            {t('student.documents.catalogSubtitle')}
          </p>
        </div>

        <DocumentsCatalogToolbar
          search={search}
          onSearchChange={onSearchChange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={onCategoryFilterChange}
          badgeFilter={badgeFilter}
          onBadgeFilterChange={onBadgeFilterChange}
        />
      </div>

      {items.length === 0 ? (
        <StudentSearchEmptyState title={t('student.documents.noSearchResults')} />
      ) : (
        <>
          <div className="student-document-catalog-grid grid w-full min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {paginatedItems.map((item) => (
              <DocumentCatalogCard
                key={item.id}
                item={item}
                onRequest={(id) => console.log('Demander document', id)}
              />
            ))}
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel={t('student.documents.pagination.documents')}
          />
        </>
      )}
    </section>
  );
};

export default DocumentsCatalogSection;
