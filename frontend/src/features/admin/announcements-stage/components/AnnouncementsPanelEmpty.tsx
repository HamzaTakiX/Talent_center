import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Lightbulb, LucideIcon } from 'lucide-react';

type Variant = 'insights' | 'chart';

interface Props {
  variant: Variant;
}

const ICONS: Record<Variant, LucideIcon> = {
  insights: Lightbulb,
  chart: BarChart3,
};

const AnnouncementsPanelEmpty: FunctionComponent<Props> = ({ variant }) => {
  const { t } = useTranslation();
  const Icon = ICONS[variant];
  const titleKey = `admin.announcementsModule.empty.${variant}.title`;
  const subtitleKey = `admin.announcementsModule.empty.${variant}.subtitle`;

  return (
    <div className="admin-ann-panel-empty" role="status">
      <div className="admin-ann-panel-empty__icon" aria-hidden>
        <Icon className="h-8 w-8" strokeWidth={1.25} />
      </div>
      <p className="admin-ann-panel-empty__title">{t(titleKey)}</p>
      <p className="admin-ann-panel-empty__subtitle">{t(subtitleKey)}</p>
    </div>
  );
};

export default AnnouncementsPanelEmpty;
