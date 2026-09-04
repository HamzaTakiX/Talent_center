import { FunctionComponent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserX } from 'lucide-react';
import { adminStudentsApi } from '../../api/students';
import type { AdminStudentRow } from '../../api/types';
import { useOptionalAdminToast } from '../../dashboard/context/AdminToastContext';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';
import {
  adminStudentDeskChatPath,
  openAdminStudentDeskChat,
} from '../../shared/platform-desk-chat/utils/openAdminPlatformDeskChat';

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
  const navigate = useNavigate();
  const toast = useOptionalAdminToast();

  const canSendMessage = Boolean(student.is_active && student.platform_access_granted);

  const handleSendMessage = useCallback(async () => {
    try {
      const conversationId = await openAdminStudentDeskChat(student.id);
      navigate(adminStudentDeskChatPath(conversationId));
    } catch {
      toast.showToast(t('admin.common.detailModal.student.chatOpenError'), 'error');
    }
  }, [navigate, student.id, t, toast]);

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
      onSendMessage={canSendMessage ? () => void handleSendMessage() : undefined}
      extraItems={extraItems}
    />
  );
};

export default StudentActions;
