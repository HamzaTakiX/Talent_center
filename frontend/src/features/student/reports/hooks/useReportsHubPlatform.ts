import { useEffect, useState } from 'react';

import { REPORTS_HUB_BOOTSTRAP_MS } from '../constants/limits';
import {
  activeHubReport,
  hubDocumentsReferences,
  hubKpiMetrics,
  hubReports,
  hubSupervisorFeedback,
} from '../data/reportPlatformMock';

export function useReportsHubPlatform() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), REPORTS_HUB_BOOTSTRAP_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return {
    loading,
    report: activeHubReport,
    kpis: hubKpiMetrics,
    reports: hubReports,
    feedback: hubSupervisorFeedback,
    documents: hubDocumentsReferences,
  };
}
