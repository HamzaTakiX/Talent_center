import { FunctionComponent } from 'react';
import DocumentsFilteredListPage from '../../shared/DocumentsFilteredListPage';
import ValidatedDocumentsOverviewCards from '../components/ValidatedDocumentsOverviewCards';

const ValidatedDocumentsListPage: FunctionComponent = () => (
  <DocumentsFilteredListPage
    statusFilter="Validated"
    chartId="documents-validated-trend"
    overviewCards={<ValidatedDocumentsOverviewCards />}
  />
);

export default ValidatedDocumentsListPage;
