import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import DocumentsAlertBanner from '../components/DocumentsAlertBanner';
import DocumentsCatalogSection from '../components/DocumentsCatalogSection';
import DocumentsStatsGrid from '../components/DocumentsStatsGrid';
import { documentCatalogItems } from '../data/documentsMock';
import { DOCUMENTS_PAGE_ROOT } from '../constants/documentsLayout';
import {
  DOCUMENT_BADGE_FILTER_ALL,
  DOCUMENT_CATEGORY_ALL,
} from '../constants/documentsCatalog';
import type { DocumentBadgeFilter, DocumentCategoryFilter } from '../constants/documentsCatalog';
import { filterDocumentCatalog } from '../utils/filterDocumentCatalog';

const DocumentsPage: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategoryFilter>(DOCUMENT_CATEGORY_ALL);
  const [badgeFilter, setBadgeFilter] = useState<DocumentBadgeFilter>(DOCUMENT_BADGE_FILTER_ALL);

  const filteredItems = useMemo(
    () => filterDocumentCatalog(documentCatalogItems, search, categoryFilter, badgeFilter, t),
    [search, categoryFilter, badgeFilter, t, i18n.language],
  );

  return (
    <StudentLayout>
      <div id="student-documents-root" className={DOCUMENTS_PAGE_ROOT}>
        <section aria-label={t('student.documents.statsAria')} className="min-w-0">
          <DocumentsStatsGrid />
        </section>

        <DocumentsAlertBanner />

        <DocumentsCatalogSection
          items={filteredItems}
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          badgeFilter={badgeFilter}
          onBadgeFilterChange={setBadgeFilter}
        />
      </div>
    </StudentLayout>
  );
};

export default DocumentsPage;
