import { FunctionComponent } from 'react';
import StudentFilteredListLayout from '../../shared/components/StudentFilteredListLayout';

const TotalStudentsListPage: FunctionComponent = () => (
  <StudentFilteredListLayout filter="all" chartId="students-total-enrollment" />
);

export default TotalStudentsListPage;
