export type AnnouncementType = 'Event' | 'Interview' | 'Info';

export interface AnnouncementRow {
  id: string;
  title: string;
  type: AnnouncementType;
  targetAudience: string;
  date: string;
}

export interface AnnouncementStat {
  label: string;
  labelKey?: string;
  statKey?: string;
  value: string;
  icon: 'Bell' | 'Megaphone' | 'TrendingUp' | 'Users';
}
