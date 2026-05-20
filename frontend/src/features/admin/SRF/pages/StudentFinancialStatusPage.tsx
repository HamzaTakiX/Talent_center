import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Upload, Shield, Settings2 } from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import StudentFinancialSummaryGrid from '../components/StudentFinancialSummaryGrid';
import StudentFinancialStatusTable from '../components/StudentFinancialStatusTable';
import { useSrfStudentRows } from '../hooks/useSrfFinancial';
import { SrfErrorState } from '../components/SrfModuleStates';

const StudentFinancialStatusPage: FunctionComponent = () => {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rows, loading, error, reload } = useSrfStudentRows();

  return (
    <AdminModulePageShell width="wide">
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl admin-module-panel border border-[var(--admin-border)] px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Settings2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-[var(--admin-text)]">
                {t('admin.modules.srf.configCenter.title')}
              </p>
              <p className="mt-1 max-w-xl text-xs text-[var(--admin-text-secondary)]">
                {t('admin.modules.srf.configCenter.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/srf/config')}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-brand)] bg-[var(--admin-brand)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--admin-brand)] hover:bg-[var(--admin-brand)]/20"
          >
            <Settings2 className="h-4 w-4" />
            {t('admin.modules.srf.configCenter.openCenter')}
          </button>
        </article>
        <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl admin-module-panel border border-[var(--admin-border)] px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-[var(--admin-text)]">
                {t('admin.modules.srf.importCenter.title')}
              </p>
              <p className="mt-1 max-w-xl text-xs text-[var(--admin-text-secondary)]">
                {t('admin.modules.srf.importCenter.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/srf/imports')}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90"
          >
            <Upload className="h-4 w-4" />
            {t('admin.modules.srf.importCenter.openCenter')}
          </button>
        </article>
      </section>
      <div data-admin-search-id="srf-stats">
        <StudentFinancialSummaryGrid />
      </div>
      <div data-admin-search-id="srf-table">
        {error ? (
          <SrfErrorState onRetry={reload} />
        ) : (
          <StudentFinancialStatusTable
            rows={rows}
            loading={loading}
            query={query}
            onQueryChange={setQuery}
            emptyTitleKey="admin.empty.srfNoAccounts"
            emptyDescriptionKey="admin.empty.srfNoAccountsDesc"
            searchEmptyTitleKey="admin.empty.srfSearchFilters"
          />
        )}
      </div>
    </AdminModulePageShell>
  );
};

export default StudentFinancialStatusPage;
