import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAnnouncementsApi } from '../../api/announcements';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import { useDeleteSelectionMode } from '../../shared/hooks/useDeleteSelectionMode';
import { useStringRowSelection } from '../../shared/hooks/useStringRowSelection';

export function useAnnouncementBulkDelete(
  itemIds: string[],
  onRefresh: () => void | Promise<void>,
) {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const { selectionMode, enterSelectionMode, exitSelectionMode } = useDeleteSelectionMode();
  const selection = useStringRowSelection(itemIds);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    selection.pruneSelection();
  }, [itemIds, selection.pruneSelection]);

  const exitAndClear = useCallback(() => {
    selection.clearSelection();
    exitSelectionMode();
  }, [exitSelectionMode, selection]);

  const handleEnterSelectionMode = useCallback(() => {
    selection.clearSelection();
    enterSelectionMode();
  }, [enterSelectionMode, selection]);

  const handleExitSelectionMode = useCallback(() => {
    exitAndClear();
  }, [exitAndClear]);

  const openBulkDelete = useCallback(() => {
    if (selection.selectedCount < 1) return;
    setDeleteOpen(true);
  }, [selection.selectedCount]);

  const deleteTitle = useMemo(
    () =>
      selection.selectedCount > 1
        ? t('admin.announcementsModule.actions.delete.bulkTitle', {
            count: selection.selectedCount,
            defaultValue: 'Supprimer les annonces sélectionnées',
          })
        : t('admin.announcementsModule.actions.delete.title', {
            defaultValue: 'Supprimer l\'annonce',
          }),
    [selection.selectedCount, t],
  );

  const deleteDescription = useMemo(
    () =>
      t('admin.announcementsModule.actions.delete.bulkDescription', {
        count: selection.selectedCount,
        defaultValue:
          'Êtes-vous sûr de vouloir supprimer {{count}} annonce(s) ? Cette action est irréversible.',
      }),
    [selection.selectedCount, t],
  );

  const runDelete = useCallback(async () => {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;

    setDeleting(true);
    try {
      await adminAnnouncementsApi.bulkDelete(ids);
      toast.showToast(
        t('admin.announcementsModule.actions.delete.bulkSuccess', {
          count: ids.length,
          defaultValue: '{{count}} annonce(s) supprimée(s) avec succès.',
        }),
        'success',
      );
      setDeleteOpen(false);
      exitAndClear();
      await onRefresh();
    } catch {
      toast.showToast(
        t('admin.announcementsModule.actions.delete.errors.failed', {
          defaultValue: 'Impossible de supprimer cette annonce.',
        }),
        'error',
      );
    } finally {
      setDeleting(false);
    }
  }, [exitAndClear, onRefresh, selection.selectedIds, t, toast]);

  return {
    selectionMode,
    selection,
    deleteOpen,
    deleting,
    deleteTitle,
    deleteDescription,
    enterSelectionMode: handleEnterSelectionMode,
    exitSelectionMode: handleExitSelectionMode,
    confirmDelete: openBulkDelete,
    closeDeleteDialog: () => setDeleteOpen(false),
    runDelete,
  };
}
