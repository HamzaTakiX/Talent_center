import type { AdminChatMessage, AdminChatParticipant } from '../../../shared/admin-module-chat/adminChatTypes';

export type { AdminChatMessage, AdminChatParticipant };

export const internshipOffersParticipants: AdminChatParticipant[] = [
  {
    id: 'io1',
    initials: 'TC',
    title: 'TechCorp Morocco • HR Partnerships',
    lastPreview: 'We need the shortlist pushed before Friday — can you prioritize CVs?',
    timeLabel: '10:41',
    unreadCount: 2,
  },
  {
    id: 'io2',
    initials: 'IS',
    title: 'Innovatech Solutions',
    lastPreview: 'Reminder: deadline for Backend intern role ends Monday 09:00 — still open?',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'io3',
    initials: 'DA',
    title: 'DataHub Analytics • Talent desk',
    lastPreview: 'Thanks — we archived the stale Data Analyst vacancy and reopened v2.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'io4',
    initials: 'CT',
    title: 'CloudTech Systems • Engineering',
    lastPreview: 'Can you attach the signed convention before we onboard the shortlisted profile?',
    timeLabel: 'Apr 14',
    unreadCount: 0,
  },
];

/** Messages keyed by participant id — distinct threads about offers, deadlines, CVs */
export const internshipOffersInitialMessages: Record<string, AdminChatMessage[]> = {
  io1: [
    {
      id: 'io1m1',
      direction: 'in',
      text: "We've published the Software Engineer internship (ref #TC-SEA-026). Screening panel on Thursday.",
      time: '09:02',
      separatorBefore: '2 May 2026',
    },
    {
      id: 'io1m2',
      direction: 'out',
      text:
        'Noted — two strong candidates flagged; I will forward annotated CV extracts and cover letters by Wednesday EOD.',
      time: '09:14',
    },
    {
      id: 'io1m3',
      direction: 'in',
      text: 'We need the shortlist pushed before Friday — can you prioritize CVs?',
      time: '10:41',
    },
  ],
  io2: [
    {
      id: 'io2m1',
      direction: 'in',
      text:
        'Our Backend intern seat is bottlenecked on technical review; can moderation extend the submission window?',
      time: '16:58',
      separatorBefore: '30 Apr 2026',
    },
    {
      id: 'io2m2',
      direction: 'out',
      text: 'You can bump the closing date twice per policy — I refreshed the offer expiry to Monday 09:00.',
      time: '17:05',
    },
    {
      id: 'io2m3',
      direction: 'in',
      text: 'Reminder: deadline for Backend intern role ends Monday 09:00 — still open?',
      time: '11:06',
    },
  ],
  io3: [],
  io4: [
    {
      id: 'io4m1',
      direction: 'in',
      text: 'Can you attach the signed convention before we onboard the shortlisted profile?',
      time: '08:52',
      separatorBefore: '14 Apr 2026',
    },
    {
      id: 'io4m2',
      direction: 'out',
      text:
        'Once the onboarding ticket is GREEN, HR uploads convention + insurance proof; ping me if SLA slips past noon.',
      time: '09:07',
    },
  ],
};
