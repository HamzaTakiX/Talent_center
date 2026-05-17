import { FunctionComponent } from 'react';
import StudentCardStatGrid from '../../../components/StudentCardStatGrid';
import { withoutInternshipCardStats } from '../data/withoutInternshipCardStats';

const WithoutInternshipStatGrid: FunctionComponent = () => (
  <StudentCardStatGrid stats={withoutInternshipCardStats} />
);

export default WithoutInternshipStatGrid;
