import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';

export async function fetchStudentDocumentTemplateBlob(fileUrl: string): Promise<Blob> {
  const url = resolveMediaUrl(fileUrl);
  if (!url) {
    throw new Error('template file unavailable');
  }

  const token = localStorage.getItem('access_token');
  const response = await fetch(url, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('template file unavailable');
  }

  return response.blob();
}
