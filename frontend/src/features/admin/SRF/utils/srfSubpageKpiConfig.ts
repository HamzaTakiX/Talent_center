import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Award,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import type { StudentFinancialTableRow } from '../../api/srf';
import type { SrfDashboardSummary } from '../../api/srf';
import type { SrfSubpageId } from '../constants';
import type { SrfDetailKpiItem } from '../components/SrfDetailKpiGrid';

export interface SrfSubpageKpiTemplate {
  labelKey: string;
  Icon: LucideIcon;
  iconBgClass: string;
  compute: (ctx: SrfKpiComputeContext) => string;
}

export interface SrfKpiComputeContext {
  rows: StudentFinancialTableRow[];
  kpiValue: number;
  summary: SrfDashboardSummary | null;
  installmentCompletionPct: number | null;
}

const mad = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M MAD`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K MAD`;
  return `${Math.round(n).toLocaleString()} MAD`;
};

const sum = (rows: StudentFinancialTableRow[], field: 'amountDue' | 'amountPaid') =>
  rows.reduce((acc, r) => acc + r[field], 0);

const remaining = (rows: StudentFinancialTableRow[]) =>
  rows.reduce((acc, r) => acc + Math.max(r.amountDue - r.amountPaid, 0), 0);

export const SRF_SUBPAGE_KPI_TEMPLATES: Record<SrfSubpageId, SrfSubpageKpiTemplate[]> = {
  'paid-students': [
    {
      labelKey: 'admin.kpi.srf.paid.totalPaid',
      Icon: CheckCircle2,
      iconBgClass: 'bg-[#22c55e]',
      compute: ({ kpiValue, rows }) => String(kpiValue || rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.paid.thisMonth',
      Icon: Calendar,
      iconBgClass: 'bg-[#06b6d4]',
      compute: ({ rows }) => String(rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.paid.totalAmount',
      Icon: DollarSign,
      iconBgClass: 'bg-[#6366f1]',
      compute: ({ rows }) => mad(sum(rows, 'amountPaid')),
    },
    {
      labelKey: 'admin.kpi.srf.paid.completionRate',
      Icon: TrendingUp,
      iconBgClass: 'bg-[#2b7fff]',
      compute: ({ installmentCompletionPct }) =>
        installmentCompletionPct != null ? `${installmentCompletionPct}%` : '—',
    },
  ],
  'unpaid-students': [
    {
      labelKey: 'admin.kpi.srf.cards.unpaid.totalUnpaid',
      Icon: XCircle,
      iconBgClass: 'bg-[#ef4444]',
      compute: ({ kpiValue, rows }) => String(kpiValue || rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.unpaid.dueThisWeek',
      Icon: Calendar,
      iconBgClass: 'bg-[#f97316]',
      compute: ({ rows }) => String(rows.filter((r) => r.status === 'Late').length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.unpaid.totalOutstanding',
      Icon: DollarSign,
      iconBgClass: 'bg-[#dc2626]',
      compute: ({ rows }) => mad(remaining(rows)),
    },
    {
      labelKey: 'admin.kpi.srf.cards.unpaid.atRisk',
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#eab308]',
      compute: ({ summary }) => String(summary?.at_risk_students ?? 0),
    },
  ],
  'partially-paid': [
    {
      labelKey: 'admin.kpi.srf.cards.partiallyPaid.count',
      Icon: Clock,
      iconBgClass: 'bg-[#f97316]',
      compute: ({ kpiValue, rows }) => String(kpiValue || rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.partiallyPaid.avgPayment',
      Icon: DollarSign,
      iconBgClass: 'bg-[#06b6d4]',
      compute: ({ rows }) => {
        if (!rows.length) return '0 MAD';
        return mad(sum(rows, 'amountPaid') / rows.length);
      },
    },
    {
      labelKey: 'admin.kpi.srf.cards.partiallyPaid.totalCollected',
      Icon: CheckCircle2,
      iconBgClass: 'bg-[#22c55e]',
      compute: ({ rows }) => mad(sum(rows, 'amountPaid')),
    },
    {
      labelKey: 'admin.kpi.srf.cards.partiallyPaid.totalRemaining',
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#ef4444]',
      compute: ({ rows }) => mad(remaining(rows)),
    },
  ],
  'pending-validation': [
    {
      labelKey: 'admin.kpi.srf.cards.pending.count',
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#eab308]',
      compute: ({ kpiValue, summary }) => {
        const value = kpiValue ? kpiValue : summary?.pending_validations;
        return String(value ?? 0);
      },
    },
    {
      labelKey: 'admin.kpi.srf.cards.pending.submittedToday',
      Icon: Calendar,
      iconBgClass: 'bg-[#06b6d4]',
      compute: ({ kpiValue }) => String(kpiValue),
    },
    {
      labelKey: 'admin.kpi.srf.cards.pending.totalAmount',
      Icon: DollarSign,
      iconBgClass: 'bg-[#6366f1]',
      compute: ({ rows }) => mad(sum(rows, 'amountPaid')),
    },
    {
      labelKey: 'admin.kpi.srf.cards.pending.awaitingAction',
      Icon: Clock,
      iconBgClass: 'bg-[#f97316]',
      compute: ({ kpiValue, summary }) => {
        const value = kpiValue ? kpiValue : summary?.pending_validations;
        return String(value ?? 0);
      },
    },
  ],
  'late-payments': [
    {
      labelKey: 'admin.kpi.srf.cards.late.latePayments',
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#f43f5e]',
      compute: ({ kpiValue, rows }) => String(kpiValue || rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.late.overdue30Days',
      Icon: XCircle,
      iconBgClass: 'bg-[#ef4444]',
      compute: ({ rows }) => String(rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.late.totalOverdue',
      Icon: DollarSign,
      iconBgClass: 'bg-[#dc2626]',
      compute: ({ rows }) => mad(remaining(rows)),
    },
    {
      labelKey: 'admin.kpi.srf.cards.late.averageDebt',
      Icon: TrendingUp,
      iconBgClass: 'bg-[#f97316]',
      compute: ({ rows }) => {
        if (!rows.length) return '0 MAD';
        return mad(remaining(rows) / rows.length);
      },
    },
  ],
  'blocked-students': [
    {
      labelKey: 'admin.kpi.srf.cards.blocked.count',
      Icon: Ban,
      iconBgClass: 'bg-[#6b7280]',
      compute: ({ kpiValue, rows }) => String(kpiValue || rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.blocked.pendingResolution',
      Icon: Clock,
      iconBgClass: 'bg-[#f97316]',
      compute: ({ rows }) => String(rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.blocked.totalDebt',
      Icon: DollarSign,
      iconBgClass: 'bg-[#ef4444]',
      compute: ({ rows }) => mad(remaining(rows)),
    },
    {
      labelKey: 'admin.kpi.srf.cards.blocked.unblockedThisMonth',
      Icon: CheckCircle2,
      iconBgClass: 'bg-[#22c55e]',
      compute: () => '0',
    },
  ],
  'exempted-students': [
    {
      labelKey: 'admin.kpi.srf.cards.exempted.count',
      Icon: Award,
      iconBgClass: 'bg-[#2b7fff]',
      compute: ({ kpiValue, rows }) => String(kpiValue || rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.exempted.scholarship',
      Icon: Award,
      iconBgClass: 'bg-[#8b5cf6]',
      compute: ({ rows }) => String(rows.length),
    },
    {
      labelKey: 'admin.kpi.srf.cards.exempted.specialCases',
      Icon: AlertTriangle,
      iconBgClass: 'bg-[#f97316]',
      compute: () => '0',
    },
    {
      labelKey: 'admin.kpi.srf.cards.exempted.totalExemption',
      Icon: DollarSign,
      iconBgClass: 'bg-[#06b6d4]',
      compute: ({ rows }) => mad(sum(rows, 'amountDue')),
    },
  ],
};

export function buildSubpageKpiItems(
  subpageId: SrfSubpageId,
  ctx: SrfKpiComputeContext,
): SrfDetailKpiItem[] {
  return SRF_SUBPAGE_KPI_TEMPLATES[subpageId].map((tpl) => ({
    labelKey: tpl.labelKey,
    valueDisplay: tpl.compute(ctx),
    Icon: tpl.Icon,
    iconBgClass: tpl.iconBgClass,
  }));
}
