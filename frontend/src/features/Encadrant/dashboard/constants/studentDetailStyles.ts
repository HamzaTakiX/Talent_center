import type { StudentReportStatus } from '../types';

export const STUDENT_DETAIL_PROGRESS_FILL = 'bg-[#2b7fff]';

export const STUDENT_REPORT_STATUS_STYLES: Record<
  StudentReportStatus,
  { badgeBg: string; badgeText: string }
> = {
  validated: {
    badgeBg: 'bg-[#dcfce7]',
    badgeText: 'text-[#15803d]',
  },
  pending_review: {
    badgeBg: 'bg-[#fef3c7]',
    badgeText: 'text-[#b45309]',
  },
};
