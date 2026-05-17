import type { AdminChatMessage, AdminChatParticipant } from '../../shared/admin-module-chat/adminChatTypes';

export const sousAdminParticipants: AdminChatParticipant[] = [
  {
    id: 'sa1',
    initials: 'ID',
    title: 'Identity & access watchdog',
    lastPreview: 'Elevated SAML error rates on SSO bridge — paging vendor T2.',
    timeLabel: '08:51',
    unreadCount: 2
  },
  {
    id: 'sa2',
    initials: 'MP',
    title: 'Moderation policy guild',
    lastPreview: 'Thread #MOD-982 escalated — possible PII leakage in attachment.',
    timeLabel: 'Yesterday',
    unreadCount: 1
  },
  {
    id: 'sa3',
    initials: 'OP',
    title: 'Operational audit',
    lastPreview: 'Dry-run impersonation banners ready for QA build 416.',
    timeLabel: '3 days ago',
    unreadCount: 0
  },
  {
    id: 'sa4',
    initials: 'LG',
    title: 'Local campus admin FR5',
    lastPreview: 'Thanks — regional role matrix refreshed after hire freeze lifted.',
    timeLabel: 'Apr 27',
    unreadCount: 0
  }
];

export const sousAdminInitialMessages: Record<string, AdminChatMessage[]> = {
  sa1: [
    {
      id: 'sa1m1',
      direction: 'in',
      text: 'Need quorum to flip READ_ONLY on rogue API keys surfaced in scanner diff.',
      time: '07:44',
      separatorBefore: '2 May 2026'
    },
    {
      id: 'sa1m2',
      direction: 'out',
      text: 'Staging keys revoked — promote hotfix changelog #REL-884 before staff stand-up.',
      time: '07:53'
    },
    {
      id: 'sa1m3',
      direction: 'in',
      text: 'Elevated SAML error rates on SSO bridge — paging vendor T2.',
      time: '08:51'
    }
  ],
  sa2: [],
  sa3: [
    {
      id: 'sa3m1',
      direction: 'out',
      text: 'Next smoke test covers impersonation banner + revocation heartbeat — ETA 45m.',
      time: '09:58',
      separatorBefore: '28 Apr 2026'
    }
  ],
  sa4: []
};
