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
  {
    id: 'st-srf2',
    initials: 'TU',
    title: 'Frais de scolarité — S2',
    lastPreview: 'The remaining amount for semester 2 is 0 MAD.',
    timeLabel: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'st-srf3',
    initials: 'RC',
    title: 'Validation du reçu',
    lastPreview: 'Please upload a clearer scan of your bank transfer receipt.',
    timeLabel: '2 days ago',
    unreadCount: 1,
  },
  {
    id: 'st-srf4',
    initials: 'EC',
    title: 'Échéance — Frais bibliothèque',
    lastPreview: 'Reminder: payment deadline is 30 April 2026.',
    timeLabel: 'Apr 28',
    unreadCount: 0,
  },
];

export const studentSrfChatInitialMessages: Record<string, ChatMessage[]> = {
  'st-srf1': [
    {
      id: 'st-srf1m1',
      direction: 'in',
      text: 'Hello — we received your payment for the library fee. The finance team is reviewing your receipt.',
      time: '09:12',
      separatorBefore: '15 May 2026',
    },
    {
      id: 'st-srf1m2',
      direction: 'out',
      text: 'Thank you. I submitted the transfer yesterday. Can you confirm the remaining amount?',
      time: '09:35',
    },
    {
      id: 'st-srf1m3',
      direction: 'in',
      text: 'Your library fee payment receipt is pending validation. We will update your payment status within 48 hours.',
      time: '10:48',
    },
  ],
  'st-srf2': [
    {
      id: 'st-srf2m1',
      direction: 'in',
      text: 'Your semester 2 tuition fees show as fully paid. No remaining balance.',
      time: '14:05',
      separatorBefore: '14 May 2026',
    },
    {
      id: 'st-srf2m2',
      direction: 'out',
      text: 'Perfect, thank you for confirming my payment status.',
      time: '14:18',
    },
    {
      id: 'st-srf2m3',
      direction: 'in',
      text: 'The remaining amount for semester 2 is 0 MAD. Your account is up to date.',
      time: '16:02',
    },
  ],
  'st-srf3': [
    {
      id: 'st-srf3m1',
      direction: 'in',
      text: 'We could not read the reference on your uploaded receipt (VIR-2026-005).',
      time: '11:20',
      separatorBefore: '13 May 2026',
    },
    {
      id: 'st-srf3m2',
      direction: 'out',
      text: 'I will upload a higher-quality PDF of the bank transfer before end of day.',
      time: '11:44',
    },
    {
      id: 'st-srf3m3',
      direction: 'in',
      text: 'Please upload a clearer scan of your bank transfer receipt so we can validate your payment.',
      time: '08:15',
    },
  ],
  'st-srf4': [
    {
      id: 'st-srf4m1',
      direction: 'in',
      text: 'This is a reminder that your library fee (300 MAD) is due by 30 April 2026.',
      time: '09:00',
      separatorBefore: '10 May 2026',
    },
    {
      id: 'st-srf4m2',
      direction: 'out',
      text: 'I will complete the payment this week and send the receipt.',
      time: '09:22',
    },
    {
      id: 'st-srf4m3',
      direction: 'in',
      text: 'Reminder: payment deadline is 30 April 2026. Contact us if you need an extension.',
      time: '09:30',
    },
  ],
};
