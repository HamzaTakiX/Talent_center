import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import { WorkspaceStudentsSection } from '../components';
import { WORKSPACE_PAGE_ROOT } from '../constants/workspaceLayout';

const WorkspacePage: FunctionComponent = () => (
  <EncadrantLayout>
    <div id="encadrant-workspace-root" className={WORKSPACE_PAGE_ROOT}>
      <WorkspaceStudentsSection />
    </div>
  </EncadrantLayout>
);

export default WorkspacePage;
