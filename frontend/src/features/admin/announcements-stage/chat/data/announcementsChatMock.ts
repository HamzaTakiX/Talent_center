import type { AdminChatMessage, AdminChatParticipant } from '../../../shared/admin-module-chat/adminChatTypes';

export const announcementsParticipants: AdminChatParticipant[] = [
  {
    id: 'ann1',
    initials: 'CE',
    title: 'Career Events Desk',
    lastPreview: 'Can we pin the ESCA Alumni panel to cohort M2?',
    timeLabel: '09:18',
    unreadCount: 1,
  },
  {
    id: 'ann2',
    initials: 'FS',
    title: 'Forum Student Life',
    lastPreview: 'We need moderator coverage for Round 2 breakout rooms tonight.',
    timeLabel: 'Yesterday',
    unreadCount: 2,
  },
  {
    id: 'ann3',
    initials: 'PR',
    title: 'Partnerships • Industry talks',
    lastPreview: 'Workshop teaser went live — waiting on competition assets.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'ann4',
    initials: 'HQ',
    title: 'Talent Center HQ',
    lastPreview: 'Publication checklist for bilingual digest is GREEN.',
    timeLabel: 'Apr 29',
    unreadCount: 0,
  },
];

export const announcementsInitialMessages: Record<string, AdminChatMessage[]> = {
  ann1: [
    {
      id: 'ann1m1',
      direction: 'in',
      text: 'Spring forum runs May 08–10 — confirming speaker lineup + backup AV.',
      time: '08:40',
      separatorBefore: '2 May 2026',
    },
    {
      id: 'ann1m2',
      direction: 'out',
      text:
        'Great — scheduling note added: targeted audience switched to graduating class + MSc bridge students.',
      time: '09:06',
    },
    {
      id: 'ann1m3',
      direction: 'in',
      text: 'Can we pin the ESCA Alumni panel to cohort M2?',
      time: '09:18',
    },
  ],
  ann2: [
    {
      id: 'ann2m1',
      direction: 'in',
      text: 'Interview coaching slots opened — we advertised 06:30 PM local time.',
      time: '21:52',
      separatorBefore: '30 Apr 2026',
    },
    {
      id: 'ann2m2',
      direction: 'out',
      text:
        'Noted — I split the bulletin into Channels A/B so competition rules stay above the fold.',
      time: '22:07',
    },
    {
      id: 'ann2m3',
      direction: 'in',
      text: 'We need moderator coverage for Round 2 breakout rooms tonight.',
      time: '07:54',
    },
  ],
  ann3: [],
  ann4: [
    {
      id: 'ann4m1',
      direction: 'in',
      text: 'Please validate the teaser copy before we cascade to Moodle + Slack.',
      time: '17:41',
      separatorBefore: '28 Apr 2026',
    },
  ],
};
