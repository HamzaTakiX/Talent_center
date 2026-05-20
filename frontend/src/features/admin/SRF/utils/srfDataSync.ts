/** Notify SRF views to refetch after import / rollback (same-tab). */

export const SRF_DATA_INVALIDATED_EVENT = 'srf-data-invalidated';

export function invalidateSrfData(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SRF_DATA_INVALIDATED_EVENT));
  }
}
