import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { stageApi } from '../../../shared/api/stageApi';
import { mapStageOfferToAdminRow } from '../../../shared/utils/stageMappers';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import type { InternshipOffer } from '../types';
import { parseStageActionError } from '../utils/parseStageActionError';
import {
  emitStageOfferDashboardRefresh,
  emitStageOfferMutation,
  type StageOfferMutationAction,
} from '../utils/stageOffersSync';

type OfferLifecycleAction = 'archive' | 'restore' | 'delete';

function actionToMutationKind(action: OfferLifecycleAction): StageOfferMutationAction {
  if (action === 'restore') return 'unarchive';
  return action;
}

function nextUiStatusForAction(
  action: OfferLifecycleAction,
  currentStatus: InternshipOffer['status'],
): InternshipOffer['status'] | null {
  switch (action) {
    case 'archive':
      return 'Archived';
    case 'restore':
      return 'Active';
    case 'delete':
      return null;
    default:
      return currentStatus;
  }
}

export function useStageOfferMutation() {
  const { t } = useTranslation();
  const toast = useAdminToast();

  const notifyError = useCallback(
    (messageKey: string, err: unknown) => {
      const resolved = parseStageActionError(err, messageKey);
      toast.showToast(resolved.startsWith('admin.') ? t(resolved) : resolved, 'error');
    },
    [t, toast],
  );

  const runOfferAction = useCallback(
    async (offer: InternshipOffer, action: OfferLifecycleAction) => {
      const previousUiStatus = offer.status;
      const optimisticNext = nextUiStatusForAction(action, previousUiStatus);
      const mutationKind = actionToMutationKind(action);

      emitStageOfferMutation({
        action: mutationKind,
        offerId: offer.id,
        previousUiStatus,
        nextUiStatus: optimisticNext,
        updatedOffer: optimisticNext ? { ...offer, status: optimisticNext } : undefined,
      });

      const apiAction = action === 'restore' ? 'restore' : action;

      try {
        const detail = await stageApi.action(offer.id, apiAction);
        const updatedOffer = mapStageOfferToAdminRow(detail);

        emitStageOfferMutation({
          action: mutationKind,
          offerId: offer.id,
          previousUiStatus,
          nextUiStatus: updatedOffer.status,
          updatedOffer,
        });
        emitStageOfferDashboardRefresh();

        const successKey =
          action === 'archive'
            ? 'admin.modules.offers.actions.archive.success'
            : action === 'restore'
              ? 'admin.modules.offers.actions.restore.success'
              : 'admin.modules.offers.actions.delete.success';
        toast.showToast(t(successKey), 'success');
      } catch (err) {
        emitStageOfferMutation({
          action: mutationKind,
          offerId: offer.id,
          previousUiStatus: optimisticNext ?? previousUiStatus,
          nextUiStatus: previousUiStatus,
          updatedOffer: offer,
        });

        const errorKey =
          action === 'archive'
            ? 'admin.modules.offers.actions.archive.errors.failed'
            : action === 'restore'
              ? 'admin.modules.offers.actions.restore.errors.failed'
              : 'admin.modules.offers.actions.delete.errors.failed';
        notifyError(errorKey, err);
        throw err;
      }
    },
    [notifyError, t, toast],
  );

  const archiveOffer = useCallback(
    (offer: InternshipOffer) => runOfferAction(offer, 'archive'),
    [runOfferAction],
  );

  const restoreOffer = useCallback(
    (offer: InternshipOffer) => runOfferAction(offer, 'restore'),
    [runOfferAction],
  );

  const deleteOffer = useCallback(
    (offer: InternshipOffer) => runOfferAction(offer, 'delete'),
    [runOfferAction],
  );

  return { archiveOffer, restoreOffer, deleteOffer };
}
