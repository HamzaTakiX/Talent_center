import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { AdminListToolbar, AdminModuleHeader } from '../../ui';

interface PlatformAdministratorsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onCreateAdmin: () => void;
}

const PlatformAdministratorsToolbar: FunctionComponent<PlatformAdministratorsToolbarProps> = ({
  query,
  onQueryChange,
  onCreateAdmin,
}) => {
  const { t } = useTranslation();
  const { createLabel, filterLabel } = useAdminCopy();
  const searchPh = useAdminSearchPlaceholder('admins');
  return (
  <AdminModuleHeader
    layout="toolbar"
    title={t('admin.modules.administrators.title')}
    subtitle={t('admin.modules.administrators.subtitle')}
    actions={
      <AdminListToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder={searchPh}
        toolbarAriaLabel={filterLabel('filterAdministrators')}
        createLabel={createLabel('admin')}
        onCreate={onCreateAdmin}
      />
    }
  />
  );
};

export default PlatformAdministratorsToolbar;
