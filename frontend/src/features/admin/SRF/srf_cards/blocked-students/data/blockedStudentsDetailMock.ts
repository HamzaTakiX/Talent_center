import type { LucideIcon } from 'lucide-react';
import { Ban, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

export interface BlockedStudentsKpi {
  labelKey: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const blockedStudentsKpis: BlockedStudentsKpi[] = [
  { labelKey: 'admin.kpi.srf.cards.blocked.count', valueDisplay: '5', Icon: Ban, iconBgClass: 'bg-[#6b7280]' },
  { labelKey: 'admin.kpi.srf.cards.blocked.pendingResolution', valueDisplay: '5', Icon: Clock, iconBgClass: 'bg-[#f97316]' },
  { labelKey: 'admin.kpi.srf.cards.blocked.totalDebt', valueDisplay: '75K MAD', Icon: DollarSign, iconBgClass: 'bg-[#ef4444]' },
  { labelKey: 'admin.kpi.srf.cards.blocked.unblockedThisMonth', valueDisplay: '2', Icon: CheckCircle2, iconBgClass: 'bg-[#22c55e]' },
];

export interface BlockedStudentDetailRow {
  id: string;
  studentName: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
}

export const blockedStudentsDetailRows: BlockedStudentDetailRow[] = [
  {
    id: '1',
    studentName: 'Nadia Serraj',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 0,
    remaining: 15000,
  },
];
