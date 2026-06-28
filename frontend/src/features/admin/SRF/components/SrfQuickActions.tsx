import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  History,
  MessageSquare,
  Settings2,
  Upload,
  type LucideIcon,
} from 'lucide-react';

const ACTIONS: { path: string; icon: LucideIcon; labelKey: string }[] = [
  { path: '/admin/srf/imports', icon: Upload, labelKey: 'admin.modules.srf.importCenter.openCenter' },
  { path: '/admin/srf/config', icon: Settings2, labelKey: 'admin.modules.srf.configCenter.openCenter' },
  {
    path: '/admin/srf/pending-validation',
    icon: AlertTriangle,
    labelKey: 'admin.kpi.srf.pendingValidation',
  },
  { path: '/admin/srf/history', icon: History, labelKey: 'admin.history.srf.title' },
  { path: '/admin/srf/chat', icon: MessageSquare, labelKey: 'admin.history.modules.chat' },
];

const SrfQuickActions: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav className="admin-srf-quick-actions" aria-label={t('admin.modules.srf.dashboard.quickActions', 'Quick actions')}>
      {ACTIONS.map(({ path, icon: Icon, labelKey }) => (
        <button
          key={path}
          type="button"
          className="admin-srf-quick-actions__tile"
          onClick={() => navigate(path)}
        >
          <span className="admin-srf-quick-actions__icon">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="admin-srf-quick-actions__label">{t(labelKey)}</span>
        </button>
      ))}
    </nav>
  );
};

export default SrfQuickActions;
