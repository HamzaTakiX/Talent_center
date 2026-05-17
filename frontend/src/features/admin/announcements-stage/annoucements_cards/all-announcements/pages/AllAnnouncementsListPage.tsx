import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';
import AllAnnouncementsTableContent from '../components/AllAnnouncementsTableContent';
import {
  ALL_ANNOUNCEMENTS_COUNT,
  allAnnouncementsRows,
  type AllAnnouncementsTypeFilter,
} from '../data/allAnnouncementsMockData';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'Event', label: 'Event' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Info', label: 'Info' },
] as const;

const AllAnnouncementsListPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AllAnnouncementsTypeFilter>('all');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allAnnouncementsRows.filter((row) => {
      const matchType = typeFilter === 'all' || row.type === typeFilter;
      if (!q) return matchType;
      const matchQuery =
        row.title.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q) ||
        row.targetAudience.toLowerCase().includes(q) ||
        row.date.includes(q);
      return matchType && matchQuery;
    });
  }, [query, typeFilter]);

  const totalFormatted = ALL_ANNOUNCEMENTS_COUNT.toLocaleString('en-US');

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/announcements')}
      backTo="announcements"
    >
      <AdminStatChartSection chartId="announcements-type-mix" />
      <AdminStatDetailPanel
        title={pageTitle('announcements.all.title', { count: totalFormatted })}
        subtitle={filterSubtitle('announcements')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('announcements')}
        toolbarAriaLabel={pageTitle('announcements.filterAllToolbar')}
        filter1={{
          value: typeFilter,
          onChange: (v) => setTypeFilter(v as AllAnnouncementsTypeFilter),
          options: [...TYPE_OPTIONS],
          ariaLabel: 'Filter by type',
        }}
      >
        <AllAnnouncementsTableContent rows={filteredRows} />
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default AllAnnouncementsListPage;
