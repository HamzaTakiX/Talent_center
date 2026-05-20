import { useCallback, useEffect, useState } from 'react';
import { srfApi, type StudentFinancialTableRow } from '../../api/srf';
import type { SrfSubpageId } from '../constants';
import { SRF_SUBPAGE_CONFIG } from '../constants';
import { SRF_DATA_INVALIDATED_EVENT } from '../utils/srfDataSync';

function useSrfAutoReload(reload: () => void) {
  useEffect(() => {
    const onInvalidate = () => void reload();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload();
    };
    window.addEventListener(SRF_DATA_INVALIDATED_EVENT, onInvalidate);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(SRF_DATA_INVALIDATED_EVENT, onInvalidate);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [reload]);
}

export function useSrfKpiCards(academicYear?: string) {
  const [cards, setCards] = useState<Awaited<ReturnType<typeof srfApi.getKpiCards>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await srfApi.getKpiCards(academicYear);
      setCards(data);
    } catch {
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useSrfAutoReload(reload);

  return { cards, loading, error, reload };
}

export function useSrfStudentRows(params?: {
  academic_year?: string;
  queue?: string;
  financial_status?: string;
}) {
  const [rows, setRows] = useState<StudentFinancialTableRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queue = params?.queue;
  const academicYear = params?.academic_year;
  const financialStatus = params?.financial_status;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await srfApi.getStudentRows({
        academic_year: academicYear,
        queue,
        financial_status: financialStatus,
      });
      setRows(data.rows);
      setCount(data.count);
    } catch {
      setError('load_failed');
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [academicYear, queue, financialStatus]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useSrfAutoReload(reload);

  return { rows, count, loading, error, reload };
}

export function useSrfSubpage(subpageId: SrfSubpageId, academicYear?: string) {
  const config = SRF_SUBPAGE_CONFIG[subpageId];
  const { cards, loading: kpiLoading, error: kpiError, reload: reloadKpi } = useSrfKpiCards(academicYear);
  const {
    rows,
    count,
    loading: rowsLoading,
    error: rowsError,
    reload: reloadRows,
  } = useSrfStudentRows({
    academic_year: academicYear,
    queue: config.queue,
    financial_status: config.financialStatus,
  });

  const kpiCard = cards.find((c) => c.key === config.kpiKey);
  const kpiValue = kpiCard?.value ?? count;

  const reload = useCallback(() => {
    void reloadKpi();
    void reloadRows();
  }, [reloadKpi, reloadRows]);

  return {
    config,
    rows,
    count,
    kpiValue,
    loading: kpiLoading || rowsLoading,
    kpiLoading,
    rowsLoading,
    error: kpiError || rowsError,
    reload,
  };
}

export function useSrfPaymentProofQueue() {
  const [proofs, setProofs] = useState<Awaited<ReturnType<typeof srfApi.getPaymentProofQueue>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await srfApi.getPaymentProofQueue();
      setProofs(data);
    } catch {
      setError('load_failed');
      setProofs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { proofs, loading, error, reload };
}
