import type { FullAnnouncementItem } from '../types';

export const recommendedAnnouncements: FullAnnouncementItem[] = [
  {
    id: 'rec-1',
    title: 'Marketing Internship Interview - Round 1',
    tag: 'Interview',
    company: 'Maroc Telecom',
    postedDate: 'Apr 12, 2026',
    deadlineLabel: 'Deadline: Apr 15, 2026 (2 days)',
    deadlineUrgent: true,
    description:
      'You have been shortlisted for the first round interview. Please prepare a 10-minute presentation about your marketing project.',
    priority: 'Urgent',
    matchScore: 95,
    recommended: true,
  },
  {
    id: 'rec-2',
    title: 'ESCA Career Fair 2026',
    tag: 'Event',
    company: 'ESCA Business School',
    postedDate: 'Apr 10, 2026',
    deadlineLabel: 'Deadline: Apr 15, 2026 (5 days)',
    description:
      'Join us for the annual career fair featuring 50+ companies. Register now to secure your spot and meet potential employers.',
    priority: 'Important',
    matchScore: 92,
    recommended: true,
  },
  {
    id: 'rec-3',
    title: 'National Business Case Competition',
    tag: 'Competition',
    company: 'McKinsey & Company',
    postedDate: 'Apr 9, 2026',
    deadlineLabel: 'Deadline: Apr 20, 2026 (11 days)',
    description:
      'Participate in the national case competition. Teams of 3-4 students. Winners receive internship offers and mentorship.',
    priority: 'Important',
    matchScore: 88,
    recommended: true,
  },
  {
    id: 'rec-4',
    title: 'Leadership Development Seminar',
    tag: 'Seminar',
    company: 'Deloitte Morocco',
    postedDate: 'Apr 7, 2026',
    deadlineLabel: 'Deadline: Apr 18, 2026 (8 days)',
    description:
      'Exclusive seminar for top-performing students. Learn leadership skills from industry experts. Limited seats available.',
    priority: 'Important',
    matchScore: 85,
    recommended: true,
  },
];

export const allAnnouncementsFeed: FullAnnouncementItem[] = [
  {
    id: 'all-1',
    title: 'Summer Internship Program Opening',
    tag: 'Internship',
    company: 'OCP Group',
    postedDate: 'Apr 8, 2026',
    deadlineLabel: 'Deadline: Apr 25, 2026 (12 days)',
    description:
      'OCP Group is opening applications for summer internships across multiple departments. Apply early for best consideration.',
    priority: 'Important',
  },
  {
    id: 'all-2',
    title: 'Leadership Development Seminar',
    tag: 'Seminar',
    company: 'Deloitte Morocco',
    postedDate: 'Apr 7, 2026',
    deadlineLabel: 'Deadline: Apr 18, 2026 (8 days)',
    description:
      'Exclusive seminar for top-performing students. Learn leadership skills from industry experts. Limited seats available.',
    priority: 'Important',
  },
  {
    id: 'all-3',
    title: 'New Internship Matching Feature',
    tag: 'Announcement',
    company: 'Talent Center',
    postedDate: 'Apr 6, 2026',
    deadlineLabel: 'Deadline: Apr 30, 2026 (20 days)',
    description:
      'We have launched a new AI-powered matching system to help you find the best internship opportunities based on your profile.',
    priority: 'Important',
  },
];

export const ANNOUNCEMENT_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Event', label: 'Event' },
  { value: 'Competition', label: 'Competition' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Seminar', label: 'Seminar' },
  { value: 'Announcement', label: 'Announcement' },
] as const;

export const ANNOUNCEMENT_PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'Urgent', label: 'Urgent' },
  { value: 'Important', label: 'Important' },
  { value: 'Normal', label: 'Normal' },
] as const;
