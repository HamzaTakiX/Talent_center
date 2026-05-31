import type { AssignedStudentsSummaryTone, AssignedStudentRiskLevel } from '../types';

export const ASSIGNED_STUDENTS_SUMMARY_STYLES: Record<
  AssignedStudentsSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: { iconBg: 'bg-[#2b7fff]', iconText: 'text-white' },
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
  gray: { iconBg: 'bg-[#64748b]', iconText: 'text-white' },
};

export const ASSIGNED_STUDENTS_RISK_STYLES: Record<
  AssignedStudentRiskLevel,
  { badgeBg: string; badgeText: string }
> = {
  low: { badgeBg: 'bg-[#dcfce7]', badgeText: 'text-[#15803d]' },
  medium: { badgeBg: 'bg-[#ffedd5]', badgeText: 'text-[#c2410c]' },
  high: { badgeBg: 'bg-[#fee2e2]', badgeText: 'text-[#b91c1c]' },
};

export const ASSIGNED_STUDENTS_PROGRESS_FILL = 'bg-[#2b7fff]';
