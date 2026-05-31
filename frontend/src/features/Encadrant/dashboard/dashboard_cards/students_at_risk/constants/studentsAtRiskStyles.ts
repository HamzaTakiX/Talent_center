import type { StudentsAtRiskLevel, StudentsAtRiskSummaryTone } from '../types';

export const STUDENTS_AT_RISK_SUMMARY_STYLES: Record<
  StudentsAtRiskSummaryTone,
  { iconBg: string; iconText: string }
> = {
  red: { iconBg: 'bg-[#ef4444]', iconText: 'text-white' },
  orange: { iconBg: 'bg-[#f97316]', iconText: 'text-white' },
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
};

export const STUDENTS_AT_RISK_ALERT_STYLES: Record<
  StudentsAtRiskLevel,
  {
    card: string;
    border: string;
    iconCircle: string;
    badgeBg: string;
    badgeText: string;
    factorBadge: string;
  }
> = {
  high: {
    card: 'bg-[#fef2f2]',
    border: 'border-l-4 border-l-[#ef4444]',
    iconCircle: 'bg-[#ef4444] text-white',
    badgeBg: 'bg-[#fee2e2]',
    badgeText: 'text-[#b91c1c]',
    factorBadge: 'bg-[#fee2e2] text-[#b91c1c]',
  },
  medium: {
    card: 'bg-[#fff7ed]',
    border: 'border-l-4 border-l-[#f97316]',
    iconCircle: 'bg-[#f97316] text-white',
    badgeBg: 'bg-[#ffedd5]',
    badgeText: 'text-[#c2410c]',
    factorBadge: 'bg-[#ffedd5] text-[#c2410c]',
  },
  low: {
    card: 'bg-[#f0fdf4]',
    border: 'border-l-4 border-l-[#22c55e]',
    iconCircle: 'bg-[#22c55e] text-white',
    badgeBg: 'bg-[#dcfce7]',
    badgeText: 'text-[#15803d]',
    factorBadge: 'bg-[#dcfce7] text-[#15803d]',
  },
};
