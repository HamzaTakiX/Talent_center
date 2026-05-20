export type AgendaEventKind = 'meeting' | 'deadline' | 'evaluation';

export type AgendaEventPriority = 'high' | 'medium';

export interface AgendaEventItem {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  timeLabel?: string;
  kind: AgendaEventKind;
  priority?: AgendaEventPriority;
  actionLabel?: string;
}

export interface AgendaCalendarConfig {
  monthLabel: string;
  year: number;
  monthIndex: number;
  selectedDay: number;
}

export interface AgendaLegendItem {
  id: string;
  label: string;
  dotClassName: string;
}
