import type { TFunction } from 'i18next';
import type { DocumentCatalogItem, ResolvedDocumentCatalogItem } from '../types';
import type { DocumentBadgeFilter, DocumentCategoryFilter } from '../constants/documentsCatalog';
import { DOCUMENT_BADGE_FILTER_ALL, DOCUMENT_CATEGORY_ALL } from '../constants/documentsCatalog';

export function resolveDocumentCatalogItem(
  item: DocumentCatalogItem,
  t: TFunction,
): ResolvedDocumentCatalogItem {
  return {
    ...item,
    category: t(`student.documents.categories.${item.categoryKey}`),
  };
}

export function filterDocumentCatalog(
  items: readonly DocumentCatalogItem[],
  search: string,
  categoryFilter: DocumentCategoryFilter,
  badgeFilter: DocumentBadgeFilter,
  t: TFunction,
): ResolvedDocumentCatalogItem[] {
  const q = search.trim().toLowerCase();

  return items
    .map((item) => resolveDocumentCatalogItem(item, t))
    .filter((item) => {
      if (categoryFilter !== DOCUMENT_CATEGORY_ALL && item.categoryKey !== categoryFilter) {
        return false;
      }
      if (badgeFilter !== DOCUMENT_BADGE_FILTER_ALL && item.badgeType !== badgeFilter) {
        return false;
      }
      if (!q) return true;
      const hay = [item.title, item.category, item.delayLabel, item.requirement]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
}
