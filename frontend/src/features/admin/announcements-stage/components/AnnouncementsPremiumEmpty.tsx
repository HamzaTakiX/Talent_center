import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Briefcase, Search, Sparkles } from 'lucide-react';

type Variant = 'list' | 'search' | 'internships' | 'analytics';

interface Props {
  variant?: Variant;
  onAction?: () => void;
  action?: ReactNode;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
}

const AnnouncementsPremiumEmpty: FunctionComponent<Props> = ({
  variant = 'list',
  onAction,
  action,
  title,
  subtitle,
  actionLabel,
}) => {
  const { t } = useTranslation();
  const Icon = variant === 'internships' ? Briefcase : variant === 'search' ? Search : Bell;

  const titleKey = `admin.announcementsModule.empty.${variant}.title`;
  const subtitleKey = `admin.announcementsModule.empty.${variant}.subtitle`;

  return (
    <div className="admin-ann-empty">
      <div className="admin-ann-empty__icon">
        <Icon className="h-9 w-9" strokeWidth={1.25} aria-hidden />
      </div>
      <h3 className="text-lg font-bold text-[var(--admin-text)]">
        {title ?? t(titleKey, { defaultValue: t('admin.announcementsModule.empty.title') })}
      </h3>
      <p className="max-w-md text-sm text-[var(--admin-text-secondary)]">
        {subtitle ?? t(subtitleKey, { defaultValue: t('admin.announcementsModule.empty.subtitle') })}
      </p>
      {action ?? (
        onAction ? (
          <button type="button" className="admin-btn-primary mt-2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold" onClick={onAction}>
            <Sparkles className="h-4 w-4" aria-hidden />
            {actionLabel ?? t('admin.announcementsModule.empty.cta')}
          </button>
        ) : null
      )}
    </div>
  );
};

export default AnnouncementsPremiumEmpty;
