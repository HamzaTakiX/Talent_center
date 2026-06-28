import { FunctionComponent, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useLocation, useNavigate } from 'react-router-dom';

import StudentLayout from '../../components/StudentLayout';

import DocumentsCatalogSection from '../components/DocumentsCatalogSection';

import DocumentDetailMessageBanner from '../components/DocumentDetailMessageBanner';

import DocumentsStatsGrid from '../components/DocumentsStatsGrid';

import { DOCUMENTS_PAGE_ROOT } from '../constants/documentsLayout';

import { studentDocumentDetailPath } from '../constants/routes';

import {

  DOCUMENT_BADGE_FILTER_ALL,

  DOCUMENT_CATEGORY_ALL,

} from '../constants/documentsCatalog';

import type { DocumentBadgeFilter, DocumentCategoryFilter } from '../constants/documentsCatalog';

import { useStudentDocuments } from '../hooks/useStudentDocuments';

import { filterDocumentCatalog } from '../utils/filterDocumentCatalog';

import '../../../admin/announcements-stage/styles/admin-announcements.css';

import '../../../admin/Documents_admin/styles/admin-documents.css';



const DocumentsPage: FunctionComponent = () => {

  const { t } = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const requestSubmitted = Boolean(
    (location.state as { requestSubmitted?: boolean } | null)?.requestSubmitted,
  );

  const [search, setSearch] = useState('');

  const [categoryFilter, setCategoryFilter] = useState<DocumentCategoryFilter>(DOCUMENT_CATEGORY_ALL);

  const [badgeFilter, setBadgeFilter] = useState<DocumentBadgeFilter>(DOCUMENT_BADGE_FILTER_ALL);



  const { catalog, stats, loading, error } = useStudentDocuments();



  const filteredItems = useMemo(

    () => filterDocumentCatalog(catalog, search, categoryFilter, badgeFilter),

    [catalog, search, categoryFilter, badgeFilter],

  );



  const isInitialLoad = loading && catalog.length === 0;



  return (

    <StudentLayout>

      <div id="student-documents-root" className={DOCUMENTS_PAGE_ROOT}>

        <section aria-label={t('student.documents.statsAria')} className="min-w-0">

          <DocumentsStatsGrid stats={stats} loading={isInitialLoad} />

        </section>



        {requestSubmitted ? (
          <DocumentDetailMessageBanner variant="success" title={t('student.documents.feedback.successTitle')}>
            {t('student.documents.requestSubmitted')}
          </DocumentDetailMessageBanner>
        ) : null}



        {error ? (
          <DocumentDetailMessageBanner variant="danger" title={t('student.documents.feedback.errorTitle')}>
            {error}
          </DocumentDetailMessageBanner>
        ) : null}



        <DocumentsCatalogSection

          items={filteredItems}

          search={search}

          onSearchChange={setSearch}

          categoryFilter={categoryFilter}

          onCategoryFilterChange={setCategoryFilter}

          badgeFilter={badgeFilter}

          onBadgeFilterChange={setBadgeFilter}

          loading={isInitialLoad}

          onViewDocument={(id) => navigate(studentDocumentDetailPath(id))}

        />

      </div>

    </StudentLayout>

  );

};



export default DocumentsPage;

