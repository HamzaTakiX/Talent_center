import { FunctionComponent } from 'react';
import StudentFilteredListLayout from '../../shared/components/StudentFilteredListLayout';

const WithInternshipListPage: FunctionComponent = () => (
  <StudentFilteredListLayout filter="with_internship" chartId="students-with-internship" />
);

export default WithInternshipListPage;
