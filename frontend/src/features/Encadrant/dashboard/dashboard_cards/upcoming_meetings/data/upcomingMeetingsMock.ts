import type { UpcomingMeeting, UpcomingMeetingsSummaryStat } from '../types';

export const upcomingMeetingsSummaryMock: UpcomingMeetingsSummaryStat[] = [
  { label: 'Today', value: 0, tone: 'blue', icon: 'calendar' },
  { label: 'This Week', value: 0, tone: 'green', icon: 'clock' },
  { label: 'Missed Meetings', value: 0, tone: 'red', icon: 'missed' },
];

export const upcomingMeetingsMock: UpcomingMeeting[] = [
  {
    id: '1',
    student: 'Sarah Alami',
    date: 'mercredi 22 avril',
    time: '10:00',
    duration: '1h',
    location: 'Room 301',
    type: 'in-person',
    typeLabel: 'In-Person',
    showJoinMeeting: false,
  },
  {
    id: '2',
    student: 'Youssef Benani',
    date: 'mardi 21 avril',
    time: '14:30',
    duration: '45min',
    location: 'Zoom',
    type: 'online',
    typeLabel: 'Online',
    showJoinMeeting: true,
  },
  {
    id: '3',
    student: 'Amina Khalil',
    date: 'jeudi 23 avril',
    time: '11:00',
    duration: '1h 30min',
    location: 'Room 205',
    type: 'in-person',
    typeLabel: 'In-Person',
    showJoinMeeting: false,
  },
];
