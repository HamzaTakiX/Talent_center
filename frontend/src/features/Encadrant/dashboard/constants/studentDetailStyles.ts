import { ENC_BADGE_SUCCESS, ENC_BADGE_WARNING } from '../../constants/encadrantTokens';
import type { StudentReportStatus } from '../types';

export const STUDENT_DETAIL_PROGRESS_FILL = 'bg-[var(--admin-brand)]';

export const STUDENT_REPORT_STATUS_STYLES: Record<
  StudentReportStatus,
  { badge: string; labelKey: string }
> = {
  validated: {
    badge: ENC_BADGE_SUCCESS,
    labelKey: 'encadrant.common.validated',
  },
  pending_review: {
    badge: ENC_BADGE_WARNING,
    labelKey: 'encadrant.common.pendingReview',
  },
};
