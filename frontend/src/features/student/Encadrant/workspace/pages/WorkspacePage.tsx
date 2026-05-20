import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import { WORKSPACE_PAGE_ROOT } from '../constants/workspaceLayout';
import WorkspacePanel from '../components/WorkspacePanel';

const WorkspacePage: FunctionComponent = () => (
  <StudentLayout headerTitle="Encadrant" headerSubtitle="Digital Talent Center">
    <div className={WORKSPACE_PAGE_ROOT}>
      <WorkspacePanel />
    </div>
  </StudentLayout>
);

export default WorkspacePage;
