import { FunctionComponent } from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminPagination from '../../../admin/ui/AdminPagination';
import { useAdminPagination } from '../../../admin/shared/hooks/useAdminPagination';
import type { DocumentServiceCatalogItem } from '../../../admin/Documents_admin/types/documentServiceCatalog';
import DocumentCatalogCard from './DocumentCatalogCard';
import DocumentsCatalogToolbar from './DocumentsCatalogToolbar';
import StudentSearchEmptyState from '../../ui/StudentSearchEmptyState';
import {
  DOCUMENT_CATALOG_PAGE_SIZE,
  type DocumentBadgeFilter,
  type DocumentCategoryFilter,
} from '../constants/documentsCatalog';
import { DOCUMENTS_CATALOG_BODY, DOCUMENTS_CATALOG_PANEL } from '../constants/documentsLayout';

interface DocumentsCatalogSectionProps {
  items: DocumentServiceCatalogItem[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: DocumentCategoryFilter;
  onCategoryFilterChange: (value: DocumentCategoryFilter) => void;
  badgeFilter: DocumentBadgeFilter;
  onBadgeFilterChange: (value: DocumentBadgeFilter) => void;
  loading?: boolean;
  onViewDocument: (id: string) => void;
}

const DocumentsCatalogSection: FunctionComponent<DocumentsCatalogSectionProps> = ({
  items,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  badgeFilter,
  onBadgeFilterChange,
  loading = false,
  onViewDocument,
}) => {
  const { t } = useTranslation();
  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } = useAdminPagination(
    items,
    DOCUMENT_CATALOG_PAGE_SIZE,
  );

  return (
    <section className={DOCUMENTS_CATALOG_PANEL} aria-labelledby="documents-catalog-heading">
      <div className="admin-ann-feed__hero">
        <div className="admin-ann-feed__hero-top">
          <div className="admin-ann-feed__title-block">
            <span className="admin-ann-feed__icon-wrap" aria-hidden>
              <FileText className="h-[1.125rem] w-[1.125rem] text-[var(--admin-brand)]" />
            </span>
            <div className="admin-ann-feed__titles">
              <div className="admin-ann-feed__title-row">
                <h2 id="documents-catalog-heading" className="admin-ann-feed__title">
                  {t('student.documents.catalogTitle')}
                </h2>
                <span className="admin-ann-feed__count">{totalItems}</span>
              </div>
              <p className="admin-ann-feed__subtitle">{t('student.documents.catalogSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="admin-ann-feed__toolbar">
          <DocumentsCatalogToolbar
            search={search}
            onSearchChange={onSearchChange}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={onCategoryFilterChange}
            badgeFilter={badgeFilter}
            onBadgeFilterChange={onBadgeFilterChange}
          />
        </div>
      </div>

      <div className={DOCUMENTS_CATALOG_BODY}>
        {loading ? (
          <div className="admin-doc-svc-grid admin-doc-svc-grid--loading w-full min-w-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-doc-svc-card admin-doc-svc-card--skeleton" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <StudentSearchEmptyState title={t('student.documents.noSearchResults')} />
        ) : (
          <>
            <div className="admin-doc-svc-grid w-full min-w-0">
              {paginatedItems.map((item) => (
                <DocumentCatalogCard
                  key={item.id}
                  item={item}
                  onView={onViewDocument}
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
      </div>
    </section>
  );
};

export default DocumentsCatalogSection;
