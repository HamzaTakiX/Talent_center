import { FunctionComponent } from 'react';
import StudentCardStatGrid from '../../../components/StudentCardStatGrid';
import { totalStudentsCardStats } from '../data/totalStudentsCardStats';

const TotalStudentsStatGrid: FunctionComponent = () => (
  <StudentCardStatGrid stats={totalStudentsCardStats} />
);

export default TotalStudentsStatGrid;
