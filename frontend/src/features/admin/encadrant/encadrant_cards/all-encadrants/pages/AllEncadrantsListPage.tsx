import { FunctionComponent } from 'react';
import EncadrantFilteredListLayout from '../../shared/components/EncadrantFilteredListLayout';

const AllEncadrantsListPage: FunctionComponent = () => (
  <EncadrantFilteredListLayout filter="all" chartId="encadrants-department-load" />
);

export default AllEncadrantsListPage;
