import type { EncadrantReportListFilter } from '../types/encadrantReportListSlice';

export const ENCADRANT_REPORT_FILTER_ROUTES: Record<EncadrantReportListFilter, string> = {
  all: '/admin/encadrant/reports',
  critical: '/admin/encadrant/reports/critical',
  overdue: '/admin/encadrant/reports/overdue',
  pending_validation: '/admin/encadrant/reports/pending-validation',
  risk_alerts: '/admin/encadrant/reports/risk-alerts',
  in_progress: '/admin/encadrant/reports/in-progress',
  pending: '/admin/encadrant/reports/pending',
  approved: '/admin/encadrant/reports/approved',
};

export const ENCADRANT_REPORT_CARD_ORDER: EncadrantReportListFilter[] = [
  'all',
  'critical',
  'overdue',
  'pending_validation',
  'risk_alerts',
  'in_progress',
  'pending',
  'approved',
];

export const ENCADRANT_REPORT_CARD_ROUTES = ENCADRANT_REPORT_CARD_ORDER.map(
  (key) => ENCADRANT_REPORT_FILTER_ROUTES[key],
);

export function filterToApiQueue(
  filter: EncadrantReportListFilter,
): 'all' | 'critical' | 'overdue' | 'pending_validation' | 'risk_alerts' {
  if (filter === 'critical') return 'critical';
  if (filter === 'overdue') return 'overdue';
  if (filter === 'pending_validation') return 'pending_validation';
  if (filter === 'risk_alerts') return 'risk_alerts';
  return 'all';
}
