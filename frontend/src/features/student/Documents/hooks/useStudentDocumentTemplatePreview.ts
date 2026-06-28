import { useEffect, useState } from 'react';
import {
  buildServiceCatalogTemplatePreviewFromBlob,
  revokeServiceCatalogTemplatePreview,
  type ServiceCatalogTemplatePreviewSource,
} from '../../../admin/Documents_admin/components/service-catalog/buildServiceCatalogTemplatePreview';
import { templateHasStoredFile } from '../../../admin/Documents_admin/components/service-catalog/fetchCatalogTemplateBlob';
import type { DocumentServiceCatalogItem } from '../../../admin/Documents_admin/types/documentServiceCatalog';
import { fetchStudentDocumentTemplateBlob } from '../utils/fetchStudentDocumentTemplateBlob';

export function documentHasTemplatePreview(item: DocumentServiceCatalogItem): boolean {
  const autoEnabled = item.autoGenerate || item.config.availability.autoGenerateEnabled;
  return autoEnabled && templateHasStoredFile(item.config.template);
}

export function useStudentDocumentTemplatePreview(item: DocumentServiceCatalogItem | null) {
  const [preview, setPreview] = useState<ServiceCatalogTemplatePreviewSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const enabled = item ? documentHasTemplatePreview(item) : false;
  const fileName = item?.config.template?.fileName ?? 'template';
  const fileUrl = item?.config.template?.fileUrl;

  useEffect(() => {
    if (!enabled || !fileUrl) {
      setPreview(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      try {
        const blob = await fetchStudentDocumentTemplateBlob(fileUrl);
        if (cancelled) return;

        const nextPreview = await buildServiceCatalogTemplatePreviewFromBlob(blob, fileName);
        if (cancelled) return;

        setPreview((current) => {
          revokeServiceCatalogTemplatePreview(current);
          return nextPreview;
        });
      } catch {
        if (!cancelled) {
          setError(true);
          setPreview(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      setPreview((current) => {
        revokeServiceCatalogTemplatePreview(current);
        return null;
      });
    };
  }, [enabled, fileName, fileUrl]);

  return { enabled, preview, loading, error, fileName };
}
