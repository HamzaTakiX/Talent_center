import type { ReportsSubmittedStudentStatus, ReportsSubmittedSummaryTone } from '../types';

export const REPORTS_SUBMITTED_SUMMARY_STYLES: Record<
  ReportsSubmittedSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: { iconBg: 'bg-[#3b82f6]', iconText: 'text-white' },
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
  red: { iconBg: 'bg-[#ef4444]', iconText: 'text-white' },
};

export const REPORTS_SUBMITTED_STATUS_STYLES: Record<
  ReportsSubmittedStudentStatus,
  { badgeBg: string; badgeText: string; label: string }
> = {
  on_track: { badgeBg: 'bg-[#dbeafe]', badgeText: 'text-[#1d4ed8]', label: 'On track' },
  at_risk: { badgeBg: 'bg-[#ffedd5]', badgeText: 'text-[#c2410c]', label: 'At risk' },
  ahead: { badgeBg: 'bg-[#dcfce7]', badgeText: 'text-[#15803d]', label: 'Ahead' },
  delayed: { badgeBg: 'bg-[#fee2e2]', badgeText: 'text-[#b91c1c]', label: 'Delayed' },
};

export const REPORTS_SUBMITTED_PROGRESS_FILL = 'bg-[#3b82f6]';
