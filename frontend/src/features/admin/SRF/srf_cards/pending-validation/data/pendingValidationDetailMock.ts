import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Calendar, DollarSign, Clock } from 'lucide-react';

export interface PendingValidationKpi {
  labelKey: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const pendingValidationKpis: PendingValidationKpi[] = [
  { labelKey: 'admin.kpi.srf.cards.pending.count', valueDisplay: '12', Icon: AlertTriangle, iconBgClass: 'bg-[#eab308]' },
  { labelKey: 'admin.kpi.srf.cards.pending.submittedToday', valueDisplay: '4', Icon: Calendar, iconBgClass: 'bg-[#06b6d4]' },
  { labelKey: 'admin.kpi.srf.cards.pending.totalAmount', valueDisplay: '180K MAD', Icon: DollarSign, iconBgClass: 'bg-[#6366f1]' },
  { labelKey: 'admin.kpi.srf.cards.pending.awaitingAction', valueDisplay: '12', Icon: Clock, iconBgClass: 'bg-[#f97316]' },
];

export interface PendingValidationRow {
  id: string;
  studentName: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
}

export const pendingValidationDetailRows: PendingValidationRow[] = [
  {
    id: '1',
    studentName: 'Mohamed Idrissi',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 15000,
    remaining: 0,
  },
  {
    id: '2',
    studentName: 'Houda Tazi',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 15000,
    remaining: 0,
  },
  {
    id: '3',
    studentName: 'Yassine Berrada',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 15000,
    remaining: 0,
  },
];
