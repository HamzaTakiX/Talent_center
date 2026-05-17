import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import type { AdministratorListFilter } from '../types/platformAdministrators';
import { platformAdministratorsRows } from '../data/platformAdministratorsMock';
import {
  PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ALL_CLASS,
  PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ROLE_CLASS
} from '../constants/platformAdministratorsUi';
import { AdminStatChartSection, type StatPageChartId } from '../../ui';
import BackToAdminButton from './BackToAdminButton';
import AdministratorSublistTable from './AdministratorSublistTable';

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

  const baseRows = useMemo(() => {
    if (filter === 'all') return platformAdministratorsRows;
    return platformAdministratorsRows.filter((r) => r.roleVariant === filter);
  }, [filter]);

  const totalCount = baseRows.length;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseRows;
    return baseRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.roleLabel.toLowerCase().includes(q) ||
        r.permissionLabel.toLowerCase().includes(q)
    );
  }, [query, baseRows]);

  const primaryBtnClass =
    filter === 'all'
      ? PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ALL_CLASS
      : PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ROLE_CLASS;

  const listTitle = t(`admin.pages.administrators.list.${filter}`);

  return (
    <AdminLayout>
      <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 pb-8 pt-0 font-inter">
        <BackToAdminButton onClick={() => navigate('/admin/admins')} />

        {chartId ? <AdminStatChartSection chartId={chartId} /> : null}

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

          <AdministratorSublistTable rows={filteredRows} primaryActionButtonClassName={primaryBtnClass} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdministratorFilteredListLayout;
