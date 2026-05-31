import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import EncadrantLayout from '../../components/EncadrantLayout';
import WorkspaceDetailBoard from '../components/WorkspaceDetailBoard';
import WorkspaceDetailSidebar from '../components/WorkspaceDetailSidebar';
import WorkspaceDetailVideoSession from '../components/WorkspaceDetailVideoSession';
import { ENCADRANT_WORKSPACE_PATH } from '../constants/routes';
import { WORKSPACE_DETAIL_PAGE_ROOT, WORKSPACE_DETAIL_TOP_GRID } from '../constants/workspaceDetailLayout';
import { getWorkspaceDetail } from '../data/workspaceDetailMock';

const WorkspaceStudentDetailPage: FunctionComponent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const detail = studentId ? getWorkspaceDetail(studentId) : undefined;

  if (!detail) {
    return <Navigate to={ENCADRANT_WORKSPACE_PATH} replace />;
  }

  return (
    <EncadrantLayout headerTitle="Workspace" headerSubtitle="Encadrant Portal">
      <div id="encadrant-workspace-detail-root" className={WORKSPACE_DETAIL_PAGE_ROOT}>
        <div className={WORKSPACE_DETAIL_TOP_GRID}>
          <WorkspaceDetailBoard stickyNotes={detail.stickyNotes} />
          <WorkspaceDetailSidebar
            sharedFiles={detail.sharedFiles}
            recentActivity={detail.recentActivity}
          />
        </div>
        <WorkspaceDetailVideoSession
          studentName={detail.studentName}
          studentInitials={detail.studentInitials}
        />
      </div>
    </EncadrantLayout>
  );
};

export default WorkspaceStudentDetailPage;
