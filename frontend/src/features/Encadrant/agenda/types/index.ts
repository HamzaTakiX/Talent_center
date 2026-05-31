export type AgendaViewMode = 'week' | 'list';

export type AgendaSummaryTone = 'blue' | 'green' | 'purple' | 'red';

export type AgendaSummaryIcon = 'calendar' | 'clock' | 'calendarUpcoming' | 'alert';

export interface AgendaSummaryStat {
  label: string;
  value: number;
  tone: AgendaSummaryTone;
  icon: AgendaSummaryIcon;
}

export type AgendaMeetingType = 'in-person' | 'online';

export type AgendaMeetingStatus = 'upcoming' | 'completed' | 'missed';

export interface AgendaMeetingEvent {
  id: string;
  dayKey: string;
  time: string;
  student: string;
  title: string;
  duration: string;
  type: AgendaMeetingType;
  modalTitle: string;
  fullDateLabel: string;
  locationLabel: string;
  status: AgendaMeetingStatus;
  description: string;
  showJoinMeeting?: boolean;
}

export interface AgendaWeekDay {
  key: string;
  dayShort: string;
  dayNum: number;
  highlighted?: boolean;
}
