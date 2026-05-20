import { FunctionComponent } from 'react';
import StudentFilteredListLayout from '../../shared/components/StudentFilteredListLayout';

const WithoutInternshipListPage: FunctionComponent = () => (
  <StudentFilteredListLayout filter="without_internship" chartId="students-without-internship" />
);

export default WithoutInternshipListPage;
