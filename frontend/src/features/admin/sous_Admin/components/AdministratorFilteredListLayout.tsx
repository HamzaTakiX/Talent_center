import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { adminAdministratorsApi } from '../../api/administrators';
import type { AdminAdministratorRow, AdministratorListFilter } from '../types/platformAdministrators';
import { AdminStatChartSection, type StatPageChartId } from '../../ui';
import BackToAdminButton from './BackToAdminButton';
import AdministratorsRoleDistributionChart from './AdministratorsRoleDistributionChart';
import PlatformAdministratorsMainTable from './PlatformAdministratorsMainTable';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';

interface AdministratorFilteredListLayoutProps {
  filter: AdministratorListFilter;
  chartId?: StatPageChartId;
}

const AdministratorFilteredListLayout: FunctionComponent<AdministratorFilteredListLayoutProps> = ({
  filter,
  chartId,
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('admins');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [apiRows, setApiRows] = useState<AdminAdministratorRow[]>([]);

  useEffect(() => {
    adminAdministratorsApi
      .list({ role: filter === 'all' ? undefined : filter, page: 1, page_size: 500 })
      .then((data) => setApiRows(data.items))
      .catch(() => setApiRows([]));
  }, [filter]);

  const baseRows = useMemo(() => {
    if (filter === 'all') return apiRows;
    return apiRows.filter((r) => r.role_slugs.includes(filter));
  }, [filter, apiRows]);

  const totalCount = baseRows.length;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseRows;
    return baseRows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role_slugs.some((slug) => slug.includes(q)),
    );
  }, [query, baseRows]);

  const {
    page,
    setPage,
    paginatedItems,
    totalItems,
    totalPages,
    pageSize,
  } = useAdminPagination(filteredRows);

  const listTitle = t(`admin.pages.administrators.list.${filter}`);

  return (
    <AdminLayout>
      <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 pb-8 pt-0 font-inter">
        <BackToAdminButton onClick={() => navigate('/admin/admins')} />

        {chartId ? (
          <AdminStatChartSection chartId={chartId}>
            <AdministratorsRoleDistributionChart rows={apiRows} />
          </AdminStatChartSection>
        ) : null}

        <div className="box-border flex w-full min-w-0 flex-col gap-6 admin-module-panel text-left text-base text-[var(--admin-text)] shadow-sm">
          <div className="flex flex-col gap-4 px-3 pb-0 pt-6 sm:px-5 md:px-6">
            <div>
              <h1 className="text-base font-semibold leading-5 text-[var(--admin-text)]">
                {listTitle} ({totalCount})
              </h1>
              <p className="mt-1 text-sm leading-6 text-[var(--admin-text-secondary)]">
                {t('admin.modules.administratorsFiltered.subtitle')}
              </p>
            </div>
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPh}
                className="box-border h-10 w-full rounded-lg border-0 admin-field border border-[var(--admin-border)] bg-[var(--admin-input-bg)] py-2 pl-10 pr-4 text-num-14 leading-num-20 text-[var(--admin-text)] placeholder:text-[var(--admin-text-secondary)] outline-none ring-1 ring-inset ring-transparent focus:ring-[var(--admin-brand-muted)]"
              />
            </div>
          </div>

          <PlatformAdministratorsMainTable
            rows={paginatedItems}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdministratorFilteredListLayout;
