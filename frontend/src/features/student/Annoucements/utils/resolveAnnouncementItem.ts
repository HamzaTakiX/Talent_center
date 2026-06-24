import type { TFunction } from 'i18next';
import type { AnnouncementTag, FullAnnouncementItem } from '../types';

export type AnnouncementItemSeed = Omit<
  FullAnnouncementItem,
  'title' | 'company' | 'postedDate' | 'deadlineLabel' | 'description'
> & {
  /** @deprecated mock-only */
  tag?: AnnouncementTag;
};

export function resolveAnnouncementItem(
  item: AnnouncementItemSeed,
  t: TFunction,
): FullAnnouncementItem {
  const base = `student.announcements.mocks.items.${item.id}`;
  return {
    ...item,
    typeCode: item.typeCode ?? 'other',
    typeName: item.typeName ?? (item.tag ?? 'Announcement'),
    title: t(`${base}.title`),
    company: t(`${base}.company`),
    postedDate: t(`${base}.postedDate`),
    deadlineLabel: t(`${base}.deadlineLabel`),
    description: t(`${base}.description`),
  };
}

export function announcementTagLabel(tag: AnnouncementTag, t: TFunction): string {
  return t(`student.announcements.mocks.tags.${tag}`);
}

export function announcementSearchHaystack(item: FullAnnouncementItem, t: TFunction): string {
  return [
    item.title,
    item.company,
    item.description,
    item.typeName,
    t(`student.announcements.priority.${item.priority === 'Urgent' ? 'urgent' : item.priority === 'Important' ? 'important' : 'normal'}`),
  ]
    .join(' ')
    .toLowerCase();
}
