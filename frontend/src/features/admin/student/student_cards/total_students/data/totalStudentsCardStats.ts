import type { LucideIcon } from 'lucide-react';
import { UserPlus, Calendar, CheckCircle, UserX } from 'lucide-react';

export interface TotalStudentsCardStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

/** Cartes du détail « Total Students » : icônes sur fond bleu comme la maquette. */
export const totalStudentsCardStats: TotalStudentsCardStat[] = [
  { label: 'Total Students', value: 1245, Icon: UserPlus, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'New This Month', value: 45, Icon: Calendar, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Active', value: 1156, Icon: CheckCircle, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Inactive', value: 89, Icon: UserX, iconBgClass: 'bg-[#3b82f6]' }
];
