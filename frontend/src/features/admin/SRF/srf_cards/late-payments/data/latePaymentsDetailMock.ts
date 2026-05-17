import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, XCircle, DollarSign, TrendingUp } from 'lucide-react';

export interface LatePaymentsKpi {
  labelKey: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const latePaymentsKpis: LatePaymentsKpi[] = [
  { labelKey: 'admin.kpi.srf.cards.late.latePayments', valueDisplay: '23', Icon: AlertTriangle, iconBgClass: 'bg-[#f43f5e]' },
  { labelKey: 'admin.kpi.srf.cards.late.overdue30Days', valueDisplay: '8', Icon: XCircle, iconBgClass: 'bg-[#ef4444]' },
  { labelKey: 'admin.kpi.srf.cards.late.totalOverdue', valueDisplay: '345K MAD', Icon: DollarSign, iconBgClass: 'bg-[#dc2626]' },
  { labelKey: 'admin.kpi.srf.cards.late.averageDebt', valueDisplay: '15K MAD', Icon: TrendingUp, iconBgClass: 'bg-[#f97316]' },
];

export interface LatePaymentStudentRow {
  id: string;
  studentName: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
}

export const latePaymentsDetailRows: LatePaymentStudentRow[] = [
  {
    id: '1',
    studentName: 'Fatima Zahra',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 5000,
    remaining: 10000,
  },
  {
    id: '2',
    studentName: 'Rachid Alaoui',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 3000,
    remaining: 12000,
  },
];
