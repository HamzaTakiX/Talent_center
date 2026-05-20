import { FunctionComponent } from 'react';
import StudentFilteredListLayout from '../../shared/components/StudentFilteredListLayout';

const InactiveStudentsListPage: FunctionComponent = () => (
  <StudentFilteredListLayout filter="inactive" chartId="students-active-split" />
);

export default InactiveStudentsListPage;
