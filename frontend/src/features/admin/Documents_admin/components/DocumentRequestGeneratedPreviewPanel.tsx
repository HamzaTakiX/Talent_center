import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Download, FileText, FileType2, Loader2 } from 'lucide-react';
import ServiceCatalogTemplateFilePreview from './service-catalog/ServiceCatalogTemplateFilePreview';
import DocumentRequestDetailPanel from './DocumentRequestDetailPanel';
import {
  documentRequestHasFilePreview,
  useDocumentRequestFilePreview,
} from '../hooks/useDocumentRequestFilePreview';
import type { DocumentRequestDetail } from '../types';

interface DocumentRequestGeneratedPreviewPanelProps {
  data: DocumentRequestDetail;
}

const DocumentRequestGeneratedPreviewPanel: FunctionComponent<DocumentRequestGeneratedPreviewPanelProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const { enabled, isGenerated, preview, loading, error, fileName } = useDocumentRequestFilePreview(data);

  if (!documentRequestHasFilePreview(data)) {
    return null;
  }

  const latestOutput = data.generatedOutputs.find((output) => output.fileUrl) ?? data.generatedOutputs[0];
  const downloadUrl = latestOutput?.fileUrl ?? data.templatePreview?.fileUrl ?? undefined;
  const title = isGenerated
    ? t('admin.documentsModule.detail.generatedPreview')
    : t('admin.documentsModule.detail.templatePreview');
  const subtitle = isGenerated
    ? t('admin.documentsModule.detail.generatedPreviewHint')
    : t('admin.documentsModule.detail.templatePreviewHint');

  return (
    <DocumentRequestDetailPanel title={title} icon={FileText} accent="brand">
      <div className="admin-doc-detail-preview" aria-labelledby="admin-doc-detail-preview-title">
        <p id="admin-doc-detail-preview-title" className="admin-doc-detail-preview__subtitle">
          {subtitle}
        </p>

        <div className="admin-doc-detail-preview__toolbar">
          <div className="admin-doc-detail-preview__file" aria-label={fileName}>
            <FileType2 className="h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 truncate font-medium">{fileName}</span>
            {isGenerated && latestOutput?.signed ? (
              <span className="admin-doc-detail-chip admin-doc-detail-chip--success">
                {t('admin.documentsModule.detail.signedOutput')}
              </span>
            ) : null}
          </div>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              className="admin-doc-detail-preview__download"
              download={fileName}
              target="_blank"
              rel="noreferrer"
            >
              <Download className="h-4 w-4" aria-hidden />
              {t('admin.documentsModule.detail.downloadFile')}
            </a>
          ) : null}
        </div>

        <div className="admin-doc-detail-preview__frame" aria-busy={loading}>
          {!enabled ? (
            <p className="admin-doc-detail-empty-inline">{t('admin.documentsModule.detail.noOutputs')}</p>
          ) : loading ? (
            <div className="admin-doc-detail-preview__state">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              <span>{t('admin.documentsModule.detail.previewLoading')}</span>
            </div>
          ) : error ? (
            <div className="admin-doc-detail-preview__state admin-doc-detail-preview__state--error" role="alert">
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
              <span>{t('admin.documentsModule.detail.previewError')}</span>
            </div>
          ) : preview ? (
            <ServiceCatalogTemplateFilePreview source={preview} fileName={fileName} embedded />
          ) : null}
        </div>
      </div>
    </DocumentRequestDetailPanel>
  );
};

export default DocumentRequestGeneratedPreviewPanel;
