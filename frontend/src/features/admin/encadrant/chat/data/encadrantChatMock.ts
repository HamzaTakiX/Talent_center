import type { AdminChatMessage, AdminChatParticipant } from '../../../shared/admin-module-chat/adminChatTypes';

export const encadrantParticipants: AdminChatParticipant[] = [
  // contextual supervision threads
  {
    id: 'enc1',
    initials: 'MS',
    title: 'Mentor Sofia • Product lab',
    lastPreview: 'Site visit postponed — plant safety rehearsal runs Thursday noon.',
    timeLabel: '11:41',
    unreadCount: 1,
    contextKind: 'workflow_thread',
    urgency: 'HIGH',
    workflowStatus: 'internship_followup',
    entityLabel: 'Suivi stage — Ahmed B.',
  },
  {
    id: 'enc2',
    initials: 'JA',
    title: 'Encadrant IT — Telecom track',
    lastPreview: 'Internship diary week 11 still empty for three students.',
    timeLabel: 'Yesterday',
    unreadCount: 2,
  },
  {
    id: 'enc3',
    initials: 'PL',
    title: 'Program lead • Logistics',
    lastPreview: 'Can we escalate PPE briefing doc before plant floor walk?',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'enc4',
    initials: 'RD',
    title: 'Regional delegate',
    lastPreview: 'Thanks — midpoint evaluation rubric shared with HQ.',
    timeLabel: 'Apr 23',
    unreadCount: 0,
  },
];

export const encadrantInitialMessages: Record<string, AdminChatMessage[]> = {
  enc1: [
    {
      id: 'enc1m1',
      direction: 'out',
      text: 'Reminder: midpoint grades due before May 06 — escalate any red skill gaps ASAP.',
      time: '07:52',
      separatorBefore: '2 May 2026',
    },
    {
      id: 'enc1m2',
      direction: 'in',
      text:
        'Our paired student needs extra UX critique hours — coordinating with onsite sponsor this afternoon.',
      time: '09:41',
    },
    {
      id: 'enc1m3',
      direction: 'in',
      text: 'Site visit postponed — plant safety rehearsal runs Thursday noon.',
      time: '11:41',
    },
  ],
  enc2: [],
  enc3: [
    {
      id: 'enc3m1',
      direction: 'in',
      text: 'Can we escalate PPE briefing doc before plant floor walk?',
      time: '15:06',
      separatorBefore: '28 Apr 2026',
    },
  ],
  enc4: [],
};
