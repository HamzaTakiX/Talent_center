import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export interface PaidStudentsKpi {
  labelKey: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const paidStudentsKpis: PaidStudentsKpi[] = [
  { labelKey: 'admin.kpi.srf.paid.totalPaid', valueDisplay: '1,102', Icon: CheckCircle2, iconBgClass: 'bg-[#22c55e]' },
  { labelKey: 'admin.kpi.srf.paid.thisMonth', valueDisplay: '234', Icon: Calendar, iconBgClass: 'bg-[#06b6d4]' },
  { labelKey: 'admin.kpi.srf.paid.totalAmount', valueDisplay: '16.5M MAD', Icon: DollarSign, iconBgClass: 'bg-[#6366f1]' },
  { labelKey: 'admin.kpi.srf.paid.completionRate', valueDisplay: '88%', Icon: TrendingUp, iconBgClass: 'bg-[#2b7fff]' },
];

export interface PaidStudentDetailRow {
  id: string;
  studentName: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
}

export const paidStudentsDetailRows: PaidStudentDetailRow[] = [
  {
    id: '1',
    studentName: 'Sarah Alami',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 15000,
    remaining: 0,
  },
  {
    id: '2',
    studentName: 'Omar Benjelloun',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 15000,
    remaining: 0,
  },
  {
    id: '3',
    studentName: 'Salma Benkirane',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 15000,
    remaining: 0,
  },
];
