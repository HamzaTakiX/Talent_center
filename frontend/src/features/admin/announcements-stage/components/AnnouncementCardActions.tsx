import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';
import type { AnnouncementListItem } from '../types/announcement';
import { useAnnouncementMutation } from '../hooks/useAnnouncementMutation';

interface Props {
  item: AnnouncementListItem;
  onDeleted?: () => void | Promise<void>;
}

const AnnouncementCardActions: FunctionComponent<Props> = ({ item, onDeleted }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { deleteAnnouncement, archiveAnnouncement } = useAnnouncementMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canArchive = useMemo(() => item.status !== 'ARCHIVED', [item.status]);

  const handleArchive = useCallback(async () => {
    await archiveAnnouncement(item.id);
    await onDeleted?.();
  }, [archiveAnnouncement, item.id, onDeleted]);

  const handleDelete = useCallback(async () => {
    await deleteAnnouncement(item.id);
    await onDeleted?.();
  }, [deleteAnnouncement, item.id, onDeleted]);

  return (
    <>
      <AdminDeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('admin.announcementsModule.actions.delete.title', {
          defaultValue: 'Supprimer l\'annonce',
        })}
        description={t('admin.announcementsModule.actions.delete.description', {
          defaultValue:
            'Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.',
        })}
        confirmLabel={t('admin.announcementsModule.actions.delete.confirm', {
          defaultValue: 'Supprimer l\'annonce',
        })}
      />
      <AdminRowActionsMenu
        ariaLabel={t('admin.announcementsModule.actions.menuAria', {
          title: item.title,
          defaultValue: `Actions pour ${item.title}`,
        })}
        onView={() => navigate(`/admin/announcements/${item.id}`)}
        onEdit={() => navigate(adminCrudRoutes.announcementEdit(item.id))}
        onArchive={canArchive ? handleArchive : undefined}
        onDelete={() => setDeleteOpen(true)}
      />
    </>
  );
};

export default AnnouncementCardActions;
