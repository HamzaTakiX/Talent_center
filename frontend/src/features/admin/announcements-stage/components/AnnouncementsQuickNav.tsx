import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Briefcase, Layers, Lightbulb, LineChart } from 'lucide-react';
import AdminModulePanel from '../../ui/AdminModulePanel';

const links = [
  { path: '/admin/announcements/internships', icon: Briefcase, key: 'internships' },
  { path: '/admin/announcements/types', icon: Layers, key: 'types' },
  { path: '/admin/announcements/analytics', icon: BarChart3, key: 'analytics' },
  { path: '/admin/announcements/insights', icon: Lightbulb, key: 'insights' },
  { path: '/admin/announcements/engagement', icon: LineChart, key: 'engagement' },
] as const;

const AnnouncementsQuickNav: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <AdminModulePanel className="p-4">
      <h3 className="text-sm font-semibold text-[var(--admin-text)] mb-3">
        {t('admin.announcementsModule.hub.quickLinks')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {links.map(({ path, icon: Icon, key }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[var(--admin-brand)] hover:shadow-[0_0_20px_rgba(37,99,235,0.12)] transition-all text-center"
          >
            <Icon className="w-5 h-5 text-[var(--admin-brand)]" />
            <span className="text-xs font-medium text-[var(--admin-text)]">
              {t(`admin.announcementsModule.nav.${key}`)}
            </span>
          </button>
        ))}
      </div>
    </AdminModulePanel>
  );
};

export default AnnouncementsQuickNav;
