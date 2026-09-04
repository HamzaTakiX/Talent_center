import type { ChatMessage, ChatParticipant } from '../types';

export const encadrantPortalChatParticipants: ChatParticipant[] = [
  {
    id: 'enc-chat1',
    initials: 'SA',
    title: 'Sarah Alami',
    lastPreview: 'I uploaded the revised Technical Specifications — ready for your review.',
    timeLabel: '10:52',
    unreadCount: 2,
  },
  {
    id: 'enc-chat2',
    initials: 'YB',
    title: 'Youssef Benani',
    lastPreview: 'Can we move the follow-up meeting to Tuesday at 14:30 on Zoom?',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'enc-chat3',
    initials: 'MI',
    title: 'Mohamed Idrissi',
    lastPreview: 'Understood — I will prioritise the integration test cases first.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'enc-chat4',
    initials: 'KF',
    title: 'Karim El Fassi',
    lastPreview: 'My internship progress is at 72% — I attached the weekly summary.',
    timeLabel: 'Apr 29',
    unreadCount: 0,
  },
];

export const encadrantPortalChatInitialMessages: Record<string, ChatMessage[]> = {
  'enc-chat1': [
    {
      id: 'enc-chat1m1',
      direction: 'out',
      text: 'Sarah — I reviewed your draft report. The Technical Specifications section needs clearer acceptance criteria in §3.2.',
      time: '09:15',
      separatorBefore: '15 May 2026',
    },
    {
      id: 'enc-chat1m2',
      direction: 'in',
      text: 'Thank you, Dr. Bennani. I will update §3.2 tonight and resubmit before tomorrow’s deadline.',
      time: '09:42',
    },
    {
      id: 'enc-chat1m3',
      direction: 'in',
      text: 'I uploaded the revised Technical Specifications — ready for your review.',
      time: '10:52',
    },
    {
      id: 'enc-chat1m4',
      direction: 'in',
      text: 'Meeting request',
      time: '10:55',
      messageType: 'MEETING_REQUEST',
      meetingRequest: {
        requestId: 'mr-demo-enc-1',
        mode: 'video',
        status: 'pending',
        title: 'Report review session',
      },
    },
  ],
  'enc-chat2': [
    {
      id: 'enc-chat2m1',
      direction: 'out',
      text: 'Youssef — following our last session, please send the updated Implementation Plan by 20/04/2026.',
      time: '14:10',
      separatorBefore: '14 May 2026',
    },
    {
      id: 'enc-chat2m2',
      direction: 'in',
      text: 'I am finalising the plan. Could we schedule a short follow-up to review the deployment milestones?',
      time: '16:30',
    },
    {
      id: 'enc-chat2m3',
      direction: 'in',
      text: 'Can we move the follow-up meeting to Tuesday at 14:30 on Zoom?',
      time: '08:05',
    },
    {
      id: 'enc-chat2m4',
      direction: 'out',
      text: 'Tuesday 14:30 on Zoom works. I will send the calendar invite from Agenda.',
      time: '08:22',
    },
  ],
  'enc-chat3': [
    {
      id: 'enc-chat3m1',
      direction: 'in',
      text: 'Dr. Bennani, should I complete the API documentation task before the integration testing report?',
      time: '11:05',
      separatorBefore: '13 May 2026',
    },
    {
      id: 'enc-chat3m2',
      direction: 'out',
      text: 'Focus on integration test cases first — they unblock your progress review next week.',
      time: '11:18',
    },
    {
      id: 'enc-chat3m3',
      direction: 'in',
      text: 'Understood — I will prioritise the integration test cases first.',
      time: '11:24',
    },
  ],
  'enc-chat4': [
    {
      id: 'enc-chat4m1',
      direction: 'in',
      text: 'Good morning — my internship at SmartTech is progressing well. I completed the performance benchmarks this week.',
      time: '09:00',
      separatorBefore: '12 May 2026',
    },
    {
      id: 'enc-chat4m2',
      direction: 'out',
      text: 'Good progress, Karim. Please share a brief weekly summary with metrics and blockers for our supervision log.',
      time: '09:35',
    },
    {
      id: 'enc-chat4m3',
      direction: 'in',
      text: 'My internship progress is at 72% — I attached the weekly summary.',
      time: '17:40',
    },
  ],
};
