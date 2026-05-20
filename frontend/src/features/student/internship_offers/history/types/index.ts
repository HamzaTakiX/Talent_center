import type { ReactNode } from 'react';
import type { AdminHistoryCircleVariant } from '../../../../admin/shared/admin-module-history/adminHistoryUi';

export interface HistoryRowDisplay {
  id: string;
  glyph: ReactNode;
  badgeLabel: string;
  /** @deprecated Mapped via circleVariant when using AdminModuleHistory */
  badgeClassName?: string;
  /** @deprecated Mapped via circleVariant when using AdminModuleHistory */
  circleBgClassName?: string;
  circleVariant?: AdminHistoryCircleVariant;
  actorName: string;
  headline: string;
  metaLine: string;
  date: string;
  time: string;
}

export interface HistoryFilterConfig {
  ariaLabel: string;
  placeholderOptionLabel: string;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}
