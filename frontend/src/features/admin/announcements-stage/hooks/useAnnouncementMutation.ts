import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAnnouncementsApi } from '../../api/announcements';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';

export function useAnnouncementMutation() {
  const { t } = useTranslation();
  const toast = useAdminToast();

  const deleteAnnouncement = useCallback(
    async (id: string) => {
      try {
        await adminAnnouncementsApi.remove(id);
        toast.showToast(
          t('admin.announcementsModule.actions.delete.success', {
            defaultValue: 'Annonce supprimée avec succès.',
          }),
          'success',
        );
      } catch {
        toast.showToast(
          t('admin.announcementsModule.actions.delete.errors.failed', {
            defaultValue: 'Impossible de supprimer cette annonce.',
          }),
          'error',
        );
        throw new Error('delete_failed');
      }
    },
    [t, toast],
  );

  const archiveAnnouncement = useCallback(
    async (id: string) => {
      try {
        await adminAnnouncementsApi.action(id, 'archive');
        toast.showToast(
          t('admin.announcementsModule.detail.archiveSuccess', {
            defaultValue: 'Annonce archivée.',
          }),
          'success',
        );
      } catch {
        toast.showToast(
          t('admin.announcementsModule.archived.archiveError', {
            defaultValue: 'Impossible d\'archiver cette annonce.',
          }),
          'error',
        );
        throw new Error('archive_failed');
      }
    },
    [t, toast],
  );

  const unarchiveAnnouncement = useCallback(
    async (id: string) => {
      try {
        await adminAnnouncementsApi.action(id, 'unarchive');
        toast.showToast(
          t('admin.announcementsModule.archived.unarchiveSuccess', {
            defaultValue: 'Annonce désarchivée.',
          }),
          'success',
        );
      } catch {
        toast.showToast(
          t('admin.announcementsModule.archived.unarchiveError', {
            defaultValue: 'Impossible de désarchiver cette annonce.',
          }),
          'error',
        );
        throw new Error('unarchive_failed');
      }
    },
    [t, toast],
  );

  return { deleteAnnouncement, archiveAnnouncement, unarchiveAnnouncement };
}
