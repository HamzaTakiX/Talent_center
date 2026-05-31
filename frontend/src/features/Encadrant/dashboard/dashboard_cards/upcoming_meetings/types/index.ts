export type UpcomingMeetingsSummaryTone = 'blue' | 'green' | 'red';

export type UpcomingMeetingsSummaryIcon = 'calendar' | 'clock' | 'missed';

export interface UpcomingMeetingsSummaryStat {
  label: string;
  value: number;
  tone: UpcomingMeetingsSummaryTone;
  icon: UpcomingMeetingsSummaryIcon;
}

export type MeetingType = 'in-person' | 'online';

export interface UpcomingMeeting {
  id: string;
  student: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  type: MeetingType;
  typeLabel: string;
  showJoinMeeting: boolean;
}
