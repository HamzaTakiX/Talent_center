/**
 * Badges SRF étudiant — alignés sur admin (`admin-badge` + variants).
 */
import {
  STUDENT_BADGE_DANGER,
  STUDENT_BADGE_NEUTRAL,
  STUDENT_BADGE_SUCCESS,
  STUDENT_INLINE_BADGE,
} from '../../design-system/studentSemanticStyles';

const badge = (variant: string) => `${STUDENT_INLINE_BADGE} ${variant}`;

/** Badge avec icône (table frais) */
export const SRF_BADGE_WITH_ICON = 'inline-flex items-center gap-1';

export const SRF_FEE_BADGE_PAID = badge(STUDENT_BADGE_SUCCESS);
export const SRF_FEE_BADGE_VALIDATED = badge(STUDENT_BADGE_SUCCESS);
export const SRF_FEE_BADGE_UNPAID = badge(STUDENT_BADGE_DANGER);
export const SRF_FEE_BADGE_PENDING = badge(STUDENT_BADGE_NEUTRAL);
export const SRF_FEE_BADGE_PARTIAL = badge(STUDENT_BADGE_NEUTRAL);
export const SRF_FEE_BADGE_LATE = badge(STUDENT_BADGE_DANGER);

export const SRF_HISTORY_STATUS_BADGE: Record<string, string> = {
  pending: badge(STUDENT_BADGE_NEUTRAL),
  approved: badge(STUDENT_BADGE_SUCCESS),
  rejected: badge(STUDENT_BADGE_DANGER),
  correction: badge(STUDENT_BADGE_NEUTRAL),
  validated: badge(STUDENT_BADGE_SUCCESS),
};

export const SRF_HISTORY_TYPE_BADGE = badge(STUDENT_BADGE_NEUTRAL);

export const SRF_AMOUNT_PAID = 'font-medium tabular-nums text-emerald-500';

export const SRF_AMOUNT_REMAINING_DUE = 'font-medium tabular-nums text-amber-500';

export const SRF_AMOUNT_REMAINING_ZERO = 'font-medium tabular-nums text-[var(--admin-text-muted)]';

/** Badge statut en-tête SRF (Action requise / Situation régularisée) */
export const SRF_HEADER_STATUS_BADGE = 'student-srf-header-badge';

export const SRF_HEADER_STATUS_ACTION = 'student-srf-header-badge--action-required';

export const SRF_HEADER_STATUS_CLEARED = 'student-srf-header-badge--cleared';
