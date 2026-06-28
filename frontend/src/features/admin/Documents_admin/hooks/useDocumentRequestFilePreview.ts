import { useEffect, useMemo, useState } from 'react';
import {
  buildServiceCatalogTemplatePreviewFromBlob,
  revokeServiceCatalogTemplatePreview,
  type ServiceCatalogTemplatePreviewSource,
} from '../components/service-catalog/buildServiceCatalogTemplatePreview';
import { fetchCatalogTemplateBlob } from '../components/service-catalog/fetchCatalogTemplateBlob';
import type { DocumentRequestDetail } from '../types';

async function fetchAuthenticatedBlob(fileUrl: string): Promise<Blob> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(fileUrl, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error('fetch failed');
  }
  return response.blob();
}

export function documentRequestHasFilePreview(detail: DocumentRequestDetail): boolean {
  const hasOutput = detail.generatedOutputs.some((output) => output.fileUrl);
  const hasTemplate =
    Boolean(detail.autoGenerateEnabled) &&
    Boolean(detail.templatePreview?.fileUrl || detail.templatePreview?.templateId);
  return hasOutput || hasTemplate;
}

export function useDocumentRequestFilePreview(detail: DocumentRequestDetail | null) {
  const sourceMeta = useMemo(() => {
    if (!detail) return null;

    const output = detail.generatedOutputs.find((item) => item.fileUrl) ?? detail.generatedOutputs[0];
    if (output?.fileUrl) {
      return {
        kind: 'generated' as const,
        fileName: output.fileName ?? `document.${output.format}`,
        fileUrl: output.fileUrl,
        serviceId: undefined as string | undefined,
      };
    }

    const template = detail.templatePreview;
    if (detail.autoGenerateEnabled && template && (template.fileUrl || template.templateId)) {
      return {
        kind: 'template' as const,
        fileName: template.fileName ?? 'template',
        fileUrl: template.fileUrl ?? undefined,
        serviceId: detail.documentTypeId,
      };
    }

    return null;
  }, [detail]);

  const [preview, setPreview] = useState<ServiceCatalogTemplatePreviewSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sourceMeta?.fileUrl && !sourceMeta?.serviceId) {
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
        const blob =
          sourceMeta.kind === 'template'
            ? await fetchCatalogTemplateBlob({
                serviceId: sourceMeta.serviceId,
                fileUrl: sourceMeta.fileUrl,
              })
            : await fetchAuthenticatedBlob(sourceMeta.fileUrl!);

        if (cancelled) return;

        const nextPreview = await buildServiceCatalogTemplatePreviewFromBlob(blob, sourceMeta.fileName);
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
  }, [sourceMeta?.fileName, sourceMeta?.fileUrl, sourceMeta?.kind, sourceMeta?.serviceId]);

  return {
    enabled: Boolean(sourceMeta),
    isGenerated: sourceMeta?.kind === 'generated',
    preview,
    loading,
    error,
    fileName: sourceMeta?.fileName ?? 'document',
  };
}
