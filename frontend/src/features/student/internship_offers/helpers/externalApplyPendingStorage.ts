const STORAGE_KEY = 'student_external_apply_pending';

export interface PendingExternalApply {
  offerId: string;
  startedAt: string;
  offerTitle?: string;
}

function readAll(): PendingExternalApply[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PendingExternalApply =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as PendingExternalApply).offerId === 'string' &&
        typeof (item as PendingExternalApply).startedAt === 'string',
    );
  } catch {
    return [];
  }
}

function writeAll(items: PendingExternalApply[]): void {
  try {
    if (items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable or full
  }
}

export function markPendingExternalApply(offerId: string, offerTitle?: string): void {
  const trimmed = offerId.trim();
  if (!trimmed) return;
  const title = offerTitle?.trim() || undefined;
  const items = readAll().filter((item) => item.offerId !== trimmed);
  items.push({ offerId: trimmed, startedAt: new Date().toISOString(), offerTitle: title });
  writeAll(items);
}

export function clearPendingExternalApply(offerId: string): void {
  const trimmed = offerId.trim();
  if (!trimmed) return;
  writeAll(readAll().filter((item) => item.offerId !== trimmed));
}

export function hasPendingExternalApply(offerId: string): boolean {
  const trimmed = offerId.trim();
  if (!trimmed) return false;
  return readAll().some((item) => item.offerId === trimmed);
}

export function listPendingExternalApplies(): PendingExternalApply[] {
  return readAll();
}

export function getLatestPendingExternalApply(): PendingExternalApply | null {
  const items = readAll();
  if (!items.length) return null;
  return [...items].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0];
}
