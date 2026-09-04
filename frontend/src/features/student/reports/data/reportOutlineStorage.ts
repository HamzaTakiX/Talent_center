import type { ReportOutlineItem } from '../types/reportOutline';

const STORAGE_PREFIX = 'tc-report-outline-v1:';

export function loadReportOutline(reportId: string): ReportOutlineItem[] | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${reportId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReportOutlineItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveReportOutline(reportId: string, items: ReportOutlineItem[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${reportId}`, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}
