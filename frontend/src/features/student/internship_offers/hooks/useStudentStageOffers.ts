import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminHistoryApi, type HistoryEventDto } from '../../../admin/api/history';
import { stageApi } from '../../../shared/api/stageApi';
import {
  mapRecommendationToStudentCard,
  mapStageDetailToStudentDetails,
  mapStageOfferToStudentCard,
} from '../../../shared/utils/stageMappers';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import type { InternshipOfferDetails, InternshipOffersStatItem } from '../types';
import type { StageMatchScore, StageOfferListItem } from '../../../shared/types/stageTypes';

function buildMatchByOfferMap(matches: StageMatchScore[]) {
  const map = new Map<string, number>();
  for (const match of matches) {
    if (match.offer_uuid) {
      map.set(match.offer_uuid, Math.round(match.score));
    }
    if (match.offer_title) {
      map.set(match.offer_title.toLowerCase(), Math.round(match.score));
    }
  }
  return map;
}

function mapVisibleOffersToStudentCards(
  items: StageOfferListItem[],
  matchByOffer: Map<string, number>,
) {
  return items.map((offer) =>
    mapStageOfferToStudentCard(
      offer,
      matchByOffer.get(offer.uuid) ?? matchByOffer.get(offer.title.toLowerCase()) ?? 0,
    ),
  );
}

async function loadVisibleStudentOffers(limit = 20) {
  const [list, matchScores] = await Promise.all([
    stageApi.list({ page_size: limit }),
    stageApi.studentMatches(limit).catch(() => [] as StageMatchScore[]),
  ]);
  const matchByOffer = buildMatchByOfferMap(matchScores);
  return mapVisibleOffersToStudentCards(list.items, matchByOffer);
}

export function useStudentRecommendations() {
  const [offers, setOffers] = useState<ReturnType<typeof mapRecommendationToStudentCard>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recs = await stageApi.recommendations();
      if (recs.length > 0) {
        setOffers(recs.map(mapRecommendationToStudentCard));
        return;
      }
      setOffers(await loadVisibleStudentOffers(12));
    } catch (err) {
      setError(parseAdminApiError(err, 'recommendations_load_failed').message);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { offers, loading, error, refresh };
}

export function useStudentAllOffers(search = '', category = 'all') {
  const [rawOffers, setRawOffers] = useState<StageOfferListItem[]>([]);
  const [matches, setMatches] = useState<StageMatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      stageApi.list({ page_size: 100 }),
      stageApi.studentMatches(100).catch(() => [] as StageMatchScore[]),
    ])
      .then(([list, matchScores]) => {
        setRawOffers(list.items);
        setMatches(matchScores);
      })
      .catch((err) => {
        setError(parseAdminApiError(err, 'offers_load_failed').message);
        setRawOffers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const matchByOffer = useMemo(() => buildMatchByOfferMap(matches), [matches]);

  const offers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = rawOffers.filter((o) => {
      if (category !== 'all' && o.offer_type !== category) return false;
      if (!q) return true;
      return (
        o.title.toLowerCase().includes(q) ||
        o.company_name.toLowerCase().includes(q)
      );
    });
    return mapVisibleOffersToStudentCards(filtered, matchByOffer);
  }, [rawOffers, search, category, matchByOffer]);

  return { offers, loading, error };
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
    ])
      .then(([offer, match]) => {
        const matchPercent = match ? Math.round(match.score) : 0;
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
  payload: { cover_letter?: string; student_cv_id?: number },
) {
  return stageApi.apply(offerUuid, payload);
}
