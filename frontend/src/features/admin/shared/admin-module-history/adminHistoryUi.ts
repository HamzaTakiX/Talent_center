import type { LucideProps } from 'lucide-react';

export type AdminHistoryCircleVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'event'
  | 'interview';

/** Icône timeline — hérite la couleur du cercle parent (currentColor). */
export const ADMIN_HISTORY_ICON_PROPS: Pick<
  LucideProps,
  'className' | 'strokeWidth' | 'stroke' | 'aria-hidden'
> = {
  className: 'admin-history-circle__icon h-5 w-5 shrink-0',
  strokeWidth: 2,
  stroke: 'currentColor',
  'aria-hidden': true,
};

export function adminHistoryCircleClass(variant: AdminHistoryCircleVariant): string {
  return `admin-history-circle admin-history-circle--${variant}`;
}

export function adminHistoryBadgeClass(variant: AdminHistoryCircleVariant): string {
  return `admin-history-card__badge admin-badge admin-badge--${variant}`;
}
