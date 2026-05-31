/**
 * Surfaces sémantiques étudiant — compatibles light/dark via tokens admin.
 * Préférer ces constantes aux couleurs hex (#faf5ff, bg-[#eff6ff], etc.).
 */
import {
  PLATFORM_BADGE_DANGER,
  PLATFORM_BADGE_INFO,
  PLATFORM_BADGE_NEUTRAL,
  PLATFORM_BADGE_SUCCESS,
  PLATFORM_BADGE_WARNING,
} from '../../../design-system/platformTokens';

export const STUDENT_BADGE_SUCCESS = PLATFORM_BADGE_SUCCESS;
export const STUDENT_BADGE_WARNING = PLATFORM_BADGE_WARNING;
export const STUDENT_BADGE_DANGER = PLATFORM_BADGE_DANGER;
export const STUDENT_BADGE_INFO = PLATFORM_BADGE_INFO;
export const STUDENT_BADGE_NEUTRAL = PLATFORM_BADGE_NEUTRAL;
export const STUDENT_BADGE_EVENT = 'admin-badge admin-badge--event';
export const STUDENT_BADGE_INTERVIEW = 'admin-badge admin-badge--interview';

/** Badge inline (timeline, listes) */
export const STUDENT_INLINE_BADGE = 'admin-badge';

/** Panneaux accent (sidebar, bannières, encarts) */
export const STUDENT_CALLOUT_BRAND = 'student-callout student-callout--brand';
export const STUDENT_CALLOUT_SUCCESS = 'student-callout student-callout--success';
export const STUDENT_CALLOUT_INFO = 'student-callout student-callout--info';
export const STUDENT_CALLOUT_WARNING = 'student-callout student-callout--warning';
export const STUDENT_CALLOUT_DANGER = 'student-callout student-callout--danger';

/** Encarts imbriqués dans un panneau */
export const STUDENT_CALLOUT_INSET_SUCCESS = 'student-callout-inset student-callout-inset--success';
export const STUDENT_CALLOUT_INSET_INFO = 'student-callout-inset student-callout-inset--info';
export const STUDENT_CALLOUT_INSET_WARNING = 'student-callout-inset student-callout-inset--warning';
export const STUDENT_CALLOUT_INSET_BRAND = 'student-callout-inset student-callout-inset--brand';

/** Icône dans cercle / carré arrondi */
export const STUDENT_ICON_CHIP_INFO = 'student-icon-chip student-icon-chip--info';
export const STUDENT_ICON_CHIP_SUCCESS = 'student-icon-chip student-icon-chip--success';
export const STUDENT_ICON_CHIP_WARNING = 'student-icon-chip student-icon-chip--warning';
export const STUDENT_ICON_CHIP_DANGER = 'student-icon-chip student-icon-chip--danger';
export const STUDENT_ICON_CHIP_BRAND = 'student-icon-chip student-icon-chip--brand';

/** Score de correspondance (offres, CV) */
export const STUDENT_MATCH_SCORE = 'student-match-score';

/** Bannière IA (réutilise student-ai-banner du CSS) */
export const STUDENT_AI_BANNER = 'student-ai-banner';

/** Bulle de message envoyé (chat workspace) */
export const STUDENT_CHAT_BUBBLE_SENT = 'student-chat-bubble-sent';

/** Barre de progression */
export const STUDENT_PROGRESS_TRACK = 'student-progress-track';
export const STUDENT_PROGRESS_FILL = 'student-progress-fill';
