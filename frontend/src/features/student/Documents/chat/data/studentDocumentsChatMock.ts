import type { ChatMessage, ChatParticipant } from '../../../internship_offers/chat/types';

export const studentDocumentsChatParticipants: ChatParticipant[] = [
  {
    id: 'st-doc1',
    initials: 'AD',
    title: 'Administration • Documents desk',
    lastPreview: 'Your internship agreement is pending validation.',
    timeLabel: '11:02',
    unreadCount: 2,
  },
  {
    id: 'st-doc2',
    initials: 'CV',
    title: 'Convention de stage — review',
    lastPreview: 'Please upload page 3 with your signature.',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'st-doc3',
    initials: 'AT',
    title: 'Attestation de stage',
    lastPreview: 'Your attestation request has been received.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'st-doc4',
    initials: 'IN',
    title: 'Insurance certificate',
    lastPreview: 'The updated insurance document was accepted.',
    timeLabel: 'Apr 26',
    unreadCount: 0,
  },
];

export const studentDocumentsChatInitialMessages: Record<string, ChatMessage[]> = {
  'st-doc1': [
    {
      id: 'st-doc1m1',
      direction: 'in',
      text: 'Hello — we received your internship agreement. The administration team is reviewing it.',
      time: '10:06',
      separatorBefore: '14 May 2026',
    },
    {
      id: 'st-doc1m2',
      direction: 'out',
      text: 'Thank you. I uploaded the signed PDF this morning. Please let me know if anything is missing.',
      time: '10:18',
    },
    {
      id: 'st-doc1m3',
      direction: 'in',
      text: 'Your internship agreement is pending validation. We will notify you once it is approved.',
      time: '11:02',
    },
  ],
  'st-doc2': [
    {
      id: 'st-doc2m1',
      direction: 'in',
      text: 'Your convention PDF is missing the signature on page 3.',
      time: '09:54',
      separatorBefore: '13 May 2026',
    },
    {
      id: 'st-doc2m2',
      direction: 'out',
      text: 'I will re-upload the signed page today before 6 PM.',
      time: '10:12',
    },
    {
      id: 'st-doc2m3',
      direction: 'in',
      text: 'Please upload page 3 with your signature so we can validate your file.',
      time: '07:43',
    },
  ],
  'st-doc3': [
    {
      id: 'st-doc3m1',
      direction: 'in',
      text: 'Your attestation request has been received and will be processed within 48 hours.',
      time: '14:20',
      separatorBefore: '12 May 2026',
    },
  ],
  'st-doc4': [
    {
      id: 'st-doc4m1',
      direction: 'out',
      text: 'I uploaded the amended insurance certificate as requested.',
      time: '16:05',
      separatorBefore: '10 May 2026',
    },
    {
      id: 'st-doc4m2',
      direction: 'in',
      text: 'The updated insurance document was accepted. No further action is required.',
      time: '16:30',
    },
  ],
};
