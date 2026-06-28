import { useCallback, useState } from 'react';
import type { AxiosError } from 'axios';
import { stageApi } from '../../../../shared/api/stageApi';
import { mapOfferImportPreview, type MappedOfferImportPreview } from '../utils/mapOfferImportPreview';

export type ExtractedOfferData = MappedOfferImportPreview;

function normalizeUrlInput(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function extractApiError(err: unknown): string {
  const ax = err as AxiosError<{
    message?: string;
    errors?: Record<string, string[] | string>;
  }>;
  const sourceErrors = ax.response?.data?.errors?.source_url;
  if (Array.isArray(sourceErrors) && sourceErrors.length > 0) {
    return sourceErrors[0];
  }
  if (typeof sourceErrors === 'string' && sourceErrors.trim()) {
    return sourceErrors;
  }
  return ax.response?.data?.message || ax.message || 'Impossible d\'extraire l\'offre depuis cette URL.';
}

export function useSimulatorOfferImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractFromUrl = useCallback(async (url: string): Promise<ExtractedOfferData> => {
    const normalizedUrl = normalizeUrlInput(url);
    if (!normalizedUrl) {
      throw new Error('URL requise');
    }

    setLoading(true);
    setError(null);

    try {
      const preview = await stageApi.previewOfferImport(normalizedUrl);
      return mapOfferImportPreview(preview);
    } catch (err) {
      const message = extractApiError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, extractFromUrl };
}
