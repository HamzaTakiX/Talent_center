import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useAdminToast } from '../../dashboard/context/AdminToastContext';

import type { BulkDeleteUsersResult } from '../../api/types';

import { useTableRowSelection } from './useTableRowSelection';



type UserDeleteKind = 'student' | 'admin' | 'encadrant';



type DeleteDialogState = { mode: 'bulk'; count: number } | null;



interface IdentifiableRow {

  id: number;

  full_name?: string;

  email: string;

}



function formatDeleteFailure(

  result: BulkDeleteUsersResult,

  fallback: string,

): string {

  const reasons = result.failed

    .map((item) => item.reason)

    .filter((reason): reason is string => Boolean(reason?.trim()));

  if (reasons.length === 0) return fallback;

  return reasons.slice(0, 3).join(' · ');

}



export function useAdminUserDelete<T extends IdentifiableRow>(options: {

  rows: T[];

  kind: UserDeleteKind;

  deleteOne?: (id: number) => Promise<void>;

  deleteBulk: (ids: number[]) => Promise<BulkDeleteUsersResult>;

  onRefresh: () => void | Promise<void>;

}) {

  const { t } = useTranslation();

  const toast = useAdminToast();

  const { rows, kind, deleteBulk, onRefresh } = options;

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(null);

  const pendingDeleteIdsRef = useRef<number[]>([]);



  const rowIds = useMemo(() => rows.map((r) => r.id), [rows]);

  const selection = useTableRowSelection(rowIds);



  useEffect(() => {
    selection.pruneSelection();
  }, [rowIds]);



  const prefix = `admin.common.delete.${kind}`;



  const deleteDescription =

    deleteDialog != null

      ? t(`${prefix}BulkDescription`, { count: deleteDialog.count })

      : '';



  const openBulkDelete = useCallback(() => {

    const ids = Array.from(selection.selectedIds);

    if (ids.length === 0) return;

    pendingDeleteIdsRef.current = ids;

    setDeleteDialog({ mode: 'bulk', count: ids.length });

  }, [selection.selectedIds]);



  const closeDeleteDialog = useCallback(() => {

    setDeleteDialog(null);

    pendingDeleteIdsRef.current = [];

  }, []);



  const runDelete = useCallback(async () => {

    const ids = [...pendingDeleteIdsRef.current];

    if (ids.length === 0) {

      const message = t('admin.common.delete.nothingSelected');

      toast.error(message);

      throw new Error(message);

    }



    let result: BulkDeleteUsersResult;

    try {

      result = await deleteBulk(ids);

    } catch (err: unknown) {

      const message =

        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||

        t('admin.common.delete.requestFailed');

      toast.error(message);

      throw err;

    }



    const deleted = result.deleted_ids?.length ?? 0;

    const failed = result.failed?.length ?? 0;



    if (deleted === 0) {

      const message = formatDeleteFailure(result, t('admin.common.delete.allFailed'));

      toast.error(message);

      throw new Error(message);

    }



    if (failed > 0) {

      toast.warning(

        t('admin.common.delete.partialSuccess', { deleted, failed }),

      );

    } else {

      toast.success(t('admin.common.delete.success', { count: deleted }));

    }



    selection.clearSelection();

    pendingDeleteIdsRef.current = [];

    setDeleteDialog(null);

    await onRefresh();

  }, [deleteBulk, onRefresh, selection, t, toast]);



  return {

    deleteDialog,

    selection,

    deleteTitle: t(`${prefix}Title`),

    deleteDescription,

    runDelete,

    closeDeleteDialog,

    openBulkDelete,

  };

}


