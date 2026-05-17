import { FunctionComponent, useState } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import EncadrantsSummaryGrid from '../components/EncadrantsSummaryGrid';
import EncadrantsTablePanel from '../components/EncadrantsTablePanel';
import { encadrantsMockRows } from '../data/encadrantsMockData';

const AllEncadrantsPage: FunctionComponent = () => {
  const [query, setQuery] = useState('');

  return (
    <AdminModulePageShell width="wide">
      <div data-admin-search-id="encadrants-stats">
        <EncadrantsSummaryGrid />
      </div>
      <div data-admin-search-id="encadrants-table">
        <EncadrantsTablePanel rows={encadrantsMockRows} query={query} onQueryChange={setQuery} />
      </div>
    </AdminModulePageShell>
  );
};

export default AllEncadrantsPage;
