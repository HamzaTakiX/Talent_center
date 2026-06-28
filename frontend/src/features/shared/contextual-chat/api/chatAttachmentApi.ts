import apiClient from '../../../../shared/api/client';

export async function downloadChatAttachment(attachmentId: number, filename: string): Promise<void> {
  const { data } = await apiClient.get<Blob>(`/chat/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function fetchChatAttachmentBlob(attachmentId: number): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/chat/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });
  return data;
}
