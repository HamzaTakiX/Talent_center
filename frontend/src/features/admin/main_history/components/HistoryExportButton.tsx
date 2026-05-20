import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
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
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-sm font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-row-hover)] disabled:opacity-60"
    >
      <Download className="h-4 w-4" aria-hidden />
      {loading ? t(`${PREFIX}.exporting`) : t(`${PREFIX}.exportCsv`)}
    </button>
  );
};

export default HistoryExportButton;
