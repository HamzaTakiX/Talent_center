import {
  ENC_BADGE_DANGER,
  ENC_BADGE_WARNING,
  ENC_TONE_ICON,
} from '../../../../constants/encadrantTokens';
import type { PendingReportStatus, ReportsPendingSummaryTone } from '../types';

export const REPORTS_PENDING_SUMMARY_STYLES: Record<
  ReportsPendingSummaryTone,
  { iconBg: string; iconText: string }
> = {
  orange: ENC_TONE_ICON.orange,
  red: ENC_TONE_ICON.red,
  green: ENC_TONE_ICON.green,
};

export const REPORTS_PENDING_STATUS_STYLES: Record<
  PendingReportStatus,
  { badge: string; labelKey: string }
> = {
  late: {
    badge: ENC_BADGE_DANGER,
    labelKey: 'encadrant.common.late',
  },
  pending: {
    badge: ENC_BADGE_WARNING,
    labelKey: 'encadrant.common.pending',
  },
};
