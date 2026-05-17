import { FunctionComponent } from 'react';
import DocumentsFilteredListPage from '../../shared/DocumentsFilteredListPage';
import PendingDocumentsOverviewCards from '../components/PendingDocumentsOverviewCards';

const PendingDocumentsListPage: FunctionComponent = () => (
  <DocumentsFilteredListPage
    statusFilter="Pending"
    chartId="documents-pending-age"
    overviewCards={<PendingDocumentsOverviewCards />}
  />
);

export default PendingDocumentsListPage;
