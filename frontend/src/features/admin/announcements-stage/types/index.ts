export type AnnouncementType = string;

export interface AnnouncementRow {
  id: string;
  title: string;
  type: string;
  typeCode?: string;
  status?: string;
  priority?: string;
  targetAudience: string;
  date: string;
  views?: number;
  engagement?: number;
  company?: string;
  deadline?: string | null;
}

export interface AnnouncementStat {
  label: string;
  labelKey?: string;
  statKey?: string;
  value: string;
  icon: 'Bell' | 'Megaphone' | 'TrendingUp' | 'Users';
}
