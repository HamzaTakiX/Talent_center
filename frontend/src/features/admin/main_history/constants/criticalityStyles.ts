import type { HistoryCriticality } from '../types';
import { adminBadgeClass, ADMIN_CHIP_BADGE } from '../../ui/adminStatusBadges';

const CRITICALITY_VARIANT: Record<HistoryCriticality, 'neutral' | 'info' | 'warning' | 'danger' | 'event'> = {
  INFO: 'info',
  IMPORTANT: 'warning',
  CRITICAL: 'danger',
  AUTOMATED: 'event',
};

export function criticalityBadgeClass(level: HistoryCriticality): string {
  return adminBadgeClass(CRITICALITY_VARIANT[level] ?? 'neutral', ADMIN_CHIP_BADGE);
}

export function criticalityTimelineVariant(level: HistoryCriticality): string {
  switch (level) {
    case 'CRITICAL':
      return 'danger';
    case 'IMPORTANT':
      return 'warning';
    case 'AUTOMATED':
      return 'event';
    default:
      return 'info';
  }
}
