import type { LucideIcon } from 'lucide-react';
import { AlertCircle, Briefcase, Clock, DollarSign } from 'lucide-react';
import type { AlertPriority } from './adminMockData';

export type AlertMessageKey = 'unpaidSrf' | 'documentsPending' | 'noInternship' | 'offersExpiring';

export interface AlertMetricDefinition {
  id: string;
  messageKey: AlertMessageKey;
  priority: AlertPriority;
  count: number;
  route: string;
  Icon: LucideIcon;
  accent: string;
  accentBg: string;
}

export const ALERT_METRICS: AlertMetricDefinition[] = [
  {
    id: '1',
    messageKey: 'unpaidSrf',
    priority: 'High',
    count: 23,
    route: '/admin/students-unpaid-srf',
    Icon: DollarSign,
    accent: '#e11d48',
    accentBg: 'rgba(225, 29, 72, 0.12)',
  },
  {
    id: '2',
    messageKey: 'documentsPending',
    priority: 'Medium',
    count: 45,
    route: '/admin/documents-pending-validation',
    Icon: Clock,
    accent: '#d97706',
    accentBg: 'rgba(217, 119, 6, 0.12)',
  },
  {
    id: '3',
    messageKey: 'noInternship',
    priority: 'High',
    count: 156,
    route: '/admin/students-without-internship',
    Icon: AlertCircle,
    accent: '#ea580c',
    accentBg: 'rgba(234, 88, 12, 0.12)',
  },
  {
    id: '4',
    messageKey: 'offersExpiring',
    priority: 'Medium',
    count: 12,
    route: '/admin/internship-offers/expired',
    Icon: Briefcase,
    accent: '#0891b2',
    accentBg: 'rgba(8, 145, 178, 0.12)',
  },
];

export function computeSeverityVolumes(metrics: AlertMetricDefinition[]) {
  const high = metrics.filter((m) => m.priority === 'High').reduce((s, m) => s + m.count, 0);
  const medium = metrics.filter((m) => m.priority === 'Medium').reduce((s, m) => s + m.count, 0);
  const low = 0;
  const total = high + medium + low;
  return { high, medium, low, total };
}
