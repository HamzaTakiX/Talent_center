import type { AnnouncementTag } from '../types';
import type { AnnouncementItemSeed } from '../utils/resolveAnnouncementItem';

export const recommendedAnnouncements: AnnouncementItemSeed[] = [
  {
    id: 'rec-1',
    typeCode: 'recruitment-interview',
    typeName: 'Interview',
    tag: 'Interview',
    deadlineUrgent: true,
    priority: 'Urgent',
    matchScore: 95,
    recommended: true,
  },
  {
    id: 'rec-2',
    typeCode: 'forum-career-fair',
    typeName: 'Event',
    tag: 'Event',
    priority: 'Important',
    matchScore: 92,
    recommended: true,
  },
  {
    id: 'rec-3',
    typeCode: 'competition',
    typeName: 'Competition',
    tag: 'Competition',
    priority: 'Important',
    matchScore: 88,
    recommended: true,
  },
  {
    id: 'rec-4',
    typeCode: 'seminar',
    typeName: 'Seminar',
    tag: 'Seminar',
    priority: 'Important',
    matchScore: 85,
    recommended: true,
  },
];

export const allAnnouncementsFeed: AnnouncementItemSeed[] = [
  {
    id: 'all-1',
    typeCode: 'internship-offer',
    typeName: 'Internship',
    tag: 'Internship',
    priority: 'Important',
  },
  {
    id: 'all-2',
    typeCode: 'seminar',
    typeName: 'Seminar',
    tag: 'Seminar',
    priority: 'Important',
  },
  {
    id: 'all-3',
    typeCode: 'other',
    typeName: 'Announcement',
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
