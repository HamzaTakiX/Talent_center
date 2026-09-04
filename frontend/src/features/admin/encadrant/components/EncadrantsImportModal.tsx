import { ChangeEvent, DragEvent, FunctionComponent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminEncadrantsApi } from '../../api/encadrants';
import type { AdminBulkImportResult } from '../../api/types';
import { easePremium } from '../../dashboard/ui/animations';
import AdminModal from '../../ui/AdminModal';

const IMPORT_PREFIX = 'admin.modules.encadrants.import';

const TEMPLATE_CSV = [
  'email,full_name,filiere_codes,level_codes,academic_years,supervised_internship_type_codes,max_students,grant_access,is_active,specialization_domain_codes',
  'supervisor1@groupe-esca.ma,Jean Dupont,pge,"y4,y5",2025-2026,,15,false,true,',
  'supervisor2@groupe-esca.ma,Marie Martin,"pge,lme",,2025-2026,,20,false,true,',
].join('\n');

interface EncadrantsImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const EncadrantsImportModal: FunctionComponent<EncadrantsImportModalProps> = ({
  open,
  onClose,
  onImported,
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AdminBulkImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setError('');
    setResult(null);
    setDragging(false);
    setFileInputKey((k) => k + 1);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const acceptFile = (next: File | null) => {
    setError('');
    setResult(null);
    setFile(next);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (dropped) acceptFile(dropped);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'encadrants_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) {
      setError(t(`${IMPORT_PREFIX}.errors.noFile`));
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await adminEncadrantsApi.importFromFile(file);
      setResult(data);
      if (data.success_rows > 0) {
        onImported();
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || t(`${IMPORT_PREFIX}.errors.generic`));
    } finally {
      setLoading(false);
    }
  };

  const closeLabel = result
    ? t(`${IMPORT_PREFIX}.actions.close`)
    : t(`${IMPORT_PREFIX}.actions.cancel`);

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title={t(`${IMPORT_PREFIX}.title`)}
      description={t(`${IMPORT_PREFIX}.description`)}
      maxWidthClass="max-w-[520px]"
      closeAriaLabel={t('common.close')}
      headerIcon={Upload}
      headerIconColor="var(--admin-brand)"
      headerIconBg="color-mix(in srgb, var(--admin-brand) 14%, var(--admin-bg-elevated))"
      modalClassName="admin-import-modal"
      bodyClassName="admin-import-modal__body"
      footer={
        <div className="admin-import-modal__footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="admin-module-toolbar__btn"
          >
            <X className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{closeLabel}</span>
          </button>
          {!result ? (
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={loading || !file}
              className="admin-module-toolbar__btn admin-import-modal__btn-primary"
              aria-busy={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              )}
              <span>
                {loading
                  ? t(`${IMPORT_PREFIX}.actions.importing`, { defaultValue: 'Importing…' })
                  : t(`${IMPORT_PREFIX}.actions.import`)}
              </span>
            </button>
          ) : null}
        </div>
      }
    >
      <div className="admin-import-modal__content">
        <motion.div
          className="admin-import-modal__hero"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easePremium }}
        >
          <p className="admin-import-modal__hint">{t(`${IMPORT_PREFIX}.hint`)}</p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="admin-import-modal__template-btn"
          >
            <Download className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{t(`${IMPORT_PREFIX}.downloadTemplate`)}</span>
          </button>
        </motion.div>

        <motion.label
          htmlFor={`encadrants-import-file-${fileInputKey}`}
          className={[
            'admin-import-modal__dropzone',
            dragging ? 'admin-import-modal__dropzone--dragging' : '',
            file ? 'admin-import-modal__dropzone--ready' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: easePremium, delay: 0.06 }}
        >
          <span className="admin-import-modal__dropzone-icon" aria-hidden>
            {file ? (
              <FileSpreadsheet className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Upload className="h-5 w-5" strokeWidth={1.75} />
            )}
          </span>
          <span className="admin-import-modal__dropzone-copy">
            <span className="admin-import-modal__dropzone-title">
              {file
                ? file.name
                : t(`${IMPORT_PREFIX}.dropzoneTitle`, {
                    defaultValue: 'Drop your CSV or Excel file here',
                  })}
            </span>
            <span className="admin-import-modal__dropzone-sub">
              {file
                ? t(`${IMPORT_PREFIX}.dropzoneChange`, {
                    defaultValue: 'Click or drop another file to replace',
                  })
                : t(`${IMPORT_PREFIX}.fileLabel`)}
            </span>
          </span>
          <input
            id={`encadrants-import-file-${fileInputKey}`}
            key={fileInputKey}
            type="file"
            className="sr-only"
            accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={handleFileChange}
          />
        </motion.label>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              className="admin-import-modal__alert admin-import-modal__alert--error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              role="alert"
            >
              <XCircle className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span>{error}</span>
            </motion.div>
          ) : null}

          {result ? (
            <motion.div
              key="result"
              className="admin-import-modal__result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: easePremium }}
            >
              <div className="admin-import-modal__stats">
                <div className="admin-import-modal__stat admin-import-modal__stat--success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  <div>
                    <strong>{result.success_rows}</strong>
                    <span>
                      {t(`${IMPORT_PREFIX}.result.successLabel`, { defaultValue: 'Created' })}
                    </span>
                  </div>
                </div>
                <div className="admin-import-modal__stat">
                  <FileSpreadsheet className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  <div>
                    <strong>{result.total_rows}</strong>
                    <span>
                      {t(`${IMPORT_PREFIX}.result.totalLabel`, { defaultValue: 'Total rows' })}
                    </span>
                  </div>
                </div>
                <div className="admin-import-modal__stat admin-import-modal__stat--error">
                  <XCircle className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  <div>
                    <strong>{result.error_rows}</strong>
                    <span>
                      {t(`${IMPORT_PREFIX}.result.errorsLabel`, { defaultValue: 'Errors' })}
                    </span>
                  </div>
                </div>
              </div>

              <p className="admin-import-modal__result-summary">
                {t(`${IMPORT_PREFIX}.result.summary`, {
                  success: result.success_rows,
                  total: result.total_rows,
                  errors: result.error_rows,
                })}
              </p>

              {result.errors.length > 0 ? (
                <ul className="admin-import-modal__errors">
                  {result.errors.slice(0, 20).map((err) => (
                    <li key={`${err.row}-${err.email}`}>
                      {t(`${IMPORT_PREFIX}.result.rowError`, {
                        row: err.row,
                        email: err.email || '—',
                        message: err.message,
                      })}
                    </li>
                  ))}
                  {result.errors.length > 20 ? (
                    <li>
                      {t(`${IMPORT_PREFIX}.result.moreErrors`, {
                        count: result.errors.length - 20,
                      })}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </AdminModal>
  );
};

export default EncadrantsImportModal;
