import { FunctionComponent } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import InternshipOffersStats from '../components/InternshipOffersStats';
import InternshipOffersTable from '../components/InternshipOffersTable';

const InternshipOffersPage: FunctionComponent = () => (
  <AdminModulePageShell width="wide">
    <div data-admin-search-id="offers-stats">
      <InternshipOffersStats />
    </div>
    <div data-admin-search-id="offers-table">
      <InternshipOffersTable />
    </div>
  </AdminModulePageShell>
);

export default InternshipOffersPage;
