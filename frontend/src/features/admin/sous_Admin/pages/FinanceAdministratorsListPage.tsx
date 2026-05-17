import { FunctionComponent } from 'react';
import AdministratorFilteredListLayout from '../components/AdministratorFilteredListLayout';

const FinanceAdministratorsListPage: FunctionComponent = () => (
  <AdministratorFilteredListLayout filter="finance" />
);

export default FinanceAdministratorsListPage;
