import type { ChatMessage, ChatParticipant } from '../../../internship_offers/chat/types';

export const studentEncadrantChatParticipants: ChatParticipant[] = [
  {
    id: 'st-enc1',
    initials: 'AB',
    title: 'Dr. Ahmed Bennani',
    lastPreview: 'Please update Chapter 2 before our weekly review tomorrow.',
    timeLabel: '11:24',
    unreadCount: 2,
  },
  {
    id: 'st-enc2',
    initials: 'RP',
    title: 'Rapport de stage — corrections',
    lastPreview: 'I left comments on the methodology section.',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'st-enc3',
    initials: 'RV',
    title: 'Weekly Progress Review',
    lastPreview: 'Meeting confirmed for 18/04/2026 at 14:00.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'st-enc4',
    initials: 'TK',
    title: 'Tâches — Literature Review',
    lastPreview: 'Clarification on the priority for Chapter 2.',
    timeLabel: 'Apr 28',
    unreadCount: 0,
  },
];

export const studentEncadrantChatInitialMessages: Record<string, ChatMessage[]> = {
  'st-enc1': [
    {
      id: 'st-enc1m1',
      direction: 'in',
      text: 'Hello — I reviewed your latest progress. Your internship report is at 65% overall. Good work on the introduction.',
      time: '10:02',
      separatorBefore: '15 May 2026',
    },
    {
      id: 'st-enc1m2',
      direction: 'out',
      text: 'Thank you, Dr. Bennani. I am preparing the literature review chapter for our meeting tomorrow.',
      time: '10:18',
    },
    {
      id: 'st-enc1m3',
      direction: 'in',
      text: 'Please update Chapter 2 before our weekly review tomorrow at 14:00. Bring your questions about the methodology section.',
      time: '11:24',
    },
    {
      id: 'st-enc1m4',
      direction: 'in',
      text: 'Meeting request',
      time: '11:26',
      messageType: 'MEETING_REQUEST',
      meetingRequest: {
        requestId: 'mr-demo-student-1',
        mode: 'video',
        status: 'pending',
        title: 'Weekly Progress Review',
      },
    },
  ],
  'st-enc2': [
    {
      id: 'st-enc2m1',
      direction: 'in',
      text: 'I left feedback on your report draft. The literature review needs stronger references in section 2.3.',
      time: '09:40',
      separatorBefore: '14 May 2026',
    },
    {
      id: 'st-enc2m2',
      direction: 'out',
      text: 'I will revise section 2.3 tonight and upload the corrected version.',
      time: '10:05',
    },
    {
      id: 'st-enc2m3',
      direction: 'in',
      text: 'I left comments on the methodology section. Please address them before Friday.',
      time: '16:12',
    },
  ],
  'st-enc3': [
    {
      id: 'st-enc3m1',
      direction: 'in',
      text: 'Your weekly progress review is scheduled for 18/04/2026 at 14:00. Please prepare a short summary of your tasks.',
      time: '14:00',
      separatorBefore: '13 May 2026',
    },
    {
      id: 'st-enc3m2',
      direction: 'out',
      text: 'Understood. I will prepare the presentation slides and my progress report.',
      time: '14:22',
    },
    {
      id: 'st-enc3m3',
      direction: 'in',
      text: 'Meeting confirmed for 18/04/2026 at 14:00. Join via the link I shared in Agenda.',
      time: '15:00',
    },
  ],
  'st-enc4': [
    {
      id: 'st-enc4m1',
      direction: 'in',
      text: 'Regarding "Complete Chapter 2 - Literature Review": this is high priority. Deadline is 20/04/2026.',
      time: '08:30',
      separatorBefore: '12 May 2026',
    },
    {
      id: 'st-enc4m2',
      direction: 'out',
      text: 'Should I focus on the AI & Machine Learning references first, or the general CS bibliography?',
      time: '09:15',
    },
    {
      id: 'st-enc4m3',
      direction: 'in',
      text: 'Clarification on the priority for Chapter 2: start with ML references, then broaden to related CS work.',
      time: '09:48',
    },
  ],
};
