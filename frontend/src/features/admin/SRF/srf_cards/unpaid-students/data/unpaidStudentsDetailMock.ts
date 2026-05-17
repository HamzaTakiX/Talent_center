import type { LucideIcon } from 'lucide-react';
import { XCircle, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

export interface UnpaidStudentsKpi {
  labelKey: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const unpaidStudentsKpis: UnpaidStudentsKpi[] = [
  { labelKey: 'admin.kpi.srf.cards.unpaid.totalUnpaid', valueDisplay: '89', Icon: XCircle, iconBgClass: 'bg-[#ef4444]' },
  { labelKey: 'admin.kpi.srf.cards.unpaid.dueThisWeek', valueDisplay: '23', Icon: Calendar, iconBgClass: 'bg-[#f97316]' },
  { labelKey: 'admin.kpi.srf.cards.unpaid.totalOutstanding', valueDisplay: '1.3M MAD', Icon: DollarSign, iconBgClass: 'bg-[#dc2626]' },
  { labelKey: 'admin.kpi.srf.cards.unpaid.atRisk', valueDisplay: '45', Icon: AlertTriangle, iconBgClass: 'bg-[#eab308]' },
];

export interface UnpaidStudentDetailRow {
  id: string;
  studentName: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
}

export const unpaidStudentsDetailRows: UnpaidStudentDetailRow[] = [
  {
    id: '1',
    studentName: 'Karim El Fassi',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 0,
    remaining: 15000,
  },
  {
    id: '2',
    studentName: 'Nadia Berrada',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 5000,
    remaining: 10000,
  },
];
