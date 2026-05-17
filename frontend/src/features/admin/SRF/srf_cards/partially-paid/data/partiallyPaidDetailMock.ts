import type { LucideIcon } from 'lucide-react';
import { Clock, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface PartiallyPaidKpi {
  labelKey: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const partiallyPaidKpis: PartiallyPaidKpi[] = [
  { labelKey: 'admin.kpi.srf.cards.partiallyPaid.count', valueDisplay: '34', Icon: Clock, iconBgClass: 'bg-[#f97316]' },
  { labelKey: 'admin.kpi.srf.cards.partiallyPaid.avgPayment', valueDisplay: '8,500 MAD', Icon: DollarSign, iconBgClass: 'bg-[#06b6d4]' },
  { labelKey: 'admin.kpi.srf.cards.partiallyPaid.totalCollected', valueDisplay: '289K MAD', Icon: CheckCircle2, iconBgClass: 'bg-[#22c55e]' },
  { labelKey: 'admin.kpi.srf.cards.partiallyPaid.totalRemaining', valueDisplay: '221K MAD', Icon: AlertTriangle, iconBgClass: 'bg-[#ef4444]' },
];

export interface PartiallyPaidStudentRow {
  id: string;
  studentName: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
}

export const partiallyPaidDetailRows: PartiallyPaidStudentRow[] = [
  {
    id: '1',
    studentName: 'Amina Khalil',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 10000,
    remaining: 5000,
  },
  {
    id: '2',
    studentName: 'Karim El Fassi',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 7500,
    remaining: 7500,
  },
  {
    id: '3',
    studentName: 'Mehdi Lamrani',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 12000,
    remaining: 3000,
  },
];
