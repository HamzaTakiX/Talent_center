import type { ChatMessage, ChatParticipant } from '../../../internship_offers/chat/types';

export const studentSrfChatParticipants: ChatParticipant[] = [
  {
    id: 'st-srf1',
    initials: 'SF',
    title: 'Service financier • SRF desk',
    lastPreview: 'Your library fee payment receipt is pending validation.',
    timeLabel: '10:48',
    unreadCount: 2,
  },
];

export const studentSrfChatInitialMessages: Record<string, ChatMessage[]> = {
  'st-srf1': [],
};
