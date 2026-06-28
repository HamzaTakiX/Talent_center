export type ServiceCatalogTemplatePreviewSource =
  | { kind: 'pdf'; objectUrl: string }
  | { kind: 'docx'; html: string };

export async function buildServiceCatalogTemplatePreview(
  file: File,
): Promise<ServiceCatalogTemplatePreviewSource> {
  return buildServiceCatalogTemplatePreviewFromBlob(file, file.name);
}

export async function buildServiceCatalogTemplatePreviewFromBlob(
  blob: Blob,
  fileName: string,
): Promise<ServiceCatalogTemplatePreviewSource> {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    return {
      kind: 'pdf',
      objectUrl: URL.createObjectURL(blob),
    };
  }

  const mammoth = await import('mammoth');
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  return {
    kind: 'docx',
    html: result.value,
  };
}

export function revokeServiceCatalogTemplatePreview(
  preview: ServiceCatalogTemplatePreviewSource | null | undefined,
) {
  if (preview?.kind === 'pdf' && preview.objectUrl.startsWith('blob:')) {
    URL.revokeObjectURL(preview.objectUrl);
  }
}
