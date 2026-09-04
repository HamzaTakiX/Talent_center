import {
  ENC_BADGE_DANGER,
  ENC_BADGE_INFO,
  ENC_BADGE_SUCCESS,
  ENC_BADGE_WARNING,
  ENC_TONE_ICON,
} from '../../../../constants/encadrantTokens';
import type { ReportsValidatedStudentStatus, ReportsValidatedSummaryTone } from '../types';

export const REPORTS_VALIDATED_SUMMARY_STYLES: Record<
  ReportsValidatedSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: ENC_TONE_ICON.blue,
  green: ENC_TONE_ICON.green,
  red: ENC_TONE_ICON.red,
};

export const REPORTS_VALIDATED_STATUS_STYLES: Record<
  ReportsValidatedStudentStatus,
  { badge: string; labelKey: string }
> = {
  on_track: { badge: ENC_BADGE_INFO, labelKey: 'encadrant.reports.status.onTrack' },
  at_risk: { badge: ENC_BADGE_WARNING, labelKey: 'encadrant.reports.status.atRisk' },
  ahead: { badge: ENC_BADGE_SUCCESS, labelKey: 'encadrant.reports.status.ahead' },
  delayed: { badge: ENC_BADGE_DANGER, labelKey: 'encadrant.reports.status.delayed' },
};

export const REPORTS_VALIDATED_PROGRESS_FILL = 'bg-[#059669]';
