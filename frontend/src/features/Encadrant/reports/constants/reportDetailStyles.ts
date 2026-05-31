import type { ReportRowStatus } from '../types';

export const REPORT_ROW_STATUS_STYLES: Record<
  ReportRowStatus,
  { badgeBg: string; badgeText: string; label: string }
> = {
  pending: {
    badgeBg: 'bg-[#fef9c3]',
    badgeText: 'text-[#a16207]',
    label: 'Pending',
  },
  validated: {
    badgeBg: 'bg-[#dcfce7]',
    badgeText: 'text-[#15803d]',
    label: 'Validated',
  },
};
