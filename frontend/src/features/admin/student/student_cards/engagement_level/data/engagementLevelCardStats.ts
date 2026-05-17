import type { LucideIcon } from 'lucide-react';
import { TrendingUp, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export interface EngagementLevelCardStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
  valueSuffix?: string;
}

/** Cartes du détail « Engagement Level » (alignées sur la maquette). */
export const engagementLevelCardStats: EngagementLevelCardStat[] = [
  { label: 'Overall Engagement', value: 82, Icon: TrendingUp, iconBgClass: 'bg-[#22c55e]', valueSuffix: '%' },
  { label: 'Highly Engaged', value: 723, Icon: CheckCircle, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'At Risk', value: 156, Icon: AlertTriangle, iconBgClass: 'bg-[#f97316]' },
  { label: 'Avg. Activity Score', value: 8, Icon: Activity, iconBgClass: 'bg-[#a855f7]', valueSuffix: '.2/10' }
];
