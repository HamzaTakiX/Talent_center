import { FunctionComponent } from 'react';
import AdminModulePageShell from '../../../ui/AdminModulePageShell';
import InternshipOffersDraftsStats from '../components/InternshipOffersDraftsStats';
import InternshipOffersDraftsTable from '../components/InternshipOffersDraftsTable';

const InternshipOffersDraftsPage: FunctionComponent = () => (
  <AdminModulePageShell width="wide">
    <div data-admin-search-id="offers-drafts-stats">
      <InternshipOffersDraftsStats />
    </div>
    <div data-admin-search-id="offers-drafts-table">
      <InternshipOffersDraftsTable />
    </div>
  </AdminModulePageShell>
);

export default InternshipOffersDraftsPage;
