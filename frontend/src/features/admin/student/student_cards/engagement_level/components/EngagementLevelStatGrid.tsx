import { FunctionComponent } from 'react';
import StudentCardStatGrid from '../../../components/StudentCardStatGrid';
import { engagementLevelCardStats } from '../data/engagementLevelCardStats';

const EngagementLevelStatGrid: FunctionComponent = () => (
  <StudentCardStatGrid stats={engagementLevelCardStats} />
);

export default EngagementLevelStatGrid;
