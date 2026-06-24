import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CvPdfPreviewProps {
  src: string;
  title: string;
}

const CvPdfPreview: FunctionComponent<CvPdfPreviewProps> = ({ src, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderGenRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (useFallback) return;

    let cancelled = false;
    let resizeTimer: number | null = null;
    const container = containerRef.current;
    if (!container) return;

    const renderPdf = async (width: number, showLoading: boolean) => {
      const generation = ++renderGenRef.current;
      if (showLoading) setLoading(true);

      try {
        const pdfjs = await import('pdfjs-dist');
        if (cancelled || generation !== renderGenRef.current) return;

        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const task = pdfjs.getDocument(
          src.startsWith('blob:')
            ? { url: src }
            : { url: src, withCredentials: true },
        );
        const pdf = await task.promise;
        if (cancelled || generation !== renderGenRef.current) return;

        container.replaceChildren();
        const renderWidth = Math.max(width - 24, 220);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled || generation !== renderGenRef.current) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const scale = renderWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'sr-cva-cv-preview__pdf-page';

          const pageWrap = document.createElement('div');
          pageWrap.className = 'sr-cva-cv-preview__pdf-page-wrap';
          pageWrap.appendChild(canvas);
          container.appendChild(pageWrap);

          await page.render({ canvas, canvasContext: context, viewport }).promise;
        }

        if (!cancelled && generation === renderGenRef.current) {
          setLoading(false);
        }
      } catch {
        if (!cancelled && generation === renderGenRef.current) {
          setUseFallback(true);
          setLoading(false);
        }
      }
    };

    const scheduleRender = (showLoading: boolean) => {
      const width = container.clientWidth || container.parentElement?.clientWidth || 672;
      void renderPdf(width, showLoading);
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
  }, [src, useFallback]);

  if (useFallback) {
    return (
      <iframe
        title={title}
        src={`${src}#toolbar=0&navpanes=0&view=FitH`}
        className="sr-cva-cv-preview__iframe sr-cva-cv-preview__iframe--fallback"
      />
    );
  }

  return (
    <div className="sr-cva-cv-preview__pdf-shell" aria-busy={loading} aria-label={title}>
      {loading ? (
        <div className="sr-cva-cv-preview__pdf-loading">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      ) : null}
      <div ref={containerRef} className="sr-cva-cv-preview__pdf-pages" />
    </div>
  );
};

export default CvPdfPreview;
