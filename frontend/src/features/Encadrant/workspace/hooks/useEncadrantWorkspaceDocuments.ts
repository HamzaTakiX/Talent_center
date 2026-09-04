import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { workspaceDocumentsApi } from '../../../shared/workspace-documents';
import type { WorkspaceDocument, WorkspaceDocumentReviewPayload } from '../../../shared/workspace-documents';

function readApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return '';
}

export function useEncadrantWorkspaceDocuments(studentProfileId?: number) {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(Boolean(studentProfileId));
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    if (!studentProfileId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await workspaceDocumentsApi.list(studentProfileId);
      setDocuments(items);
    } catch (err) {
      setError(readApiError(err) || 'load');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [studentProfileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveReview = useCallback(
    async (documentId: number, payload: WorkspaceDocumentReviewPayload) => {
      setSavingId(documentId);
      setError(null);
      try {
        const next = await workspaceDocumentsApi.review(documentId, payload);
        setDocuments((current) => current.map((doc) => (doc.id === next.id ? next : doc)));
        return next;
      } catch (err) {
        setError(readApiError(err) || 'review');
        throw err;
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  const markViewed = useCallback(async (documentId: number) => {
    try {
      const next = await workspaceDocumentsApi.markViewed(documentId);
      setDocuments((current) => current.map((doc) => (doc.id === next.id ? next : doc)));
    } catch {
      /* viewing is best-effort */
    }
  }, []);

  return {
    documents,
    loading,
    error,
    savingId,
    reload,
    saveReview,
    markViewed,
  };
}
