import { resolveMediaUrl } from '../../../shared/api/mediaUrl';
import type { WorkspaceDocument } from './types';

export type WorkspaceSpreadsheetSheet = {
  name: string;
  rows: string[][];
};

export type WorkspaceDocumentPreview =
  | { kind: 'html'; html: string }
  | { kind: 'docx'; html: string }
  | { kind: 'pdf'; objectUrl: string }
  | { kind: 'image'; objectUrl: string }
  | { kind: 'text'; text: string }
  | { kind: 'spreadsheet'; sheets: WorkspaceSpreadsheetSheet[] }
  | { kind: 'unsupported' };

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'markdown', 'log']);
const SPREADSHEET_EXTENSIONS = new Set(['xlsx', 'xls', 'ods', 'csv']);
const MAX_PREVIEW_ROWS = 500;

function fileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function looksLikeHtml(value: string): boolean {
  const sample = value.slice(0, 4000).trim().toLowerCase();
  return (
    sample.startsWith('<!doctype html') ||
    sample.startsWith('<html') ||
    (sample.includes('<html') && sample.includes('<body'))
  );
}

function isPdfBytes(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

async function fetchWorkspaceFileBlob(fileUrl: string): Promise<Blob> {
  const resolved = resolveMediaUrl(fileUrl) ?? fileUrl;
  const token = localStorage.getItem('access_token');
  const response = await fetch(resolved, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error('fetch failed');
  }
  return response.blob();
}

export async function buildWorkspaceDocumentPreview(
  document: WorkspaceDocument,
): Promise<WorkspaceDocumentPreview> {
  const blob = await fetchWorkspaceFileBlob(document.fileUrl);
  const extension = fileExtension(document.name);
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (extension === 'pdf' || blob.type === 'application/pdf' || isPdfBytes(bytes)) {
    return {
      kind: 'pdf',
      objectUrl: URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' })),
    };
  }

  if (IMAGE_EXTENSIONS.has(extension) || blob.type.startsWith('image/')) {
    return {
      kind: 'image',
      objectUrl: URL.createObjectURL(blob),
    };
  }

  if (TEXT_EXTENSIONS.has(extension) || (blob.type.startsWith('text/') && extension !== 'csv')) {
    return { kind: 'text', text: new TextDecoder('utf-8').decode(buffer) };
  }

  if (
    SPREADSHEET_EXTENSIONS.has(extension) ||
    blob.type.includes('spreadsheet') ||
    blob.type.includes('excel')
  ) {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const sheets = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];
        const rawRows = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(sheet, {
          header: 1,
          raw: false,
          defval: '',
        });
        return {
          name,
          rows: rawRows.slice(0, MAX_PREVIEW_ROWS).map((row) =>
            (row ?? []).map((cell) => String(cell ?? '')),
          ),
        };
      }).filter((sheet) => sheet.rows.length > 0);

      if (sheets.length > 0) {
        return { kind: 'spreadsheet', sheets };
      }
    } catch {
      // Fall through to HTML / unsupported handlers.
    }
  }

  const asText = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  if (looksLikeHtml(asText)) {
    return { kind: 'html', html: asText };
  }

  if (extension === 'docx' || extension === 'doc') {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
      if (result.value.trim()) {
        return { kind: 'docx', html: result.value };
      }
    } catch {
      // Binary .doc files are not supported by mammoth; fall through.
    }
  }

  return { kind: 'unsupported' };
}

export function revokeWorkspaceDocumentPreview(preview: WorkspaceDocumentPreview | null | undefined): void {
  if (
    preview &&
    (preview.kind === 'pdf' || preview.kind === 'image') &&
    preview.objectUrl.startsWith('blob:')
  ) {
    URL.revokeObjectURL(preview.objectUrl);
  }
}
