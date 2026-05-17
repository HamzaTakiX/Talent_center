import { FunctionComponent } from 'react';
import StudentCardStatGrid from '../../../components/StudentCardStatGrid';
import { withInternshipCardStats } from '../data/withInternshipCardStats';

const WithInternshipStatGrid: FunctionComponent = () => (
  <StudentCardStatGrid stats={withInternshipCardStats} />
);

export default WithInternshipStatGrid;
