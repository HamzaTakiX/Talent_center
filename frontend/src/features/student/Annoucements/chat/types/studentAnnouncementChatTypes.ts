export type StudentAnnouncementPrimaryFilter = 'all' | 'archived';

export type StudentAnnouncementPriority = 'Normal' | 'Important' | 'Urgent';

export type StudentAnnouncementInboxFilters = {
  primary: StudentAnnouncementPrimaryFilter;
  announcementTypes: string[];
  priorities: StudentAnnouncementPriority[];
  unread: boolean;
  urgent: boolean;
};

export type StudentAnnouncementPrimaryFilterCounts = {
  all: number;
  archived: number;
};

export const EMPTY_STUDENT_ANNOUNCEMENT_FILTERS: StudentAnnouncementInboxFilters = {
  primary: 'all',
  announcementTypes: [],
  priorities: [],
  unread: false,
  urgent: false,
};

export const STUDENT_ANNOUNCEMENT_PRIORITIES: StudentAnnouncementPriority[] = [
  'Normal',
  'Important',
  'Urgent',
];
