import { useEffect, useMemo, useState } from 'react';
import { stageApi } from '../../../shared/api/stageApi';
import { mapStageDetailToStudentDetails } from '../../../shared/utils/stageMappers';
import type { StageApplication, StageOfferDetail } from '../../../shared/types/stageTypes';
import type { InternshipOfferDetails } from '../../../student/internship_offers/types';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import { buildOfferDetailViewModel, type OfferDetailViewModel } from '../utils/offerDetailViewModel';

export function useAdminOfferDetailPage(offerUuid: string | undefined) {
  const [detail, setDetail] = useState<StageOfferDetail | null>(null);
  const [applications, setApplications] = useState<StageApplication[]>([]);
  const [loading, setLoading] = useState(Boolean(offerUuid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerUuid) {
      setDetail(null);
      setApplications([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([stageApi.detail(offerUuid), stageApi.applications(offerUuid)])
      .then(([offerDetail, apps]) => {
        if (cancelled) return;
        setDetail(offerDetail);
        setApplications(apps);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(parseAdminApiError(err, 'offer_not_found').message);
        setDetail(null);
        setApplications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [offerUuid]);

  const viewModel = useMemo(
    (): OfferDetailViewModel | null =>
      detail ? buildOfferDetailViewModel(detail, applications) : null,
    [detail, applications],
  );

  const studentOffer = useMemo((): InternshipOfferDetails | null => {
    if (!detail) return null;
    return mapStageDetailToStudentDetails(detail, 0);
  }, [detail]);

  return { detail, applications, loading, error, viewModel, studentOffer };
}
