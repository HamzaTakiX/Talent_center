import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { workspaceDocumentsApi } from '../../../../shared/workspace-documents';
import type { WorkspaceDocument } from '../../../../shared/workspace-documents';

function readApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return '';
}

export function useWorkspaceDocuments(studentProfileId?: number) {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const reload = useCallback(async () => {
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

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: WorkspaceDocument[] = [];
      for (const file of list) {
        uploaded.push(await workspaceDocumentsApi.upload(file));
      }
      setDocuments((current) => [...uploaded, ...current]);
    } catch (err) {
      setError(readApiError(err) || 'upload');
    } finally {
      setUploading(false);
    }
  }, []);

  const replaceDocument = useCallback((next: WorkspaceDocument) => {
    setDocuments((current) => current.map((doc) => (doc.id === next.id ? next : doc)));
  }, []);

  return {
    documents,
    loading,
    error,
    uploading,
    reload,
    uploadFiles,
    replaceDocument,
    setError,
  };
}

export type UseWorkspaceDocumentsResult = ReturnType<typeof useWorkspaceDocuments>;
