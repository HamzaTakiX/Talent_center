import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Ban,
  Award,
} from 'lucide-react';

export type {
  StudentFinancialRowStatus,
  StudentFinancialTableRow,
} from '../../api/srf';

export interface StudentFinancialSummaryStat {
  label: string;
  labelKey?: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const studentFinancialSummaryStats: StudentFinancialSummaryStat[] = [
  {
    label: 'Paid Students',
    labelKey: 'admin.kpi.srf.paidStudents',
    value: 1102,
    Icon: CheckCircle,
    iconBgClass: 'bg-[#22c55e]',
  },
  {
    label: 'Unpaid Students',
    labelKey: 'admin.kpi.srf.unpaidStudents',
    value: 89,
    Icon: XCircle,
    iconBgClass: 'bg-[#ef4444]',
  },
  {
    label: 'Partially Paid',
    labelKey: 'admin.kpi.srf.partiallyPaid',
    value: 34,
    Icon: Clock,
    iconBgClass: 'bg-[#f97316]',
  },
  {
    label: 'Pending Validation',
    labelKey: 'admin.kpi.srf.pendingValidation',
    value: 12,
    Icon: AlertTriangle,
    iconBgClass: 'bg-[#eab308]',
  },
  {
    label: 'Late Payments',
    labelKey: 'admin.kpi.srf.latePayments',
    value: 23,
    Icon: AlertTriangle,
    iconBgClass: 'bg-[#f43f5e]',
  },
  {
    label: 'Blocked Students',
    labelKey: 'admin.kpi.srf.blockedStudents',
    value: 5,
    Icon: Ban,
    iconBgClass: 'bg-[#475569]',
  },
  {
    label: 'Exempted Students',
    labelKey: 'admin.kpi.srf.exemptedStudents',
    value: 20,
    Icon: Award,
    iconBgClass: 'bg-[#2b7fff]',
  },
];

import type { StudentFinancialTableRow } from '../../api/srf';

export const studentFinancialTableRows: StudentFinancialTableRow[] = [
  {
    id: '1',
    studentName: 'Sarah Alami',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 15000,
    status: 'Paid',
  },
  {
    id: '2',
    studentName: 'Youssef Benani',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 0,
    status: 'Unpaid',
  },
  {
    id: '3',
    studentName: 'Amina Khalil',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 10000,
    status: 'Partially Paid',
  },
  {
    id: '4',
    studentName: 'Mohamed Idrissi',
    className: 'Master 1',
    amountDue: 15000,
    amountPaid: 15000,
    status: 'Pending Validation',
  },
  {
    id: '5',
    studentName: 'Fatima Zahra',
    className: 'Master 2',
    amountDue: 15000,
    amountPaid: 5000,
    status: 'Late',
  },
];
