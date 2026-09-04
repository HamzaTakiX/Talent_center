import { ENC_BADGE_INFO, ENC_BADGE_SUCCESS, ENC_BADGE_WARNING } from '../../constants/encadrantTokens';
import type { ReportRowStatus } from '../types';

/** Aligned with Student/Admin REPORT_STATUS_BADGE: Pending=warning, Submitted=info, Validated=success */
export const REPORT_ROW_STATUS_STYLES: Record<
  ReportRowStatus,
  { badge: string; labelKey: string }
> = {
  pending: {
    badge: ENC_BADGE_WARNING,
    labelKey: 'encadrant.common.pending',
  },
  validated: {
    badge: ENC_BADGE_SUCCESS,
    labelKey: 'encadrant.common.validated',
  },
};

/** Extra mapping for submitted-style rows when present in UI copy. */
export const REPORT_SUBMITTED_BADGE = ENC_BADGE_INFO;
