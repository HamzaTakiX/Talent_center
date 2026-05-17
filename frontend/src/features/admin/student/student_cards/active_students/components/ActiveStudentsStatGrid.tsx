import { FunctionComponent } from 'react';
import StudentCardStatGrid from '../../../components/StudentCardStatGrid';
import { activeStudentsCardStats } from '../data/activeStudentsCardStats';

const ActiveStudentsStatGrid: FunctionComponent = () => (
  <StudentCardStatGrid stats={activeStudentsCardStats} />
);

export default ActiveStudentsStatGrid;
