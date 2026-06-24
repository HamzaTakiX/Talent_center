export interface ImportedCvPreview {
  fileName: string;
  mimeType: string;
  kind: 'pdf' | 'docx' | 'doc' | 'unsupported';
  objectUrl?: string;
  htmlContent?: string;
}

const isPdfFile = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

const isDocxFile = (file: File) =>
  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
  file.name.toLowerCase().endsWith('.docx');

const isDocFile = (file: File) =>
  file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc');

export async function buildImportedCvPreview(file: File): Promise<ImportedCvPreview> {
  if (isPdfFile(file)) {
    return {
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      kind: 'pdf',
      objectUrl: URL.createObjectURL(file),
    };
  }

  if (isDocxFile(file)) {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    return {
      fileName: file.name,
      mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      kind: 'docx',
      htmlContent: result.value,
    };
  }

  if (isDocFile(file)) {
    return {
      fileName: file.name,
      mimeType: file.type || 'application/msword',
      kind: 'doc',
      objectUrl: URL.createObjectURL(file),
    };
  }

  return {
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    kind: 'unsupported',
  };
}

export function revokeImportedCvPreview(preview?: ImportedCvPreview | null) {
  if (preview?.objectUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(preview.objectUrl);
  }
}
