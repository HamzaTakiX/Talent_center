import { FunctionComponent } from 'react';
import StudentFilteredListLayout from '../../shared/components/StudentFilteredListLayout';

const ActiveStudentsListPage: FunctionComponent = () => (
  <StudentFilteredListLayout filter="active" chartId="students-active-split" />
);

export default ActiveStudentsListPage;
