import type { ChatMessage, ChatParticipant } from '../../../internship_offers/chat/types';

export const studentAnnouncementsChatParticipants: ChatParticipant[] = [
  {
    id: 'st-ann1',
    initials: 'TC',
    title: 'Talent Center • Announcements',
    lastPreview: 'Your question about the internship deadline was forwarded to Student Affairs.',
    timeLabel: '10:41',
    unreadCount: 2,
  },
  {
    id: 'st-ann2',
    initials: 'SA',
    title: 'Student Affairs • Forum events',
    lastPreview: 'The career forum runs May 08–10 — registration is still open.',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'st-ann3',
    initials: 'MO',
    title: 'Mentorship office hours',
    lastPreview: 'Thanks for confirming your attendance for Thursday’s session.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'st-ann4',
    initials: 'IN',
    title: 'Innovathon 2026 — competition',
    lastPreview: 'Submission deadline extended to May 12 at 6 PM.',
    timeLabel: 'Apr 29',
    unreadCount: 0,
  },
];

export const studentAnnouncementsChatInitialMessages: Record<string, ChatMessage[]> = {
  'st-ann1': [
    {
      id: 'st-ann1m1',
      direction: 'in',
      text: 'A new announcement was published: Internship application deadline reminder for graduating students.',
      time: '09:02',
      separatorBefore: '14 May 2026',
    },
    {
      id: 'st-ann1m2',
      direction: 'out',
      text: 'I read the announcement. Can you confirm if the deadline applies to MSc bridge students as well?',
      time: '09:14',
    },
    {
      id: 'st-ann1m3',
      direction: 'in',
      text: 'Your question about the internship deadline was forwarded to Student Affairs. You will receive a reply shortly.',
      time: '10:41',
    },
  ],
  'st-ann2': [
    {
      id: 'st-ann2m1',
      direction: 'in',
      text: 'Spring career forum announcement is live — check the Events section for the full schedule.',
      time: '16:20',
      separatorBefore: '13 May 2026',
    },
    {
      id: 'st-ann2m2',
      direction: 'out',
      text: 'I would like to register for the mock interview slots on Friday. Is there still availability?',
      time: '17:05',
    },
    {
      id: 'st-ann2m3',
      direction: 'in',
      text: 'The career forum runs May 08–10 — registration is still open. Book your slot from the announcement link.',
      time: '07:54',
    },
  ],
  'st-ann3': [
    {
      id: 'st-ann3m1',
      direction: 'in',
      text: 'Mentorship office hours this week: Wednesday 2 PM and Thursday 4 PM.',
      time: '11:30',
      separatorBefore: '12 May 2026',
    },
    {
      id: 'st-ann3m2',
      direction: 'out',
      text: 'I confirm my attendance for Thursday at 4 PM.',
      time: '12:15',
    },
    {
      id: 'st-ann3m3',
      direction: 'in',
      text: 'Thanks for confirming your attendance for Thursday’s session.',
      time: '12:20',
    },
  ],
  'st-ann4': [
    {
      id: 'st-ann4m1',
      direction: 'in',
      text: 'Innovathon 2026 rules updated — please review section 3 before submitting your project.',
      time: '14:00',
      separatorBefore: '10 May 2026',
    },
    {
      id: 'st-ann4m2',
      direction: 'in',
      text: 'Submission deadline extended to May 12 at 6 PM.',
      time: '15:30',
    },
  ],
};
