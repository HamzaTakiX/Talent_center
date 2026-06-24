import { FunctionComponent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, UserX } from 'lucide-react';
import { adminStudentsApi } from '../../api/students';
import type { AdminStudentRow } from '../../api/types';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';

interface StudentActionsProps {
  student: AdminStudentRow;
  onView: () => void;
  onEdit: () => void;
  onRefresh?: () => void;
}

const StudentActions: FunctionComponent<StudentActionsProps> = ({
  student,
  onView,
  onEdit,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const handleToggleAccess = useCallback(async () => {
    await adminStudentsApi.updateAccess(student.id, {
      platform_access_granted: !student.platform_access_granted,
      account_status: !student.platform_access_granted ? 'AUTHORIZED' : 'PENDING',
    });
    onRefresh?.();
  }, [onRefresh, student]);

  const extraItems = useMemo(
    () =>
      onRefresh
        ? [
            {
              key: 'toggle-access',
              label: student.platform_access_granted
                ? t('admin.common.actions.deactivate')
                : t('admin.modules.students.actions.authorize'),
              icon: student.platform_access_granted ? UserX : UserCheck,
              onClick: () => void handleToggleAccess(),
            },
          ]
        : [],
    [handleToggleAccess, onRefresh, student.platform_access_granted, t],
  );

  return (
    <AdminRowActionsMenu
      ariaLabel={t('admin.modules.students.actions.menuAria', {
        name: student.full_name || student.email,
      })}
      onView={onView}
      onEdit={onEdit}
      extraItems={extraItems}
    />
  );
};

export default StudentActions;
