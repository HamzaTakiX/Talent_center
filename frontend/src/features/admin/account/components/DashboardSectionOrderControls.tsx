import { FunctionComponent } from 'react';
import { ArrowDown, ArrowUp, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type DashboardSectionId } from '../hooks/useDashboardLayout';

const sectionLabelKey: Record<DashboardSectionId, string> = {
  stats: 'admin.settings.preferences.dashboardSectionStats',
  'alerts-row': 'admin.settings.preferences.dashboardSectionAlerts',
  overview: 'admin.settings.preferences.dashboardSectionOverview',
};

interface DashboardSectionOrderControlsProps {
  order: DashboardSectionId[];
  canPersonalize: boolean;
  onMove: (id: DashboardSectionId, direction: 'up' | 'down') => void;
}

const DashboardSectionOrderControls: FunctionComponent<DashboardSectionOrderControlsProps> = ({
  order,
  canPersonalize,
  onMove,
}) => {
  const { t } = useTranslation();

  if (!canPersonalize) return null;

  return (
    <div className="mt-4 rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-brand-muted)]/30 p-3">
      <div className="mb-3 flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4 text-[var(--admin-brand)]" strokeWidth={1.75} />
        <p className="text-xs font-medium text-[var(--admin-text)]">
          {t('admin.settings.preferences.dashboardOrderTitle')}
        </p>
      </div>
      <ul className="space-y-2">
        {order.map((id, index) => (
          <li
            key={id}
            className="flex items-center justify-between gap-2 admin-btn-surface rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-3 py-2"
          >
            <span className="text-xs font-medium text-[var(--admin-text)]">{t(sectionLabelKey[id])}</span>
            <div className="admin-dashboard-order-actions" role="group" aria-label={t('admin.settings.preferences.dashboardOrderTitle')}>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(id, 'up')}
                className="admin-dashboard-order-btn admin-dashboard-order-btn--up"
                aria-label={t('admin.settings.preferences.moveUp')}
              >
                <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              </button>
              <button
                type="button"
                disabled={index === order.length - 1}
                onClick={() => onMove(id, 'down')}
                className="admin-dashboard-order-btn admin-dashboard-order-btn--down"
                aria-label={t('admin.settings.preferences.moveDown')}
              >
                <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardSectionOrderControls;
