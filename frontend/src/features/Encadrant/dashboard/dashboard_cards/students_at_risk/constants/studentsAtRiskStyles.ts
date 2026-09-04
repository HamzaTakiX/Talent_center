import {
  ENC_BADGE_DANGER,
  ENC_BADGE_SUCCESS,
  ENC_BADGE_WARNING,
  ENC_RISK,
  ENC_TONE_ICON,
} from '../../../../constants/encadrantTokens';
import type { StudentsAtRiskLevel, StudentsAtRiskSummaryTone } from '../types';

export const STUDENTS_AT_RISK_SUMMARY_STYLES: Record<
  StudentsAtRiskSummaryTone,
  { iconBg: string; iconText: string }
> = {
  red: ENC_TONE_ICON.red,
  orange: ENC_TONE_ICON.orange,
  green: ENC_TONE_ICON.green,
};

export const STUDENTS_AT_RISK_ALERT_STYLES: Record<
  StudentsAtRiskLevel,
  {
    card: string;
    border: string;
    iconCircle: string;
    badge: string;
    factorBadge: string;
  }
> = {
  high: {
    card: 'bg-[color-mix(in_srgb,var(--admin-danger)_8%,var(--admin-bg-elevated))]',
    border: 'border-l-4 border-l-[var(--admin-danger)]',
    iconCircle: `${ENC_TONE_ICON.red.iconBg} ${ENC_TONE_ICON.red.iconText}`,
    badge: ENC_RISK.high.badge,
    factorBadge: ENC_BADGE_DANGER,
  },
  medium: {
    card: 'bg-[color-mix(in_srgb,#d97706_8%,var(--admin-bg-elevated))]',
    border: 'border-l-4 border-l-[#d97706]',
    iconCircle: `${ENC_TONE_ICON.orange.iconBg} ${ENC_TONE_ICON.orange.iconText}`,
    badge: ENC_RISK.medium.badge,
    factorBadge: ENC_BADGE_WARNING,
  },
  low: {
    card: 'bg-[color-mix(in_srgb,#059669_8%,var(--admin-bg-elevated))]',
    border: 'border-l-4 border-l-[#059669]',
    iconCircle: `${ENC_TONE_ICON.green.iconBg} ${ENC_TONE_ICON.green.iconText}`,
    badge: ENC_RISK.low.badge,
    factorBadge: ENC_BADGE_SUCCESS,
  },
};
