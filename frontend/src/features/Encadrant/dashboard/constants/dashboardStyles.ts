/** Styles — cartes stats, risques, barres de progression (Dashboard Encadrant). */

import { ENC_RISK, ENC_TONE_ICON } from '../../constants/encadrantTokens';
import type { DashboardStatTone, StudentRiskLevel } from '../types';

export const DASHBOARD_STAT_TONE_STYLES: Record<
  DashboardStatTone,
  { iconBg: string; iconText: string }
> = ENC_TONE_ICON;

export const DASHBOARD_RISK_STYLES: Record<
  StudentRiskLevel,
  {
    dot: string;
    progress: string;
    badge: string;
  }
> = ENC_RISK;
