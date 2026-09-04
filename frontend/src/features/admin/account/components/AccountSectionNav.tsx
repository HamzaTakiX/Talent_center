import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

export type AccountSectionId = 'profile' | 'settings';

interface AccountSectionNavProps {
  active: AccountSectionId;
  onSelect: (id: AccountSectionId) => void;
}

const tabs: { id: AccountSectionId; labelKey: string }[] = [
  { id: 'profile', labelKey: 'admin.account.tabs.profile' },
  { id: 'settings', labelKey: 'admin.account.tabs.settings' },
];

const AccountSectionNav: FunctionComponent<AccountSectionNavProps> = ({ active, onSelect }) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('admin.account.sectionsNav')}
      className="admin-section-nav"
      role="tablist"
    >
      {tabs.map(({ id, labelKey }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(id)}
            className={`admin-section-tab${isActive ? ' admin-section-tab--active' : ''}`}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </nav>
  );
};

export default AccountSectionNav;
