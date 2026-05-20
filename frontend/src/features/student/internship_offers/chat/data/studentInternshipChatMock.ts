import type { ChatMessage, ChatParticipant } from '../types';

export const studentInternshipChatParticipants: ChatParticipant[] = [
  {
    id: 'st-io1',
    initials: 'TC',
    title: 'Talent Center • Offers desk',
    lastPreview: 'Your application for Full-Stack Intern #TC-026 is under review.',
    timeLabel: '10:41',
    unreadCount: 2,
  },
  {
    id: 'st-io2',
    initials: 'TM',
    title: 'TechCorp Morocco • Full-Stack Intern #TC-026',
    lastPreview: 'Could you confirm if the React + Node stack test is mandatory before the interview?',
    timeLabel: 'Yesterday',
    unreadCount: 1,
  },
  {
    id: 'st-io3',
    initials: 'IS',
    title: 'Innovatech Solutions • Backend Intern',
    lastPreview: 'Thanks for applying — we received your CV and will reply within 48h.',
    timeLabel: '2 days ago',
    unreadCount: 0,
  },
  {
    id: 'st-io4',
    initials: 'DA',
    title: 'DataHub Analytics • Data Analyst Intern',
    lastPreview: 'The offer mentions SQL + Python; is Power BI experience required or optional?',
    timeLabel: 'Apr 14',
    unreadCount: 0,
  },
];

export const studentInternshipChatInitialMessages: Record<string, ChatMessage[]> = {
  'st-io1': [
    {
      id: 'st-io1m1',
      direction: 'in',
      text: 'Hi — you applied to Full-Stack Intern #TC-026. Do you want us to notify TechCorp that you accept their technical test slot?',
      time: '09:02',
      separatorBefore: '2 May 2026',
    },
    {
      id: 'st-io1m2',
      direction: 'out',
      text: 'Yes please — Thursday 14:00 works for me. I also uploaded the updated CV with my latest project.',
      time: '09:14',
    },
    {
      id: 'st-io1m3',
      direction: 'in',
      text: 'Your application for Full-Stack Intern #TC-026 is under review. We will confirm once HR validates your documents.',
      time: '10:41',
    },
  ],
  'st-io2': [
    {
      id: 'st-io2m1',
      direction: 'in',
      text: 'Welcome! For #TC-026 we expect 3rd-year engineering students with internship agreement signed.',
      time: '16:20',
      separatorBefore: '30 Apr 2026',
    },
    {
      id: 'st-io2m2',
      direction: 'out',
      text: 'I submitted my application yesterday. Could you clarify the on-site days per week for this role?',
      time: '16:45',
    },
    {
      id: 'st-io2m3',
      direction: 'out',
      text: 'Could you confirm if the React + Node stack test is mandatory before the interview?',
      time: '11:06',
    },
  ],
  'st-io3': [
    {
      id: 'st-io3m1',
      direction: 'out',
      text: 'Hello — I applied to the Backend Intern role. Is there a preferred framework for the take-home task?',
      time: '14:12',
      separatorBefore: '28 Apr 2026',
    },
    {
      id: 'st-io3m2',
      direction: 'in',
      text: 'Thanks for applying — we received your CV and will reply within 48h. Spring Boot or Express is fine.',
      time: '15:30',
    },
  ],
  'st-io4': [
    {
      id: 'st-io4m1',
      direction: 'out',
      text: 'The offer mentions SQL + Python; is Power BI experience required or optional?',
      time: '08:52',
      separatorBefore: '14 Apr 2026',
    },
    {
      id: 'st-io4m2',
      direction: 'in',
      text: 'Power BI is optional — we prioritize SQL dashboards and a short Python notebook for the case study.',
      time: '09:07',
    },
  ],
};
