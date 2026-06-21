import type { HistoryStatItem } from '../types';

/** Global audit center KPI cards — activity & traceability, not entity counts. */
export const GLOBAL_AUDIT_CARD_DEFINITIONS: Omit<HistoryStatItem, 'value'>[] = [
  {
    key: 'events_today',
    label: 'Total Events Today',
    icon: 'activity',
    colorClassName: 'bg-[#eaf1ff] text-[#2563eb]',
  },
  {
    key: 'critical_events',
    label: 'Critical Events',
    icon: 'shield',
    colorClassName: 'bg-[#fee2e2] text-[#dc2626]',
  },
  {
    key: 'automated_events',
    label: 'Automated Events',
    icon: 'activity',
    colorClassName: 'bg-[#f3e8ff] text-[#7c3aed]',
  },
  {
    key: 'active_users_today',
    label: 'Active Users',
    icon: 'users',
    colorClassName: 'bg-[#e7f6ec] text-[#059669]',
  },
  {
    key: 'most_active_module',
    label: 'Most Active Module',
    icon: 'briefcase',
    colorClassName: 'bg-[#e0f2fe] text-[#0891b2]',
  },
  {
    key: 'events_last_24h',
    label: 'Events Last 24 Hours',
    icon: 'activity',
    colorClassName: 'bg-[#fff7ed] text-[#ea580c]',
  },
];
