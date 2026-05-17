import type { ReactNode } from 'react';
import type { AdminHistoryCircleVariant } from './adminHistoryUi';

export interface AdminHistoryRowDisplay {
  id: string;
  glyph: ReactNode;
  badgeLabel: string;
  badgeClassName: string;
  circleBgClassName: string;
  circleVariant: AdminHistoryCircleVariant;
  actorName: string;
  headline: string;
  metaLine: string;
  date: string;
  time: string;
}

export interface AdminHistoryFilterConfig {
  ariaLabel: string;
  placeholderOptionLabel: string;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}
