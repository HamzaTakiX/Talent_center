import {
  ENC_RISK,
  ENC_TONE_ICON,
} from '../../../../constants/encadrantTokens';
import type { AssignedStudentsSummaryTone, AssignedStudentRiskLevel } from '../types';

export const ASSIGNED_STUDENTS_SUMMARY_STYLES: Record<
  AssignedStudentsSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: ENC_TONE_ICON.blue,
  green: ENC_TONE_ICON.green,
  gray: {
    iconBg: 'bg-[var(--admin-text-muted)]',
    iconText: 'text-white',
  },
};

export const ASSIGNED_STUDENTS_RISK_STYLES: Record<
  AssignedStudentRiskLevel,
  { badge: string }
> = {
  low: { badge: ENC_RISK.low.badge },
  medium: { badge: ENC_RISK.medium.badge },
  high: { badge: ENC_RISK.high.badge },
};

export const ASSIGNED_STUDENTS_PROGRESS_FILL = 'bg-[var(--admin-brand)]';
