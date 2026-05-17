import type { LucideIcon } from 'lucide-react';
import { Briefcase, Activity, CheckCircle, TrendingUp } from 'lucide-react';

export interface WithInternshipCardStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
  valueSuffix?: string;
}

/** Cartes du détail « With Internship » : icônes bleues comme la maquette. */
export const withInternshipCardStats: WithInternshipCardStat[] = [
  { label: 'With Internship', value: 1089, Icon: Briefcase, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'In Progress', value: 890, Icon: Activity, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Completed', value: 199, Icon: CheckCircle, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Success Rate', value: 92, Icon: TrendingUp, iconBgClass: 'bg-[#3b82f6]', valueSuffix: '%' }
];
