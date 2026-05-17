import { FunctionComponent } from 'react';
import DocumentsFilteredListPage from '../../shared/DocumentsFilteredListPage';
import RejectedDocumentsOverviewCards from '../components/RejectedDocumentsOverviewCards';

const RejectedDocumentsListPage: FunctionComponent = () => (
  <DocumentsFilteredListPage
    statusFilter="Rejected"
    chartId="documents-rejected-reasons"
    overviewCards={<RejectedDocumentsOverviewCards />}
  />
);

export default RejectedDocumentsListPage;
