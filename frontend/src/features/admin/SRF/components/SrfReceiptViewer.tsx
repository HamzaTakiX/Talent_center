import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

interface SrfReceiptViewerProps {
  fileUrl: string;
  className?: string;
}

const SrfReceiptViewer: FunctionComponent<SrfReceiptViewerProps> = ({ fileUrl, className = '' }) => {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const isPdf = /\.pdf($|\?)/i.test(fileUrl);

  const shellClass = fullscreen
    ? 'fixed inset-0 z-[60] flex flex-col bg-[var(--admin-bg-elevated)] p-4'
    : `flex flex-col rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] overflow-hidden ${className}`;

  return (
    <div className={shellClass}>
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--admin-border)] px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">
          {t('admin.modules.srf.validation.receiptPreview')}
        </span>
        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg border border-[var(--admin-border)] p-2 hover:bg-[var(--admin-bg-elevated)]"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            aria-label={t('admin.modules.srf.validation.zoomOut')}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--admin-border)] p-2 hover:bg-[var(--admin-bg-elevated)]"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            aria-label={t('admin.modules.srf.validation.zoomIn')}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--admin-border)] p-2 hover:bg-[var(--admin-bg-elevated)]"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={
              fullscreen
                ? t('admin.modules.srf.validation.exitFullscreen')
                : t('admin.modules.srf.validation.fullscreen')
            }
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[var(--admin-border)] p-2 hover:bg-[var(--admin-bg-elevated)]"
            aria-label={t('admin.modules.srf.validation.download')}
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="flex-1 min-h-[280px] max-h-[70vh] overflow-auto p-4 flex items-center justify-center">
        {isPdf ? (
          <iframe
            title={t('admin.modules.srf.validation.receiptPreview')}
            src={fileUrl}
            className="h-full min-h-[360px] w-full rounded-lg bg-white"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          />
        ) : (
          <img
            src={fileUrl}
            alt={t('admin.modules.srf.validation.receiptPreview')}
            className="max-w-full object-contain transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        )}
      </div>
    </div>
  );
};

export default SrfReceiptViewer;
