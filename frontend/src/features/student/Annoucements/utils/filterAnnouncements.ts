import type { FullAnnouncementItem } from '../types';

export function filterAnnouncements(
  items: FullAnnouncementItem[],
  search: string,
  typeFilter: string,
  priorityFilter: string,
): FullAnnouncementItem[] {
  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    if (typeFilter !== 'all' && item.typeCode !== typeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (!q) return true;
    return [
      item.title,
      item.company,
      item.description,
      item.typeName,
      item.priority,
    ]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });
}
