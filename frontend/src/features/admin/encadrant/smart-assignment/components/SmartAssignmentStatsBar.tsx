import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Users, UserX, AlertTriangle, UserCheck, Target } from 'lucide-react';
import type { SmartAssignmentStats } from '../../../api/types';

interface SmartAssignmentStatsBarProps {
  stats: SmartAssignmentStats;
}

const SmartAssignmentStatsBar: FunctionComponent<SmartAssignmentStatsBarProps> = ({ stats }) => {
  const { t } = useTranslation();

  const items = [
    {
      key: 'assigned',
      label: t('admin.smartAssignment.stats.assigned'),
      value: String(stats.total_assigned),
      icon: Users,
      accent: 'var(--admin-brand)',
    },
    {
      key: 'unassigned',
      label: t('admin.smartAssignment.stats.unassigned'),
      value: String(stats.unassigned_count),
      icon: UserX,
      accent: '#f59e0b',
    },
    {
      key: 'eligible',
      label: t('admin.smartAssignment.stats.eligible'),
      value: String(stats.total_eligible_students),
      icon: Brain,
      accent: '#8b5cf6',
    },
    {
      key: 'overloaded',
      label: t('admin.smartAssignment.stats.overloaded'),
      value: String(stats.overloaded_encadrants),
      icon: AlertTriangle,
      accent: '#ef4444',
    },
    {
      key: 'available',
      label: t('admin.smartAssignment.stats.available'),
      value: String(stats.available_supervisors),
      icon: UserCheck,
      accent: '#10b981',
    },
    {
      key: 'accuracy',
      label: t('admin.smartAssignment.stats.accuracy'),
      value: `${stats.assignment_accuracy ?? stats.specialization_match_rate ?? 0}%`,
      icon: Target,
      accent: '#06b6d4',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.key}
          className="admin-module-panel flex items-center gap-3 rounded-xl p-4 shadow-sm"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${item.accent}22`, color: item.accent }}
          >
            <item.icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-[var(--admin-text-muted)]">{item.label}</span>
            <span className="block text-xl font-semibold tabular-nums text-[var(--admin-text)]">{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default SmartAssignmentStatsBar;
