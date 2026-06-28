import { adminDocumentsApi } from '../../../api/documents';

async function isTemplateBlob(blob: Blob): Promise<boolean> {
  if (blob.size < 16) return false;

  const type = blob.type.toLowerCase();
  if (type.includes('json') || type.includes('html')) {
    return false;
  }

  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
  const isDocx = header[0] === 0x50 && header[1] === 0x4b;
  if (isPdf || isDocx) return true;

  return !type.includes('text/plain');
}

export async function fetchCatalogTemplateBlob(options: {
  serviceId?: string;
  fileUrl?: string;
}): Promise<Blob> {
  if (options.serviceId) {
    try {
      const blob = await adminDocumentsApi.catalogTemplateFile(options.serviceId);
      if (await isTemplateBlob(blob)) return blob;
    } catch {
      // try fileUrl fallback
    }
  }

  if (options.fileUrl) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(options.fileUrl, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('fetch failed');
    const blob = await response.blob();
    if (await isTemplateBlob(blob)) return blob;
  }

  throw new Error('template file unavailable');
}

export function templateHasStoredFile(
  template: { fileUrl?: string; templateId?: string } | undefined,
): boolean {
  return Boolean(template?.fileUrl || template?.templateId);
}
