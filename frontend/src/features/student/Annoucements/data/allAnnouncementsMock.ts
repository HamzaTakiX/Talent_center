import type { AnnouncementTag } from '../types';
import type { AnnouncementItemSeed } from '../utils/resolveAnnouncementItem';

export const recommendedAnnouncements: AnnouncementItemSeed[] = [
  {
    id: 'rec-1',
    tag: 'Interview',
    deadlineUrgent: true,
    priority: 'Urgent',
    matchScore: 95,
    recommended: true,
  },
  {
    id: 'rec-2',
    tag: 'Event',
    priority: 'Important',
    matchScore: 92,
    recommended: true,
  },
  {
    id: 'rec-3',
    tag: 'Competition',
    priority: 'Important',
    matchScore: 88,
    recommended: true,
  },
  {
    id: 'rec-4',
    tag: 'Seminar',
    priority: 'Important',
    matchScore: 85,
    recommended: true,
  },
];

export const allAnnouncementsFeed: AnnouncementItemSeed[] = [
  {
    id: 'all-1',
    tag: 'Internship',
    priority: 'Important',
  },
  {
    id: 'all-2',
    tag: 'Seminar',
    priority: 'Important',
  },
  {
    id: 'all-3',
    tag: 'Announcement',
    priority: 'Important',
  },
];

export const ANNOUNCEMENT_TYPE_FILTER_VALUES = [
  'all',
  'Interview',
  'Event',
  'Competition',
  'Internship',
  'Seminar',
  'Announcement',
] as const;

export const ANNOUNCEMENT_PRIORITY_FILTER_VALUES = ['all', 'Urgent', 'Important', 'Normal'] as const;

export type AnnouncementTypeFilterValue = (typeof ANNOUNCEMENT_TYPE_FILTER_VALUES)[number];
export type AnnouncementPriorityFilterValue = (typeof ANNOUNCEMENT_PRIORITY_FILTER_VALUES)[number];

export const isAnnouncementTag = (value: string): value is AnnouncementTag =>
  value !== 'all' &&
  (ANNOUNCEMENT_TYPE_FILTER_VALUES as readonly string[]).includes(value);
