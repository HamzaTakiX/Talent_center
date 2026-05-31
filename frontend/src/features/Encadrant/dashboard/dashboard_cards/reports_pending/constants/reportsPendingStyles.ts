import type { PendingReportStatus, ReportsPendingSummaryTone } from '../types';

export const REPORTS_PENDING_SUMMARY_STYLES: Record<
  ReportsPendingSummaryTone,
  { iconBg: string; iconText: string }
> = {
  orange: { iconBg: 'bg-[#f97316]', iconText: 'text-white' },
  red: { iconBg: 'bg-[#ef4444]', iconText: 'text-white' },
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
};

export const REPORTS_PENDING_STATUS_STYLES: Record<
  PendingReportStatus,
  { badge: string; label: string }
> = {
  late: {
    badge: 'bg-[#fee2e2] text-[#b91c1c]',
    label: 'Late',
  },
  pending: {
    badge: 'bg-[#fef9c3] text-[#a16207]',
    label: 'Pending',
  },
};
