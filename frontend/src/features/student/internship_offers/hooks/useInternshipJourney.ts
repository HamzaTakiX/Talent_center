import { useCallback, useEffect, useState } from 'react';
import { stageApi } from '../../../shared/api/stageApi';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import type {
  ApplicationDetail,
  ApplicationReadiness,
  InternshipJourneyDashboard,
  JourneyApplication,
  OfferMatchDetail,
  OffersFeed,
} from '../types/journeyTypes';

export function useInternshipJourneyDashboard() {
  const [data, setData] = useState<InternshipJourneyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await stageApi.journeyDashboard());
    } catch (err) {
      setError(parseAdminApiError(err, 'journey_load_failed').message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useStudentApplications(activeOnly = false) {
  const [applications, setApplications] = useState<JourneyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await stageApi.myApplications(activeOnly));
    } catch (err) {
      setError(parseAdminApiError(err, 'applications_load_failed').message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { applications, loading, error, refresh };
}

export function useApplicationDetail(appUuid: string | undefined) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(appUuid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appUuid) return;
    setLoading(true);
    setError(null);
    stageApi.applicationDetail(appUuid)
      .then(setDetail)
      .catch((err) => {
        setError(parseAdminApiError(err, 'application_not_found').message);
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [appUuid]);

  return { detail, loading, error };
}

export function useOffersFeed() {
  const [feed, setFeed] = useState<OffersFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    stageApi.offersFeed()
      .then(setFeed)
      .catch((err) => {
        setError(parseAdminApiError(err, 'feed_load_failed').message);
        setFeed(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { feed, loading, error };
}

export function useApplicationReadiness(offerUuid: string | undefined) {
  const [readiness, setReadiness] = useState<ApplicationReadiness | null>(null);
  const [loading, setLoading] = useState(Boolean(offerUuid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerUuid) return;
    setLoading(true);
    stageApi.applicationReadiness(offerUuid)
      .then(setReadiness)
      .catch((err) => {
        setError(parseAdminApiError(err, 'readiness_load_failed').message);
        setReadiness(null);
      })
      .finally(() => setLoading(false));
  }, [offerUuid]);

  return { readiness, loading, error };
}

export function useOfferMatch(offerUuid: string | undefined) {
  const [match, setMatch] = useState<OfferMatchDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(offerUuid));

  useEffect(() => {
    if (!offerUuid) return;
    setLoading(true);
    stageApi.offerMatch(offerUuid)
      .then(setMatch)
      .catch(() => setMatch(null))
      .finally(() => setLoading(false));
  }, [offerUuid]);

  return { match, loading };
}
