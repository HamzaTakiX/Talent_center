import {
  ENC_BADGE_DANGER,
  ENC_BADGE_INFO,
  ENC_BADGE_SUCCESS,
} from '../../constants/encadrantTokens';
import type { AgendaMeetingStatus, AgendaMeetingType, AgendaSummaryTone } from '../types';

export const AGENDA_SUMMARY_STYLES: Record<
  AgendaSummaryTone,
  { iconWrap: string; iconText: string }
> = {
  blue: {
    iconWrap: 'bg-[var(--admin-brand-muted)]',
    iconText: 'text-[var(--admin-brand)]',
  },
  green: {
    iconWrap: 'bg-[color-mix(in_srgb,#059669_12%,var(--admin-bg-elevated))]',
    iconText: 'text-[#059669]',
  },
  purple: {
    iconWrap: 'bg-[var(--admin-brand-muted)]',
    iconText: 'text-[var(--admin-brand)]',
  },
  red: {
    iconWrap: 'bg-[color-mix(in_srgb,var(--admin-danger)_12%,var(--admin-bg-elevated))]',
    iconText: 'text-[var(--admin-danger)]',
  },
};

export const AGENDA_EVENT_STYLES: Record<
  AgendaMeetingType,
  { card: string; duration: string }
> = {
  'in-person': {
    card: 'border-[color-mix(in_srgb,var(--admin-brand)_35%,var(--admin-border))] bg-[var(--admin-brand-muted)]',
    duration: 'text-[var(--admin-brand)]',
  },
  online: {
    card: 'border-[var(--admin-brand)] bg-[var(--admin-brand-muted)]',
    duration: 'text-[var(--admin-brand)]',
  },
};

export const AGENDA_STATUS_BADGE: Record<AgendaMeetingStatus, string> = {
  upcoming: ENC_BADGE_INFO,
  completed: ENC_BADGE_SUCCESS,
  missed: ENC_BADGE_DANGER,
};

export const AGENDA_STATUS_LABEL_KEY: Record<AgendaMeetingStatus, string> = {
  upcoming: 'encadrant.status.upcoming',
  completed: 'encadrant.status.completed',
  missed: 'encadrant.status.missed',
};
