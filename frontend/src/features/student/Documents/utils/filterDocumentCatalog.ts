import type { DocumentServiceCatalogItem } from '../../../admin/Documents_admin/types/documentServiceCatalog';
import type { DocumentBadgeFilter, DocumentCategoryFilter } from '../constants/documentsCatalog';
import { DOCUMENT_BADGE_FILTER_ALL, DOCUMENT_CATEGORY_ALL } from '../constants/documentsCatalog';

function matchesBadgeFilter(
  item: DocumentServiceCatalogItem,
  badgeFilter: DocumentBadgeFilter,
): boolean {
  if (badgeFilter === DOCUMENT_BADGE_FILTER_ALL) return true;
  if (badgeFilter === 'online') return item.onlineEnabled;
  if (badgeFilter === 'physical') return item.physicalEnabled;
  if (badgeFilter === 'reservation') return item.reservationRequired;
  if (badgeFilter === 'auto') return item.autoGenerate;
  return true;
}

export function filterDocumentCatalog(
  items: readonly DocumentServiceCatalogItem[],
  search: string,
  categoryFilter: DocumentCategoryFilter,
  badgeFilter: DocumentBadgeFilter,
): DocumentServiceCatalogItem[] {
  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    if (categoryFilter !== DOCUMENT_CATEGORY_ALL && item.category !== categoryFilter) {
      return false;
    }
    if (!matchesBadgeFilter(item, badgeFilter)) {
      return false;
    }
    if (!q) return true;
    const hay = [item.name, item.code, item.description, item.category].join(' ').toLowerCase();
    return hay.includes(q);
  });
}
