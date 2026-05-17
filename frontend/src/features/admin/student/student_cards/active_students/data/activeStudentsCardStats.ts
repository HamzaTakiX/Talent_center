import type { LucideIcon } from 'lucide-react';
import { CheckCircle, Briefcase, TrendingUp, Activity } from 'lucide-react';

export interface ActiveStudentsCardStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
  valueSuffix?: string;
}

/** Cartes du détail « Active » : icônes bleues comme la maquette. */
export const activeStudentsCardStats: ActiveStudentsCardStat[] = [
  { label: 'Active Students', value: 1156, Icon: CheckCircle, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'With Internship', value: 1000, Icon: Briefcase, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Engagement Rate', value: 85, Icon: TrendingUp, iconBgClass: 'bg-[#3b82f6]', valueSuffix: '%' },
  { label: 'Attending Classes', value: 1100, Icon: Activity, iconBgClass: 'bg-[#3b82f6]' }
];
