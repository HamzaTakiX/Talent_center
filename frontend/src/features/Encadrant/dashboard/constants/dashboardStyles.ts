/** Styles — cartes stats, risques, barres de progression (Dashboard Encadrant). */

import type { DashboardStatTone, StudentRiskLevel } from '../types';

export const DASHBOARD_STAT_TONE_STYLES: Record<
  DashboardStatTone,
  { iconBg: string; iconText: string }
> = {
  blue: { iconBg: 'bg-[#2b7fff]', iconText: 'text-white' },
  red: { iconBg: 'bg-[#ef4444]', iconText: 'text-white' },
  orange: { iconBg: 'bg-[#f97316]', iconText: 'text-white' },
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
};

export const DASHBOARD_RISK_STYLES: Record<
  StudentRiskLevel,
  {
    dot: string;
    progress: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  low: {
    dot: 'bg-[#22c55e]',
    progress: 'bg-[#22c55e]',
    badgeBg: 'bg-[#dcfce7]',
    badgeText: 'text-[#15803d]',
  },
  medium: {
    dot: 'bg-[#f97316]',
    progress: 'bg-[#f97316]',
    badgeBg: 'bg-[#ffedd5]',
    badgeText: 'text-[#c2410c]',
  },
  high: {
    dot: 'bg-[#ef4444]',
    progress: 'bg-[#ef4444]',
    badgeBg: 'bg-[#fee2e2]',
    badgeText: 'text-[#b91c1c]',
  },
};
