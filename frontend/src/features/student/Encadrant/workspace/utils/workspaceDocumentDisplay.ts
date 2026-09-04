import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';

export function formatWorkspaceDocumentDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function openWorkspaceDocumentFile(fileUrl: string, downloadName?: string): void {
  if (!fileUrl) return;
  const resolved = resolveMediaUrl(fileUrl) ?? fileUrl;
  const link = document.createElement('a');
  link.href = resolved;
  if (downloadName) link.download = downloadName;
  link.rel = 'noopener noreferrer';
  if (!downloadName) link.target = '_blank';
  link.click();
}
