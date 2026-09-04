import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import WorkspacePageHeader from '../components/WorkspacePageHeader';
import WorkspaceBoardsSection from '../components/WorkspaceBoardsSection';
import WorkspaceStatsGrid from '../components/WorkspaceStatsGrid';
import WorkspaceGlobalSearch from '../components/WorkspaceGlobalSearch';
import WorkspaceTabNav from '../components/WorkspaceTabNav';
import WorkspaceTabPanel from '../components/WorkspaceTabPanel';
import {
  WORKSPACE_GLASS_CARD,
  WORKSPACE_HUB_ELEMENT_ID,
  WORKSPACE_PAGE_ROOT,
} from '../constants/workspaceLayout';
import { useWorkspacePlatform } from '../hooks/useWorkspacePlatform';

const WorkspacePage: FunctionComponent = () => {
  const platform = useWorkspacePlatform();
  const { loading } = platform;

  return (
    <StudentLayout>
      <div id="student-encadrant-workspace-root" className={WORKSPACE_PAGE_ROOT}>
        <WorkspacePageHeader onCreateWorkspace={platform.createWorkspace} />
        <WorkspaceStatsGrid loading={loading} kpis={platform.kpis} />
        <WorkspaceBoardsSection loading={loading} />
        <section
          id={WORKSPACE_HUB_ELEMENT_ID}
          className={`${WORKSPACE_GLASS_CARD} student-workspace-hub`}
          aria-busy={loading || undefined}
        >
          <WorkspaceGlobalSearch
            search={platform.search}
            onSearchChange={platform.setSearch}
          />
          <WorkspaceTabNav activeTab={platform.activeTab} onTabChange={platform.setActiveTab} />
          <WorkspaceTabPanel
            activeTab={platform.activeTab}
            loading={loading}
            search={platform.search}
            notes={platform.notes}
            documentsState={platform.documents}
            documentsView={platform.documentsView}
            onDocumentsViewChange={platform.setDocumentsView}
          />
        </section>
      </div>
    </StudentLayout>
  );
};

export default WorkspacePage;
