import { useCallback } from 'react';
import type { BulkDeleteUsersResult } from '../../api/types';
import { useAdminUserDelete } from './useAdminUserDelete';
import { useDeleteSelectionMode } from './useDeleteSelectionMode';

interface IdentifiableRow {
  id: number;
  full_name?: string;
  email: string;
}

type UserDeleteKind = 'student' | 'admin' | 'encadrant';

export function useAdminTableDeleteFlow<T extends IdentifiableRow>(options: {
  rows: T[];
  kind: UserDeleteKind;
  deleteOne: (id: number) => Promise<void>;
  deleteBulk: (ids: number[]) => Promise<BulkDeleteUsersResult>;
  onRefresh: () => void | Promise<void>;
}) {
  const { selectionMode, enterSelectionMode, exitSelectionMode } = useDeleteSelectionMode();

  const {
    deleteDialog,
    selection,
    deleteTitle,
    deleteDescription,
    runDelete: runDeleteBase,
    closeDeleteDialog,
    openBulkDelete,
  } = useAdminUserDelete(options);

  const exitAndClear = useCallback(() => {
    selection.clearSelection();
    exitSelectionMode();
  }, [selection, exitSelectionMode]);

  const handleEnterSelectionMode = useCallback(() => {
    selection.clearSelection();
    enterSelectionMode();
  }, [selection, enterSelectionMode]);

  const handleExitSelectionMode = useCallback(() => {
    exitAndClear();
  }, [exitAndClear]);

  const handleConfirmDelete = useCallback(() => {
    if (selection.selectedCount < 1) return;
    openBulkDelete();
  }, [openBulkDelete, selection.selectedCount]);

  const runDelete = useCallback(async () => {
    await runDeleteBase();
    exitAndClear();
  }, [runDeleteBase, exitAndClear]);

  const handleCloseDeleteDialog = useCallback(() => {
    closeDeleteDialog();
  }, [closeDeleteDialog]);

  return {
    selectionMode,
    selection,
    deleteDialog,
    deleteTitle,
    deleteDescription,
    runDelete,
    closeDeleteDialog: handleCloseDeleteDialog,
    enterSelectionMode: handleEnterSelectionMode,
    exitSelectionMode: handleExitSelectionMode,
    confirmDelete: handleConfirmDelete,
  };
}
