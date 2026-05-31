import type { TFunction } from 'i18next';
import type { FullAnnouncementItem } from '../types';
import { announcementSearchHaystack } from './resolveAnnouncementItem';

export function filterAnnouncements(
  items: FullAnnouncementItem[],
  search: string,
  typeFilter: string,
  priorityFilter: string,
  t: TFunction,
): FullAnnouncementItem[] {
  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    if (typeFilter !== 'all' && item.tag !== typeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (!q) return true;
    return announcementSearchHaystack(item, t).includes(q);
  });
}
