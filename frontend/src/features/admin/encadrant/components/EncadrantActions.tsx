import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { AdminEncadrantRow } from '../../api/types';
import { useOptionalAdminToast } from '../../dashboard/context/AdminToastContext';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';
import {
  adminEncadrantDeskChatPath,
  openAdminEncadrantDeskChat,
} from '../../shared/platform-desk-chat/utils/openAdminPlatformDeskChat';

interface EncadrantActionsProps {
  encadrant: AdminEncadrantRow;
  onView: () => void;
  onEdit: () => void;
}

const EncadrantActions: FunctionComponent<EncadrantActionsProps> = ({
  encadrant,
  onView,
  onEdit,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useOptionalAdminToast();

  const canSendMessage = Boolean(encadrant.is_active);

  const handleSendMessage = useCallback(async () => {
    try {
      const conversationId = await openAdminEncadrantDeskChat(encadrant.id);
      navigate(adminEncadrantDeskChatPath(conversationId));
    } catch {
      toast.showToast(t('admin.common.detailModal.student.chatOpenError'), 'error');
    }
  }, [encadrant.id, navigate, t, toast]);

  return (
    <AdminRowActionsMenu
      ariaLabel={t('admin.modules.encadrants.actions.menuAria', {
        name: encadrant.full_name || encadrant.email,
      })}
      onView={onView}
      onEdit={onEdit}
      onSendMessage={canSendMessage ? () => void handleSendMessage() : undefined}
    />
  );
};

export default EncadrantActions;
