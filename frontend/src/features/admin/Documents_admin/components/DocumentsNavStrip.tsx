import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  FileStack,
  GitBranch,
  LayoutGrid,
  Settings2,
  Truck,
  Users,
} from 'lucide-react';

const NAV = [
  { path: '/admin/documents/catalog', icon: BookOpen, key: 'catalog' },
  { path: '/admin/documents/requests', icon: ClipboardList, key: 'requests' },
  { path: '/admin/documents/workflows', icon: GitBranch, key: 'workflows' },
  { path: '/admin/documents/reservations', icon: Calendar, key: 'reservations' },
  { path: '/admin/documents/resources', icon: Users, key: 'resources' },
  { path: '/admin/documents/templates', icon: FileStack, key: 'templates' },
  { path: '/admin/documents/sla', icon: Settings2, key: 'sla' },
  { path: '/admin/documents/analytics', icon: BarChart3, key: 'analytics' },
  { path: '/admin/documents/delivery', icon: Truck, key: 'delivery' },
  { path: '/admin/documents/workload', icon: LayoutGrid, key: 'workload' },
] as const;

const DocumentsNavStrip: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav className="admin-doc-nav-strip" aria-label={t('admin.documentsModule.hub.quickLinks')}>
      {NAV.map(({ path, icon: Icon, key }) => (
        <button
          key={key}
          type="button"
          className="admin-doc-nav-tile"
          onClick={() => navigate(path)}
        >
          <span className="admin-doc-nav-tile__icon">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="admin-doc-nav-tile__label">
            {t(`admin.documentsModule.nav.${key}`)}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default DocumentsNavStrip;
