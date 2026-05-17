import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Search, UserPlus, Briefcase } from 'lucide-react';

export interface WithoutInternshipCardStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

/** Cartes du détail « Without Internship » : icônes sur fond bleu comme la maquette. */
export const withoutInternshipCardStats: WithoutInternshipCardStat[] = [
  { label: 'Without Internship', value: 156, Icon: AlertTriangle, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Actively Searching', value: 89, Icon: Search, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Need Support', value: 45, Icon: UserPlus, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Applications Sent', value: 234, Icon: Briefcase, iconBgClass: 'bg-[#3b82f6]' }
];
