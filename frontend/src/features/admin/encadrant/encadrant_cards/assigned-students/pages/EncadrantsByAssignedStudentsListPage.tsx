import { FunctionComponent } from 'react';
import EncadrantFilteredListLayout from '../../shared/components/EncadrantFilteredListLayout';

const EncadrantsByAssignedStudentsListPage: FunctionComponent = () => (
  <EncadrantFilteredListLayout filter="with_students" chartId="encadrants-top-assigned" />
);

export default EncadrantsByAssignedStudentsListPage;
