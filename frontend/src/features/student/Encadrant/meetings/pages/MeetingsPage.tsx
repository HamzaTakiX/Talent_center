import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import WorkspaceMeetingsHub from '../../workspace/components/WorkspaceMeetingsHub';
import { WORKSPACE_PAGE_ROOT } from '../../workspace/constants/workspaceLayout';
import MeetingsPageHeader from '../components/MeetingsPageHeader';

const MeetingsPage: FunctionComponent = () => (
  <StudentLayout>
    <div id="student-encadrant-meetings-root" className={WORKSPACE_PAGE_ROOT}>
      <MeetingsPageHeader />
      <WorkspaceMeetingsHub />
    </div>
  </StudentLayout>
);

export default MeetingsPage;
