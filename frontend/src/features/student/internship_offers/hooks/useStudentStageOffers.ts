import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminHistoryApi, type HistoryEventDto } from '../../../admin/api/history';
import { useAuth } from '../../../auth/hooks/useAuth';
import { stageApi } from '../../../shared/api/stageApi';
import {
  mapRecommendationToStudentCard,
  mapStageDetailToStudentDetails,
  mapStageOfferToStudentCard,
} from '../../../shared/utils/stageMappers';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import {
  getCvMatchPercent,
  loadCvInternshipMatchMap,
} from '../CV_Analyse/utils/cvInternshipMatchMap';
import { buildRecommendedInternshipOffers } from '../helpers/recommendedInternshipOffers';
import { applyInternshipOfferFilters } from '../helpers/applyInternshipOfferFilters';
import type {
  InternshipOfferDateFilter,
  InternshipOfferDistanceSort,
} from '../constants/internshipOfferFilters';
import { useStudentOfferLocation } from './useStudentOfferLocation';
import type { InternshipOfferDetails, InternshipOffersStatItem } from '../types';
import type { StageMatchScore, StageOfferListItem } from '../../../shared/types/stageTypes';

function buildEngineMatchMap(scores: StageMatchScore[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const score of scores) {
    const offerId = score.offer_uuid ? String(score.offer_uuid) : '';
    if (!offerId) continue;
    map.set(offerId, Math.round(Number(score.score) || 0));
  }
  return map;
}

function mapVisibleOffersToStudentCards(
  items: StageOfferListItem[],
  cvMatchMap: Map<string, number>,
  engineMatchMap: Map<string, number> = new Map(),
) {
  return items.map((offer) => {
    const cvMatch = getCvMatchPercent(cvMatchMap, offer.uuid);
    const engineScore = engineMatchMap.get(offer.uuid) ?? 0;
    return mapStageOfferToStudentCard(offer, Math.max(cvMatch, engineScore));
  });
}

export function useStudentRecentOffers(limit = 2) {
  const [offers, setOffers] = useState<ReturnType<typeof mapStageOfferToStudentCard>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.all([
      stageApi.list({ page_size: limit }),
      loadCvInternshipMatchMap(100),
      stageApi.studentMatches(100).catch(() => [] as StageMatchScore[]),
    ])
      .then(([list, matchMap, engineScores]) => {
        if (cancelled) return;
        setOffers(
          mapVisibleOffersToStudentCards(
            list.items,
            matchMap,
            buildEngineMatchMap(engineScores),
          ).slice(0, limit),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(parseAdminApiError(err, 'offers_load_failed').message);
        setOffers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { offers, loading, error };
}

export function useStudentRecommendations() {
  const { user } = useAuth();
  const studentInternshipTypeName = user?.student_profile?.internship_type_name;
  const [offers, setOffers] = useState<ReturnType<typeof mapRecommendationToStudentCard>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, matchMap] = await Promise.all([
        stageApi.recommendations(),
        loadCvInternshipMatchMap(100),
      ]);
      const mapped = recs.map((rec) => {
        const cvMatch = getCvMatchPercent(matchMap, rec.offer_uuid);
        const recommendationScore = Math.round(Number(rec.score) || 0);
        // Prefer the stronger signal: CV analysis or recommendation engine score.
        // Avoid treating missing CV match (0) as a real 0% override.
        return mapRecommendationToStudentCard(rec, Math.max(cvMatch, recommendationScore));
      });
      setOffers(buildRecommendedInternshipOffers(mapped, studentInternshipTypeName));
    } catch (err) {
      setError(parseAdminApiError(err, 'recommendations_load_failed').message);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [studentInternshipTypeName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { offers, loading, error, refresh };
}

export interface StudentAllOffersFilters {
  search?: string;
  dateFilter?: InternshipOfferDateFilter;
  maxDistanceKm?: number;
  distanceSort?: InternshipOfferDistanceSort;
}

export function useStudentAllOffers(filters: StudentAllOffersFilters = {}) {
  const {
    search = '',
    dateFilter = 'all',
    maxDistanceKm = 100,
    distanceSort = 'none',
  } = filters;
  const studentLocation = useStudentOfferLocation();
  const [rawOffers, setRawOffers] = useState<StageOfferListItem[]>([]);
  const [cvMatchMap, setCvMatchMap] = useState<Map<string, number>>(new Map());
  const [engineMatchMap, setEngineMatchMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      stageApi.list({ page_size: 100 }),
      loadCvInternshipMatchMap(100),
      stageApi.studentMatches(100).catch(() => [] as StageMatchScore[]),
    ])
      .then(([list, cvScores, engineScores]) => {
        setRawOffers(list.items);
        setCvMatchMap(cvScores);
        setEngineMatchMap(buildEngineMatchMap(engineScores));
      })
      .catch((err) => {
        setError(parseAdminApiError(err, 'offers_load_failed').message);
        setRawOffers([]);
        setCvMatchMap(new Map());
        setEngineMatchMap(new Map());
      })
      .finally(() => setLoading(false));
  }, []);

  const offers = useMemo(() => {
    const mapped = mapVisibleOffersToStudentCards(rawOffers, cvMatchMap, engineMatchMap);
    return applyInternshipOfferFilters({
      offers: mapped,
      search,
      dateFilter,
      maxDistanceKm,
      distanceSort,
      userLocation: studentLocation.point,
    });
  }, [
    rawOffers,
    search,
    dateFilter,
    maxDistanceKm,
    distanceSort,
    cvMatchMap,
    engineMatchMap,
    studentLocation.point,
  ]);

  return { offers, loading, error, studentLocation };
}

export function useStudentOfferDetail(uuid: string | undefined) {
  const [detail, setDetail] = useState<InternshipOfferDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(uuid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    setError(null);
    Promise.all([
      stageApi.detail(uuid),
      stageApi.offerMatch(uuid).catch(() => null),
      loadCvInternshipMatchMap(100),
    ])
      .then(([offer, match, matchMap]) => {
        const cvMatch = getCvMatchPercent(matchMap, uuid);
        const engineScore = match ? Math.round(Number(match.score) || 0) : 0;
        const matchPercent = Math.max(cvMatch, engineScore);
        const details = mapStageDetailToStudentDetails(offer, matchPercent);
        if (match) {
          details.matchReasons = match.reasons.map((r) => r.reason);
          details.matchingSkills = match.reasons
            .filter((r) => (r.score ?? 0) > 0)
            .map((r) => ({ label: r.dimension ?? 'match', description: r.reason }));
          details.skillsToDevelop = match.missing_skills.map((skill) => ({
            label: skill,
            description: '',
          }));
          details.aiMatchSummary = match.is_eligible
            ? match.reasons.map((r) => r.reason).join(' · ')
            : '';
        }
        setDetail(details);
      })
      .catch((err) => {
        setError(parseAdminApiError(err, 'offer_not_found').message);
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  return { detail, loading, error };
}

export function useStudentInternshipStats() {
  const [stats, setStats] = useState<InternshipOffersStatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminHistoryApi
      .dashboard({ kpi: 'internship_offers', lite: true })
      .then((data) => {
        const byKey = Object.fromEntries(
          (data.audit_stats ?? []).map((s) => [s.key, s.value]),
        );
        setStats([
          { label: 'Total Applications', value: String(byKey.my_applications ?? 0), iconKey: 'applications' },
          { label: 'Pending', value: String(byKey.pending_applications ?? 0), iconKey: 'pending' },
          { label: 'Accepted', value: String(byKey.accepted_applications ?? 0), iconKey: 'accepted' },
          { label: 'Rejected', value: String(byKey.rejected_applications ?? 0), iconKey: 'rejected' },
        ]);
      })
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

export function useStudentInternshipHistory(search = '', activityType = 'all') {
  const [rows, setRows] = useState<HistoryEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminHistoryApi
      .list({ kpi: 'internship_offers', page_size: 50, search: search || undefined })
      .then((data) => setRows(data.items))
      .catch((err) => {
        setError(parseAdminApiError(err, 'history_load_failed').message);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [search, activityType]);

  return { rows, loading, error };
}

export async function submitStudentApplication(
  offerUuid: string,
  payload: { cover_letter?: string; student_cv_id?: number; external_confirmation?: boolean },
) {
  return stageApi.apply(offerUuid, payload);
}

export async function submitExternalStudentApplication(offerUuid: string) {
  return stageApi.apply(offerUuid, { external_confirmation: true });
}
