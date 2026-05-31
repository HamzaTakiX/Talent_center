import type { ReportSectionStatus } from '../types';
import {
  STUDENT_BADGE_NEUTRAL,
  STUDENT_BADGE_SUCCESS,
  STUDENT_BADGE_WARNING,
  STUDENT_INLINE_BADGE,
} from '../../../design-system/studentSemanticStyles';

export const reportSectionStatusLabels: Record<ReportSectionStatus, string> = {
  complete: 'Complet',
  draft: 'Brouillon',
  empty: 'Vide',
};

export const reportSectionStatusBadgeClass: Record<ReportSectionStatus, string> = {
  complete: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_SUCCESS}`,
  draft: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_WARNING}`,
  empty: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_NEUTRAL}`,
};

export const reportSectionStatusSubtitle: Record<ReportSectionStatus, string> = {
  complete: 'Section complète',
  draft: 'Section en cours',
  empty: 'Section vide',
};
