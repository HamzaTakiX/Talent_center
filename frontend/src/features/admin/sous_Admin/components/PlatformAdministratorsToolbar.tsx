import { FunctionComponent, ReactNode, useState } from 'react';
import { Shield, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { AdminListToolbar, AdminModuleHeader } from '../../ui';
import AdministratorsImportModal from './AdministratorsImportModal';

interface PlatformAdministratorsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onCreateAdmin: () => void;
  onRefresh: () => void;
  deleteControl?: ReactNode;
}

const PlatformAdministratorsToolbar: FunctionComponent<PlatformAdministratorsToolbarProps> = ({
  query,
  onQueryChange,
  onCreateAdmin,
  onRefresh,
  deleteControl,
}) => {
  const { t } = useTranslation();
  const { createLabel, filterLabel } = useAdminCopy();
  const searchPh = useAdminSearchPlaceholder('admins');
  const [importOpen, setImportOpen] = useState(false);
  return (
  <>
  <AdministratorsImportModal
    open={importOpen}
    onClose={() => setImportOpen(false)}
    onImported={onRefresh}
  />
  <AdminModuleHeader
    layout="toolbar"
    icon={Shield}
    title={t('admin.modules.administrators.title')}
    subtitle={t('admin.modules.administrators.subtitle')}
    actions={
      <AdminListToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder={searchPh}
        toolbarAriaLabel={filterLabel('filterAdministrators')}
        createLabel={createLabel('admin')}
        createVariant="primary"
        onCreate={onCreateAdmin}
        actionExtra={
          <button
            type="button"
            className="admin-module-toolbar__btn"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{t('admin.common.actions.importExcel')}</span>
          </button>
        }
        beforeCreate={deleteControl}
      />
    }
  />
  </>
  );
};

export default PlatformAdministratorsToolbar;
