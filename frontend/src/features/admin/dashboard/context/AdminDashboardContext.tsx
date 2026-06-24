import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { adminAdministratorsApi } from '../../api/administrators';
import { adminDocumentsApi } from '../../api/documents';
import { adminEncadrantsApi } from '../../api/encadrants';
import { adminHistoryApi } from '../../api/history';
import { adminStudentsApi } from '../../api/students';
import { srfApi } from '../../api/srf';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import { formatRelativeTime } from '../../main_history/utils/formatRelativeTime';
import { stageApi } from '../../../shared/api/stageApi';
import {
  buildAdminDashboardViewModel,
  type AdminDashboardViewModel,
} from '../utils/buildAdminDashboardViewModel';
import { USE_ADMIN_DASHBOARD_MOCK } from '../data/adminMockData';
import type { StudentDashboardStats } from '../../api/types';

interface AdminDashboardContextValue {
  loading: boolean;
  error: string | null;
  viewModel: AdminDashboardViewModel;
  refresh: () => Promise<void>;
}

const EMPTY_VIEW_MODEL = buildAdminDashboardViewModel({
  studentStats: null,
  totalEncadrants: null,
  totalAdmins: null,
  stageDashboard: null,
  documentsDashboard: null,
  srfSummary: null,
  historyEvents: [],
  historySummary: null,
  formatRelativeTime: (iso) => iso,
});

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null);

export const AdminDashboardProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(!USE_ADMIN_DASHBOARD_MOCK);
  const [error, setError] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<AdminDashboardViewModel>(EMPTY_VIEW_MODEL);

  const formatTime = useCallback(
    (iso: string) =>
      formatRelativeTime(iso, Date.now(), (key, opts) => t(key, opts ?? {})),
    [t],
  );

  const refresh = useCallback(async () => {
    if (USE_ADMIN_DASHBOARD_MOCK) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [
        studentStats,
        encadrantsPage,
        adminsPage,
        stageDashboard,
        documentsDashboard,
        srfSummary,
        historyCenter,
      ] = await Promise.all([
        adminStudentsApi.stats() as Promise<StudentDashboardStats>,
        adminEncadrantsApi.list({ page: 1, page_size: 1 }),
        adminAdministratorsApi.list({ page: 1, page_size: 1 }),
        stageApi.dashboard(),
        adminDocumentsApi.dashboard(),
        srfApi.getDashboardSummary(),
        adminHistoryApi.center({ page_size: 50 }),
      ]);

      const next = buildAdminDashboardViewModel({
        studentStats,
        totalEncadrants: encadrantsPage.total,
        totalAdmins: adminsPage.total,
        stageDashboard,
        documentsDashboard,
        srfSummary,
        historyEvents: historyCenter.timeline?.items ?? [],
        historySummary: historyCenter.dashboard?.summary ?? null,
        formatRelativeTime: formatTime,
      });
      setViewModel(next);
    } catch (err) {
      setError(parseAdminApiError(err, 'dashboard_load_failed').message);
      setViewModel(EMPTY_VIEW_MODEL);
    } finally {
      setLoading(false);
    }
  }, [formatTime]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ loading, error, viewModel, refresh }),
    [loading, error, viewModel, refresh],
  );

  return (
    <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>
  );
};

export function useAdminDashboardContext(): AdminDashboardContextValue {
  const ctx = useContext(AdminDashboardContext);
  if (!ctx) {
    throw new Error('useAdminDashboardContext must be used within AdminDashboardProvider');
  }
  return ctx;
}
