import type { AdminChatMessage, AdminChatParticipant } from '../../../shared/admin-module-chat/adminChatTypes';

export const studentDeskParticipants: AdminChatParticipant[] = [
  {
    id: 'stu1',
    initials: 'AC',
    title: 'Amina Chaoui • MSc Data',
    lastPreview: 'If I postpone this studio course, does it block my internship panel slot?',
    timeLabel: '10:06',
    unreadCount: 2,
  },
  {
    id: 'stu2',
    initials: 'KM',
    title: 'Karim Mekouar • Clubs rep',
    lastPreview: 'We need quorum proof for delegation trip reimbursements.',
    timeLabel: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'stu3',
    initials: 'LB',
    title: 'Lina Bensaïd • Wellbeing liaison',
    lastPreview: 'Workshop pacing feels tight — stretch interview prep by one week?',
    timeLabel: '2 days ago',
    unreadCount: 1,
  },
  {
    id: 'stu4',
    initials: 'OR',
    title: 'Omar Reda • Careers peer',
    lastPreview: 'Mock panel feedback notes uploaded to shared vault.',
    timeLabel: 'Apr 21',
    unreadCount: 0,
  },
];

export const studentDeskInitialMessages: Record<string, AdminChatMessage[]> = {
  stu1: [
    {
      id: 'stu1m1',
      direction: 'in',
      text: 'Hi — juggling dual timelines for ML bootcamp vs finance minor — any priority rule?',
      time: '09:51',
      separatorBefore: '2 May 2026',
    },
    {
      id: 'stu1m2',
      direction: 'out',
      text:
        'Policy: internships unlock after 90 validated ECTS inside track — elective deferrals need faculty sign-off.',
      time: '09:54',
    },
    {
      id: 'stu1m3',
      direction: 'in',
      text: 'If I postpone this studio course, does it block my internship panel slot?',
      time: '10:06',
    },
  ],
  stu2: [],
  stu3: [],
  stu4: [
    {
      id: 'stu4m1',
      direction: 'in',
      text: 'Mock panel feedback notes uploaded to shared vault.',
      time: '18:41',
      separatorBefore: '20 Apr 2026',
    },
  ],
};
