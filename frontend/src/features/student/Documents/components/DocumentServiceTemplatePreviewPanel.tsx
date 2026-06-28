import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { FileType2, Loader2, Sparkles } from 'lucide-react';

import ServiceCatalogTemplateFilePreview from '../../../admin/Documents_admin/components/service-catalog/ServiceCatalogTemplateFilePreview';

import type { ServiceCatalogTemplatePreviewSource } from '../../../admin/Documents_admin/components/service-catalog/buildServiceCatalogTemplatePreview';

import DocumentDetailMessageBanner from './DocumentDetailMessageBanner';



interface DocumentServiceTemplatePreviewPanelProps {

  fileName: string;

  preview: ServiceCatalogTemplatePreviewSource | null;

  loading: boolean;

  error: boolean;

}



const DocumentServiceTemplatePreviewPanel: FunctionComponent<

  DocumentServiceTemplatePreviewPanelProps

> = ({ fileName, preview, loading, error }) => {

  const { t } = useTranslation();

  const P = 'student.documents.detail.preview';



  return (

    <aside className="student-document-detail-page__preview-panel" aria-labelledby="doc-detail-preview-title">

      <header className="student-document-detail-page__preview-header">

        <span className="student-document-detail-page__preview-badge" aria-hidden>

          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />

        </span>

        <div className="min-w-0 flex-1">

          <h2 id="doc-detail-preview-title" className="student-document-detail-page__preview-title">

            {t(`${P}.title`)}

          </h2>

          <p className="student-document-detail-page__preview-subtitle">{t(`${P}.subtitle`)}</p>

        </div>

      </header>



      <div className="student-document-detail-page__preview-file" aria-label={fileName}>

        <FileType2 className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />

        <span className="min-w-0 truncate font-medium">{fileName}</span>

      </div>



      <div className="student-document-detail-page__preview-frame" aria-busy={loading}>

        {loading ? (

          <div className="student-document-detail-page__preview-state">

            <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-brand)]" aria-hidden />

            <span>{t(`${P}.loading`)}</span>

          </div>

        ) : error ? (

          <DocumentDetailMessageBanner variant="danger" compact title={t('student.documents.feedback.previewErrorTitle')}>

            {t(`${P}.error`)}

          </DocumentDetailMessageBanner>

        ) : preview ? (

          <ServiceCatalogTemplateFilePreview source={preview} fileName={fileName} embedded />

        ) : null}

      </div>



      <DocumentDetailMessageBanner variant="info" compact icon={Sparkles}>

        {t(`${P}.hint`)}

      </DocumentDetailMessageBanner>

    </aside>

  );

};



export default DocumentServiceTemplatePreviewPanel;

