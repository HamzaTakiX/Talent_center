import type { AdminChatMessage, AdminChatParticipant } from '../../../shared/admin-module-chat/adminChatTypes';

export const documentsParticipants: AdminChatParticipant[] = [
  {
    id: 'doc1',
    initials: 'RC',
    title: 'Registry • Conventions office',
    lastPreview: 'Student 2024-118 still missing signature page 3 on the convention PDF.',
    timeLabel: '11:02',
    unreadCount: 2,
  },
  {
    id: 'doc2',
    initials: 'VQ',
    title: 'Validation queue — MSc bridge',
    lastPreview: 'We rejected the blurry scan; resent secure upload link?',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'doc3',
    initials: 'IT',
    title: 'Internship attestations inbox',
    lastPreview: 'Please validate the bilingual attestation footer before stamping.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'doc4',
    initials: 'FP',
    title: 'Faculty partnership desk',
    lastPreview: 'Thanks — insurance certificate swapped for amended version.',
    timeLabel: 'Apr 26',
    unreadCount: 0,
  },
];

export const documentsInitialMessages: Record<string, AdminChatMessage[]> = {
  doc1: [
    {
      id: 'doc1m1',
      direction: 'in',
      text: 'Can you escalate the escrow hold on convention batch B12? Employer counsel is circling.',
      time: '10:06',
      separatorBefore: '2 May 2026',
    },
    {
      id: 'doc1m2',
      direction: 'out',
      text:
        'Batch frozen until PDF/A compliance passes — OCR flagged duplicate headers across page 12.',
      time: '10:18',
    },
    {
      id: 'doc1m3',
      direction: 'in',
      text: 'Student 2024-118 still missing signature page 3 on the convention PDF.',
      time: '11:02',
    },
  ],
  doc2: [
    {
      id: 'doc2m1',
      direction: 'out',
      text: 'Reminder: blurry scans auto-fail SLA — ping students before auto-closure midnight.',
      time: '09:54',
      separatorBefore: '30 Apr 2026',
    },
    {
      id: 'doc2m2',
      direction: 'in',
      text: 'We rejected the blurry scan; resent secure upload link?',
      time: '07:43',
    },
  ],
  doc3: [],
  doc4: [
    {
      id: 'doc4m1',
      direction: 'in',
      text: 'Updated corporate stamp arrived — regenerate preview before validation milestone.',
      time: '17:52',
      separatorBefore: '25 Apr 2026',
    },
  ],
};
