import { ChangeEvent, FunctionComponent, useState } from 'react';
import { Download, Loader2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminAdministratorsApi } from '../../api/administrators';
import type { AdminBulkImportResult } from '../../api/types';
import AdminModal from '../../ui/AdminModal';
import { AdminFormFileInput } from '../../shared/forms/AdminFormPrimitives';

const IMPORT_PREFIX = 'admin.modules.administrators.import';

const TEMPLATE_CSV = [
  'email,full_name,role_slugs,filiere_codes,grant_access,sso_enabled',
  'admin1@example.com,Jean Dupont,stage,,false,false',
  'admin2@example.com,Marie Martin,"stage,finance",pge,false,false',
].join('\n');

interface AdministratorsImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const AdministratorsImportModal: FunctionComponent<AdministratorsImportModalProps> = ({
  open,
  onClose,
  onImported,
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AdminBulkImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setError('');
    setResult(null);
    setFileInputKey((k) => k + 1);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setResult(null);
    setFile(e.target.files?.[0] ?? null);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'administrators_import_template.csv';
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
      const data = await adminAdministratorsApi.importFromFile(file);
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

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title={t(`${IMPORT_PREFIX}.title`)}
      description={t(`${IMPORT_PREFIX}.description`)}
      maxWidthClass="max-w-lg"
      closeAriaLabel={t('common.close')}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] disabled:opacity-50"
          >
            {result ? t(`${IMPORT_PREFIX}.actions.close`) : t(`${IMPORT_PREFIX}.actions.cancel`)}
          </button>
          {!result ? (
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || !file}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4" aria-hidden />
              )}
              {t(`${IMPORT_PREFIX}.actions.import`)}
            </button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4 text-sm text-[var(--admin-text-secondary)]">
        <p>{t(`${IMPORT_PREFIX}.hint`)}</p>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--admin-accent)] hover:underline"
        >
          <Download className="h-4 w-4" aria-hidden />
          {t(`${IMPORT_PREFIX}.downloadTemplate`)}
        </button>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--admin-text)]">
            {t(`${IMPORT_PREFIX}.fileLabel`)}
          </label>
          <AdminFormFileInput
            key={fileInputKey}
            accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={handleFileChange}
          />
          {file ? (
            <p className="mt-2 text-xs text-[var(--admin-text-secondary)]">{file.name}</p>
          ) : null}
        </div>
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        ) : null}
        {result ? (
          <div className="space-y-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            <p className="font-medium text-[var(--admin-text)]">
              {t(`${IMPORT_PREFIX}.result.summary`, {
                success: result.success_rows,
                total: result.total_rows,
                errors: result.error_rows,
              })}
            </p>
            {result.errors.length > 0 ? (
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-red-400">
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
                  <li>{t(`${IMPORT_PREFIX}.result.moreErrors`, { count: result.errors.length - 20 })}</li>
                ) : null}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </AdminModal>
  );
};

export default AdministratorsImportModal;
