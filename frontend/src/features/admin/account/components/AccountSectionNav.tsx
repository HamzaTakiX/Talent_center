import { FunctionComponent } from 'react';
import { Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type AccountSectionId = 'profile' | 'settings';

interface AccountSectionNavProps {
  active: AccountSectionId;
  onSelect: (id: AccountSectionId) => void;
}

const tabs: { id: AccountSectionId; labelKey: string; icon: typeof User }[] = [
  { id: 'profile', labelKey: 'admin.account.tabs.profile', icon: User },
  { id: 'settings', labelKey: 'admin.account.tabs.settings', icon: Settings },
];

const AccountSectionNav: FunctionComponent<AccountSectionNavProps> = ({ active, onSelect }) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('admin.account.sectionsNav')}
      className="admin-section-nav sticky top-0 z-10 -mx-1 flex gap-1 rounded-xl border border-[var(--admin-border)] p-1 backdrop-blur-xl"
    >
      {tabs.map(({ id, labelKey, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`admin-section-tab flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive ? 'admin-section-tab--active' : ''
            }`}
            aria-current={isActive ? 'true' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t(labelKey)}
          </button>
        );
      })}
    </nav>
  );
};

export default AccountSectionNav;
