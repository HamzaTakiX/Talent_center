import { FunctionComponent } from 'react';
import AdministratorFilteredListLayout from '../components/AdministratorFilteredListLayout';

const AllAdministratorsListPage: FunctionComponent = () => (
  <AdministratorFilteredListLayout filter="all" chartId="admins-role-distribution" />
);

export default AllAdministratorsListPage;
