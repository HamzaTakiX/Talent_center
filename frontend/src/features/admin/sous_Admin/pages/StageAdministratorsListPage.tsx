import { FunctionComponent } from 'react';
import AdministratorFilteredListLayout from '../components/AdministratorFilteredListLayout';

const StageAdministratorsListPage: FunctionComponent = () => (
  <AdministratorFilteredListLayout filter="stage" />
);

export default StageAdministratorsListPage;
