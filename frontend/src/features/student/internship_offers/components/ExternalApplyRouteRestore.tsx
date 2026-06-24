import { FunctionComponent, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { stageApi } from '../../../shared/api/stageApi';
import { useExternalApplyConfirmation } from '../context/ExternalApplyConfirmationContext';
import {
  clearPendingExternalApply,
  getLatestPendingExternalApply,
} from '../helpers/externalApplyPendingStorage';
import { getOfferExternalApplicationUrl } from '../helpers/offerApplyAction';

interface ExternalApplyRouteRestoreProps {
  internshipGateActive?: boolean;
}

const ExternalApplyRouteRestore: FunctionComponent<ExternalApplyRouteRestoreProps> = ({
  internshipGateActive = false,
}) => {
  const { pathname } = useLocation();
  const { isOpen, openPendingConfirmation } = useExternalApplyConfirmation();

  useEffect(() => {
    if (isOpen || internshipGateActive) return;

    const pending = getLatestPendingExternalApply();
    if (!pending) return;

    let cancelled = false;

    void (async () => {
      const detail = await stageApi.detail(pending.offerId).catch(() => null);
      if (cancelled) return;

      const externalUrl = getOfferExternalApplicationUrl({
        externalUrl: detail?.external_url,
        metadata: detail?.metadata_json,
      });

      if (!externalUrl) {
        clearPendingExternalApply(pending.offerId);
        return;
      }

      openPendingConfirmation({
        offerId: pending.offerId,
        offerTitle: pending.offerTitle ?? detail?.title,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, isOpen, openPendingConfirmation, internshipGateActive]);

  return null;
};

export function useExternalApplyLeaveGuard(isActive: boolean): void {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isActive) return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = t('student.internshipOffers.externalApply.leaveWarning');
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, t]);
}

export default ExternalApplyRouteRestore;
