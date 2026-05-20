import type { AdminAdministratorRow, AdminRoleSlug } from '../../api/types';
import type { AdminDonutSegment } from '../../ui/charts/types';

const ROLE_CHART_SLUGS: { slug: AdminRoleSlug; key: string; color: string }[] = [
  { slug: 'stage', key: 'stage', color: '#2563eb' },
  { slug: 'finance', key: 'finance', color: '#22c55e' },
  { slug: 'documents', key: 'docs', color: '#d97706' },
  { slug: 'communication', key: 'comm', color: '#7c3aed' },
  { slug: 'super', key: 'super', color: '#0ea5e9' },
  { slug: 'coordinator', key: 'coordinator', color: '#64748b' },
  { slug: 'academic', key: 'academic', color: '#14b8a6' },
];

export function buildAdministratorsRoleChartSegments(
  rows: AdminAdministratorRow[],
  roleLabel: (slug: AdminRoleSlug) => string,
): AdminDonutSegment[] {
  return ROLE_CHART_SLUGS.map(({ slug, key, color }) => ({
    key,
    label: roleLabel(slug),
    value: rows.filter((r) => r.role_slugs.includes(slug)).length,
    color,
  })).filter((segment) => segment.value > 0);
}
