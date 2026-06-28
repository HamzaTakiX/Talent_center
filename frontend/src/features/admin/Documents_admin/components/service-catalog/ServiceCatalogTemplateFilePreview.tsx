import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import type { ServiceCatalogTemplatePreviewSource } from './buildServiceCatalogTemplatePreview';

interface Props {
  source: ServiceCatalogTemplatePreviewSource;
  fileName: string;
  embedded?: boolean;
}

const ServiceCatalogTemplateFilePreview: FunctionComponent<Props> = ({ source, fileName, embedded = false }) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio.template';
  const containerRef = useRef<HTMLDivElement>(null);
  const renderGenRef = useRef(0);
  const [loading, setLoading] = useState(source.kind === 'pdf');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (source.kind !== 'pdf') return;

    let cancelled = false;
    let resizeTimer: number | null = null;
    const container = containerRef.current;
    if (!container) return;

    const renderFirstPage = async (width: number, showLoading: boolean) => {
      const generation = ++renderGenRef.current;
      if (showLoading) setLoading(true);
      setError(false);

      try {
        const pdfjs = await import('pdfjs-dist');
        if (cancelled || generation !== renderGenRef.current) return;

        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const pdf = await pdfjs.getDocument({ url: source.objectUrl }).promise;
        if (cancelled || generation !== renderGenRef.current) return;

        container.replaceChildren();
        const page = await pdf.getPage(1);
        if (cancelled || generation !== renderGenRef.current) return;

        const renderWidth = Math.max(width - 24, 220);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = renderWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = 'admin-doc-studio-template__preview-canvas';

        const pageWrap = document.createElement('div');
        pageWrap.className = 'admin-doc-studio-template__preview-page';
        pageWrap.appendChild(canvas);
        container.appendChild(pageWrap);

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        if (!cancelled && generation === renderGenRef.current) {
          setLoading(false);
        }
      } catch {
        if (!cancelled && generation === renderGenRef.current) {
          setError(true);
          setLoading(false);
        }
      }
    };

    const scheduleRender = (showLoading: boolean) => {
      const width = container.clientWidth || container.parentElement?.clientWidth || 560;
      void renderFirstPage(width, showLoading);
    };

    scheduleRender(true);

    const observer = new ResizeObserver(() => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => scheduleRender(false), 150);
    });
    observer.observe(container);

    return () => {
      cancelled = true;
      renderGenRef.current += 1;
      observer.disconnect();
      if (resizeTimer) window.clearTimeout(resizeTimer);
      container.replaceChildren();
    };
  }, [source]);

  if (source.kind === 'docx') {
    return (
      <div
        className={`admin-doc-studio-template__preview-frame ${embedded ? 'is-embedded' : ''}`}
        aria-label={fileName}
      >
        {!embedded ? (
          <p className="admin-doc-studio-template__preview-label">{t(`${P}.previewLabel`)}</p>
        ) : null}
        <div
          className="admin-doc-studio-template__preview-docx"
          dangerouslySetInnerHTML={{ __html: source.html }}
        />
      </div>
    );
  }

  return (
    <div
      className={`admin-doc-studio-template__preview-frame ${embedded ? 'is-embedded' : ''}`}
      aria-busy={loading}
      aria-label={fileName}
    >
      {!embedded ? (
        <p className="admin-doc-studio-template__preview-label">{t(`${P}.previewFirstPage`)}</p>
      ) : null}
      {loading ? (
        <div className="admin-doc-studio-template__preview-loading">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>{t(`${P}.previewLoading`)}</span>
        </div>
      ) : null}
      {error ? (
        <p className="admin-doc-studio-template__preview-error" role="alert">
          {t(`${P}.previewError`)}
        </p>
      ) : null}
      <div
        ref={containerRef}
        className={`admin-doc-studio-template__preview-pdf ${loading ? 'is-loading' : ''}`}
      />
    </div>
  );
};

export default ServiceCatalogTemplateFilePreview;
