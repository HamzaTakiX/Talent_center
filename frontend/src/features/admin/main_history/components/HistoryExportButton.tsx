import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2 } from 'lucide-react';
import { adminHistoryApi } from '../../api/history';
import type { HistoryListParams } from '../../api/history';

const PREFIX = 'admin.auditCenter';

interface HistoryExportButtonProps {
  filters: HistoryListParams;
}

const HistoryExportButton: FunctionComponent<HistoryExportButtonProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await adminHistoryApi.exportCsv(filters as Record<string, unknown>);
      if (result.download_url) {
        window.open(result.download_url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // silent — mock mode
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void handleExport()}
      className="admin-module-toolbar__btn shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--admin-brand)]" aria-hidden />
      ) : (
        <Download className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      )}
      <span>{loading ? t(`${PREFIX}.exporting`) : t(`${PREFIX}.exportCsv`)}</span>
    </button>
  );
};

export default HistoryExportButton;
