import { FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { announcementsMockData } from '../data/announcementsMockData';
import { AnnouncementRow } from '../types';
import AnnouncementsStats from '../components/AnnouncementsStats';
import AnnouncementsTable from '../components/AnnouncementsTable';
import type { AnnouncementTypeFilter } from '../components/AnnouncementsToolbar';

const AnnouncementsPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const tableSectionRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AnnouncementTypeFilter>('all');
  const [rows, setRows] = useState<AnnouncementRow[]>(() => [...announcementsMockData]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchType = typeFilter === 'all' || row.type === typeFilter;
      if (!q) return matchType;
      const matchQuery =
        row.title.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q) ||
        row.targetAudience.toLowerCase().includes(q) ||
        row.date.includes(q);
      return matchType && matchQuery;
    });
  }, [query, rows, typeFilter]);

  const scrollToTable = useCallback(() => {
    tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleStatCardClick = useCallback(
    (statKey: string) => {
      if (statKey === 'total' || statKey === 'admin.kpi.announcements.total') {
        navigate('/admin/announcements/all');
        return;
      }
      if (statKey === 'active' || statKey === 'admin.kpi.announcements.active') {
        navigate('/admin/announcements/active');
        return;
      }
      scrollToTable();
      if (statKey === 'admin.kpi.announcements.engagementRate' || statKey === 'Engagement Rate') {
        setQuery('');
        setTypeFilter('Interview');
        return;
      }
      if (statKey === 'admin.kpi.announcements.avgReach' || statKey === 'Avg Reach') {
        setQuery('');
        setTypeFilter('Info');
      }
    },
    [navigate, scrollToTable]
  );

  const handleCreate = useCallback(() => {
    navigate('/admin/announcements/create');
  }, [navigate]);

  const handleView = useCallback(
    (row: AnnouncementRow) => {
      navigate(`/admin/announcements/${row.id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (row: AnnouncementRow) => {
      navigate(`/admin/announcements/${row.id}/edit`);
    },
    [navigate]
  );

  const handleDelete = useCallback((row: AnnouncementRow) => {
    if (!window.confirm(`Supprimer l'annonce « ${row.title} » ?`)) return;
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  }, []);

  return (
    <AdminModulePageShell width="wide">
      <div data-admin-search-id="announcements-stats">
        <AnnouncementsStats onStatCardClick={handleStatCardClick} />
      </div>
      <div ref={tableSectionRef} data-admin-search-id="announcements-table">
        <AnnouncementsTable
          rows={filteredRows}
          query={query}
          onQueryChange={setQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AdminModulePageShell>
  );
};

export default AnnouncementsPage;
