import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Braces,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  FileType2,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { adminDocumentsApi } from '../../../api/documents';
import type { DocumentServiceConfig } from '../../types/documentServiceCatalog';
import { TEMPLATE_PLACEHOLDERS } from './serviceCatalogStudioSteps';
import ServiceCatalogTemplateFilePreview from './ServiceCatalogTemplateFilePreview';
import {
  buildServiceCatalogTemplatePreview,
  buildServiceCatalogTemplatePreviewFromBlob,
  revokeServiceCatalogTemplatePreview,
  type ServiceCatalogTemplatePreviewSource,
} from './buildServiceCatalogTemplatePreview';
import { fetchCatalogTemplateBlob, templateHasStoredFile } from './fetchCatalogTemplateBlob';

interface Props {
  template: DocumentServiceConfig['template'];
  serviceId?: string;
  onChange: (template: NonNullable<DocumentServiceConfig['template']>) => void;
  onPendingFileChange?: (file: File | null) => void;
}

const ACCEPTED = '.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_SIZE = 10 * 1024 * 1024;

function detectPlaceholders(fileName: string): string[] {
  if (fileName.endsWith('.pdf')) {
    return [...TEMPLATE_PLACEHOLDERS.slice(0, 4)];
  }
  return [...TEMPLATE_PLACEHOLDERS];
}

const ServiceCatalogTemplateUpload: FunctionComponent<Props> = ({
  template,
  serviceId,
  onChange,
  onPendingFileChange,
}) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio.template';
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ServiceCatalogTemplatePreviewSource | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    return () => revokeServiceCatalogTemplatePreview(preview);
  }, [preview]);

  const persistTemplateFile = useCallback(
    async (file: File) => {
      onPendingFileChange?.(file);
      if (!serviceId) return;

      const updated = await adminDocumentsApi.catalogUploadTemplateFile(serviceId, file);
      const nextTemplate = updated.config?.template;
      if (nextTemplate) {
        onChange(nextTemplate);
      }
      onPendingFileChange?.(null);
    },
    [onChange, onPendingFileChange, serviceId],
  );

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'docx' && ext !== 'pdf') {
        setError(t(`${P}.errorType`));
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(t(`${P}.errorSize`));
        return;
      }

      setPreviewLoading(true);
      try {
        const nextPreview = await buildServiceCatalogTemplatePreview(file);
        setPreview((current) => {
          revokeServiceCatalogTemplatePreview(current);
          return nextPreview;
        });
        setPreviewVisible(true);

        const placeholdersFound = detectPlaceholders(file.name);
        onChange({
          fileName: file.name,
          fileType: ext as 'docx' | 'pdf',
          fileSize: file.size,
          validated: placeholdersFound.length > 0,
          placeholdersFound,
        });

        if (serviceId) {
          try {
            await persistTemplateFile(file);
          } catch {
            setError(t(`${P}.uploadPendingSave`));
          }
        } else {
          onPendingFileChange?.(file);
        }
      } catch {
        setError(t(`${P}.previewError`));
      } finally {
        setPreviewLoading(false);
      }
    },
    [onChange, onPendingFileChange, persistTemplateFile, serviceId, t],
  );

  const loadExistingPreview = useCallback(async () => {
    if (!template?.fileName || previewLoading) return;

    setPreviewLoading(true);
    setError(null);
    try {
      const blob = await fetchCatalogTemplateBlob({
        serviceId,
        fileUrl: template.fileUrl,
      });
      const nextPreview = await buildServiceCatalogTemplatePreviewFromBlob(blob, template.fileName);
      setPreview((current) => {
        revokeServiceCatalogTemplatePreview(current);
        return nextPreview;
      });
      setPreviewVisible(true);
    } catch {
      setError(t(`${P}.previewUnavailable`));
    } finally {
      setPreviewLoading(false);
    }
  }, [previewLoading, serviceId, t, template?.fileName, template?.fileUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const clear = () => {
    setPreview((current) => {
      revokeServiceCatalogTemplatePreview(current);
      return null;
    });
    setPreviewVisible(false);
    onPendingFileChange?.(null);
    onChange({});
    if (inputRef.current) inputRef.current.value = '';
  };

  const openFilePicker = () => {
    if (!previewLoading) inputRef.current?.click();
  };

  const togglePreview = async () => {
    if (previewVisible) {
      setPreviewVisible(false);
      return;
    }
    if (preview) {
      setPreviewVisible(true);
      return;
    }
    await loadExistingPreview();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canLoadRemotePreview = templateHasStoredFile(template);
  const missingStoredFile = Boolean(template?.fileName) && !templateHasStoredFile(template);
  const FileTypeIcon = template?.fileType === 'pdf' ? FileType2 : FileText;

  return (
    <div className="admin-doc-studio-template">
      <p className="admin-doc-studio-template__tip">
        <Braces className="h-4 w-4" aria-hidden />
        <span>{t(`${P}.intro`)}</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />

      {!template?.fileName ? (
        <div
          className={`admin-doc-studio-template__dropzone ${dragOver ? 'is-dragover' : ''} ${previewLoading ? 'is-busy' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={openFilePicker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openFilePicker()}
        >
          <span className="admin-doc-studio-template__dropzone-icon" aria-hidden>
            <Upload className="h-6 w-6" />
          </span>
          <p className="admin-doc-studio-template__dropzone-title">
            {previewLoading ? t(`${P}.previewLoading`) : t(`${P}.dropTitle`)}
          </p>
          <p className="admin-doc-studio-template__dropzone-hint">{t(`${P}.dropHint`)}</p>
        </div>
      ) : (
        <div className="admin-doc-studio-template__shell">
          {missingStoredFile ? (
            <p className="admin-doc-studio-template__missing-file" role="status">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>{t(`${P}.missingStoredFile`)}</span>
            </p>
          ) : null}
          <div className="admin-doc-studio-template__toolbar">
            <div className="admin-doc-studio-template__toolbar-leading">
              <span
                className={`admin-doc-studio-template__type-mark admin-doc-studio-template__type-mark--${template.fileType}`}
                aria-hidden
              >
                <FileTypeIcon className="h-4 w-4" />
              </span>
              <div className="admin-doc-studio-template__toolbar-copy">
                <p className="admin-doc-studio-template__toolbar-name" title={template.fileName}>
                  {template.fileName}
                </p>
                <div className="admin-doc-studio-template__toolbar-meta">
                  <span className="admin-doc-studio-template__meta-pill">
                    {template.fileType?.toUpperCase()}
                  </span>
                  {template.fileSize ? (
                    <span className="admin-doc-studio-template__meta-pill">
                      {formatSize(template.fileSize)}
                    </span>
                  ) : null}
                  {template.validated ? (
                    <span className="admin-doc-studio-template__meta-pill admin-doc-studio-template__meta-pill--ok">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      {t(`${P}.validatedShort`)}
                    </span>
                  ) : (
                    <span className="admin-doc-studio-template__meta-pill admin-doc-studio-template__meta-pill--warn">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {t(`${P}.notValidatedShort`)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="admin-doc-studio-template__toolbar-actions">
              <button
                type="button"
                className={`admin-doc-studio-template__action-btn ${previewVisible ? 'is-active' : ''}`}
                onClick={togglePreview}
                disabled={previewLoading || (!preview && !canLoadRemotePreview)}
                aria-label={previewVisible ? t(`${P}.hidePreview`) : t(`${P}.showPreview`)}
              >
                {previewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : previewVisible ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
                <span>{previewVisible ? t(`${P}.hidePreview`) : t(`${P}.showPreview`)}</span>
              </button>
              <button
                type="button"
                className="admin-doc-studio-template__action-btn"
                onClick={openFilePicker}
                aria-label={t(`${P}.replaceFile`)}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                <span>{t(`${P}.replaceFile`)}</span>
              </button>
              <button
                type="button"
                className="admin-doc-studio-template__action-btn admin-doc-studio-template__action-btn--danger"
                onClick={clear}
                aria-label={t(`${P}.removeFile`)}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {preview && previewVisible ? (
            <div className="admin-doc-studio-template__shell-body">
              <ServiceCatalogTemplateFilePreview
                source={preview}
                fileName={template.fileName}
                embedded
              />
            </div>
          ) : null}
        </div>
      )}

      {error && (
        <p className="admin-doc-studio-template__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default ServiceCatalogTemplateUpload;
