import { FunctionComponent, useMemo, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import DocumentsAlertBanner from '../components/DocumentsAlertBanner';
import DocumentsCatalogSection from '../components/DocumentsCatalogSection';
import DocumentsStatsGrid from '../components/DocumentsStatsGrid';
import { documentCatalogItems } from '../data/documentsMock';
import { DOCUMENTS_PAGE_ROOT } from '../constants/documentsLayout';

const DocumentsPage: FunctionComponent = () => {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documentCatalogItems;
    return documentCatalogItems.filter((item) =>
      [item.title, item.category, item.delayLabel, item.requirement]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [search]);

  return (
    <StudentLayout headerTitle="Documents" headerSubtitle="Digital Talent Center">
      <div id="student-documents-root" className={DOCUMENTS_PAGE_ROOT}>
        <section aria-label="Document statistics" className="min-w-0">
          <DocumentsStatsGrid />
        </section>

        <DocumentsAlertBanner />

        <DocumentsCatalogSection
          items={filteredItems}
          search={search}
          onSearchChange={setSearch}
        />
      </div>
    </StudentLayout>
  );
};

export default DocumentsPage;
