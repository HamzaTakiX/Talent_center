import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Layers,
  LineChart,
} from 'lucide-react';

const NAV = [
  { path: '/admin/announcements/scheduled', icon: CalendarClock, key: 'scheduled' },
  { path: '/admin/announcements/types', icon: Layers, key: 'types' },
  { path: '/admin/announcements/engagement', icon: LineChart, key: 'engagement' },
] as const;

const AnnouncementsNavStrip: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav className="admin-ann-nav-strip" aria-label={t('admin.announcementsModule.hub.quickLinks')}>
      {NAV.map(({ path, icon: Icon, key }) => (
        <button
          key={key}
          type="button"
          className="admin-ann-nav-tile"
          onClick={() => navigate(path)}
        >
          <span className="admin-ann-nav-tile__icon">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="admin-ann-nav-tile__label">
            {t(`admin.announcementsModule.nav.${key}`)}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default AnnouncementsNavStrip;
