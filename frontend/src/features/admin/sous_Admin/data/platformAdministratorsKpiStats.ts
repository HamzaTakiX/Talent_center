import { UserCog, Briefcase, DollarSign, FileText, Megaphone } from 'lucide-react';
import type { PlatformAdministratorsKpiStat } from '../types/platformAdministrators';

/** Cartes récapitulatives au-dessus du tableau (maquette). */
export const platformAdministratorsKpiStats: PlatformAdministratorsKpiStat[] = [
  {
    label: 'Total Admins',
    labelKey: 'administrators.totalAdmins',
    statKey: 'total',
    value: 12,
    Icon: UserCog,
    iconBgClass: 'bg-[#a855f7]',
  },
  {
    label: 'Admin Stage',
    labelKey: 'administrators.stage',
    statKey: 'stage',
    value: 3,
    Icon: Briefcase,
    iconBgClass: 'bg-[#3b82f6]',
  },
  {
    label: 'Admin Finance',
    labelKey: 'administrators.finance',
    statKey: 'finance',
    value: 2,
    Icon: DollarSign,
    iconBgClass: 'bg-[#22c55e]',
  },
  {
    label: 'Admin Documents',
    labelKey: 'administrators.documents',
    statKey: 'documents',
    value: 4,
    Icon: FileText,
    iconBgClass: 'bg-[#f97316]',
  },
  {
    label: 'Admin Communication',
    labelKey: 'administrators.communication',
    statKey: 'communication',
    value: 3,
    Icon: Megaphone,
    iconBgClass: 'bg-[#6366f1]',
  },
];
