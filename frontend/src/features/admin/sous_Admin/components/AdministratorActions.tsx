import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Hexagon } from 'lucide-react';
import type { AdminAdministratorRow } from '../../api/types';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';

interface AdministratorActionsProps {
  administrator: AdminAdministratorRow;
  onView: () => void;
  onEdit?: () => void;
  onManagePermissions?: () => void;
}

const AdministratorActions: FunctionComponent<AdministratorActionsProps> = ({
  administrator,
  onView,
  onEdit,
  onManagePermissions,
}) => {
  const { t } = useTranslation();

  const extraItems = useMemo(
    () =>
      onManagePermissions
        ? [
            {
              key: 'permissions',
              label: t('admin.common.actions.managePermissions'),
              icon: Hexagon,
              onClick: onManagePermissions,
            },
          ]
        : [],
    [onManagePermissions, t],
  );

  return (
    <AdminRowActionsMenu
      ariaLabel={t('admin.modules.administrators.actions.menuAria', {
        name: administrator.full_name || administrator.email,
      })}
      onView={onView}
      onEdit={onEdit}
      extraItems={extraItems}
    />
  );
};

export default AdministratorActions;
