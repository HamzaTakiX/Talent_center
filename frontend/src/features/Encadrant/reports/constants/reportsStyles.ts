import {
  ENC_BADGE_DANGER,
  ENC_BADGE_INFO,
  ENC_BADGE_SUCCESS,
  ENC_BADGE_WARNING,
  ENC_TONE_ICON,
} from '../../constants/encadrantTokens';
import type { ReportStudentStatus, ReportsSummaryTone } from '../types';

export const REPORTS_SUMMARY_STYLES: Record<
  ReportsSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: ENC_TONE_ICON.blue,
  orange: ENC_TONE_ICON.orange,
  red: ENC_TONE_ICON.red,
  green: ENC_TONE_ICON.green,
};

export const REPORTS_STATUS_STYLES: Record<
  ReportStudentStatus,
  {
    badge: string;
    progress: string;
    labelKey: string;
  }
> = {
  on_track: {
    badge: ENC_BADGE_INFO,
    progress: 'bg-[var(--admin-brand)]',
    labelKey: 'encadrant.reports.status.onTrack',
  },
  at_risk: {
    badge: ENC_BADGE_WARNING,
    progress: 'bg-[color-mix(in_srgb,#d97706_95%,transparent)]',
    labelKey: 'encadrant.reports.status.atRisk',
  },
  ahead: {
    badge: ENC_BADGE_SUCCESS,
    progress: 'bg-[color-mix(in_srgb,#059669_95%,transparent)]',
    labelKey: 'encadrant.reports.status.ahead',
  },
  delayed: {
    badge: ENC_BADGE_DANGER,
    progress: 'bg-[var(--admin-danger)]',
    labelKey: 'encadrant.reports.status.delayed',
  },
};
