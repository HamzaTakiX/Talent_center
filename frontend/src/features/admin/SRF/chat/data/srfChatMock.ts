import type { AdminChatMessage, AdminChatParticipant } from '../../../shared/admin-module-chat/adminChatTypes';

export const srfParticipants: AdminChatParticipant[] = [
  {
    id: 'srf1',
    initials: 'BA',
    title: 'Bursar office — installments',
    lastPreview: 'Instalment 2 for cohort Jan-26 reopened after bank holiday glitch.',
    timeLabel: '10:55',
    unreadCount: 2,
  },
  {
    id: 'srf2',
    initials: 'AC',
    title: 'Accounts control',
    lastPreview: 'Eight students still flagged “partial wire” — need proof of transfer.',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'srf3',
    initials: 'RC',
    title: 'Registry collections',
    lastPreview: 'Thanks — receipt PDF template now injects RFID token for audit.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'srf4',
    initials: 'SX',
    title: 'Scholarships desk',
    lastPreview: 'Waivers batch posted; notify families before cutoff Friday.',
    timeLabel: 'Apr 28',
    unreadCount: 0,
  },
];

export const srfInitialMessages: Record<string, AdminChatMessage[]> = {
  srf1: [
    {
      id: 'srf1m1',
      direction: 'in',
      text: 'We need nightly digest of bounced SEPA debits referencing student matriculation codes.',
      time: '08:54',
      separatorBefore: '2 May 2026',
    },
    {
      id: 'srf1m2',
      direction: 'out',
      text:
        'Standing order file reconciled against SAP export — anomalies tagged with bank reason codes FE12/RR44.',
      time: '09:21',
    },
    {
      id: 'srf1m3',
      direction: 'in',
      text: 'Instalment 2 for cohort Jan-26 reopened after bank holiday glitch.',
      time: '10:55',
    },
  ],
  srf2: [],
  srf3: [
    {
      id: 'srf3m1',
      direction: 'out',
      text: 'Please confirm ACH descriptor text before we regenerate March PDF receipts.',
      time: '17:59',
      separatorBefore: '30 Apr 2026',
    },
  ],
  srf4: [],
};
