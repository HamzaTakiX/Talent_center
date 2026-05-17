import type { LucideIcon } from 'lucide-react';
import { Award, AlertTriangle, DollarSign } from 'lucide-react';

export interface ExemptedStudentsKpi {
  labelKey: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const exemptedStudentsKpis: ExemptedStudentsKpi[] = [
  { labelKey: 'admin.kpi.srf.cards.exempted.count', valueDisplay: '20', Icon: Award, iconBgClass: 'bg-[#2b7fff]' },
  { labelKey: 'admin.kpi.srf.cards.exempted.scholarship', valueDisplay: '15', Icon: Award, iconBgClass: 'bg-[#8b5cf6]' },
  { labelKey: 'admin.kpi.srf.cards.exempted.specialCases', valueDisplay: '5', Icon: AlertTriangle, iconBgClass: 'bg-[#f97316]' },
  { labelKey: 'admin.kpi.srf.cards.exempted.totalExemption', valueDisplay: '300K MAD', Icon: DollarSign, iconBgClass: 'bg-[#06b6d4]' },
];

export interface ExemptedStudentDetailRow {
  id: string;
  studentName: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
}

export const exemptedStudentsDetailRows: ExemptedStudentDetailRow[] = [
  {
    id: '1',
    studentName: 'Hassan Tazi',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 0,
    remaining: 15000,
  },
];
