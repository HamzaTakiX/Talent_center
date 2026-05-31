import type { ReportStudentStatus, ReportsSummaryTone } from '../types';

export const REPORTS_SUMMARY_STYLES: Record<
  ReportsSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: { iconBg: 'bg-[#3b82f6]', iconText: 'text-white' },
  orange: { iconBg: 'bg-[#f97316]', iconText: 'text-white' },
  red: { iconBg: 'bg-[#ef4444]', iconText: 'text-white' },
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
};

export const REPORTS_STATUS_STYLES: Record<
  ReportStudentStatus,
  {
    badgeBg: string;
    badgeText: string;
    progress: string;
    label: string;
  }
> = {
  on_track: {
    badgeBg: 'bg-[#dbeafe]',
    badgeText: 'text-[#1d4ed8]',
    progress: 'bg-[#3b82f6]',
    label: 'On track',
  },
  at_risk: {
    badgeBg: 'bg-[#ffedd5]',
    badgeText: 'text-[#c2410c]',
    progress: 'bg-[#f97316]',
    label: 'At risk',
  },
  ahead: {
    badgeBg: 'bg-[#dcfce7]',
    badgeText: 'text-[#15803d]',
    progress: 'bg-[#22c55e]',
    label: 'Ahead',
  },
  delayed: {
    badgeBg: 'bg-[#fee2e2]',
    badgeText: 'text-[#b91c1c]',
    progress: 'bg-[#ef4444]',
    label: 'Delayed',
  },
};
