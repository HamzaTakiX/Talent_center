import { FunctionComponent, useEffect, useState } from 'react';
import type { SrfSubpageId } from '../constants';
import { useSrfSubpage } from '../hooks/useSrfFinancial';
import { srfApi } from '../../api/srf';
import SrfDetailKpiGrid from './SrfDetailKpiGrid';
import { SrfErrorState, SrfKpiLoading } from './SrfModuleStates';
import { buildSubpageKpiItems } from '../utils/srfSubpageKpiConfig';

interface SrfSubpageKpiCardsProps {
  subpageId: SrfSubpageId;
}

const SrfSubpageKpiCards: FunctionComponent<SrfSubpageKpiCardsProps> = ({ subpageId }) => {
  const { rows, kpiValue, kpiLoading, rowsLoading, error, reload } = useSrfSubpage(subpageId);
  const [installmentCompletionPct, setInstallmentCompletionPct] = useState<number | null>(null);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof srfApi.getDashboardSummary>> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [sum, analytics] = await Promise.all([
          srfApi.getDashboardSummary(),
          srfApi.getAnalytics(),
        ]);
        if (!cancelled) {
          setSummary(sum);
          const ic = analytics as { installment_completion?: { completion_rate_pct?: number } };
          setInstallmentCompletionPct(ic?.installment_completion?.completion_rate_pct ?? null);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
          setInstallmentCompletionPct(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = kpiLoading || rowsLoading;

  if (error && !loading) {
    return <SrfErrorState onRetry={reload} />;
  }

  if (loading) {
    return <SrfKpiLoading count={4} />;
  }

  const items = buildSubpageKpiItems(subpageId, {
    rows,
    kpiValue,
    summary,
    installmentCompletionPct,
  });

  return <SrfDetailKpiGrid items={items} columns={4} />;
};

export default SrfSubpageKpiCards;
