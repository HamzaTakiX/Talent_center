import type { FullAnnouncementItem } from '../types';

export function filterAnnouncements(
  items: FullAnnouncementItem[],
  search: string,
  typeFilter: string,
  priorityFilter: string
): FullAnnouncementItem[] {
  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    if (typeFilter !== 'all' && item.tag !== typeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (!q) return true;

    const haystack = [item.title, item.company, item.description, item.tag, item.priority]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}
