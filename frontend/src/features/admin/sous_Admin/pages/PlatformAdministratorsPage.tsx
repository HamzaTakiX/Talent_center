import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminModulePanel from '../../ui/AdminModulePanel';
import { platformAdministratorsRows } from '../data/platformAdministratorsMock';
import PlatformAdministratorsKpiSection from '../components/PlatformAdministratorsKpiSection';
import PlatformAdministratorsToolbar from '../components/PlatformAdministratorsToolbar';
import PlatformAdministratorsMainTable from '../components/PlatformAdministratorsMainTable';

const PlatformAdministratorsPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return platformAdministratorsRows;
    return platformAdministratorsRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.roleLabel.toLowerCase().includes(q) ||
        r.permissionLabel.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <AdminModulePageShell width="wide">
      <div data-admin-search-id="admins-stats">
        <PlatformAdministratorsKpiSection />
      </div>
      <div data-admin-search-id="admins-table">
        <AdminModulePanel>
          <PlatformAdministratorsToolbar
            query={query}
            onQueryChange={setQuery}
            onCreateAdmin={() => navigate('/admin/admins/create-administrator')}
          />
          <PlatformAdministratorsMainTable rows={filteredRows} />
        </AdminModulePanel>
      </div>
    </AdminModulePageShell>
  );
};

export default PlatformAdministratorsPage;
