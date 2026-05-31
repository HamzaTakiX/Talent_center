import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import WorkspacePageHeader from '../components/WorkspacePageHeader';
import WorkspaceStatsGrid from '../components/WorkspaceStatsGrid';
import WorkspaceCollaboratorsHub from '../components/WorkspaceCollaboratorsHub';
import WorkspaceWhiteboardLaunchCard from '../components/WorkspaceWhiteboardLaunchCard';
import WorkspaceGlobalSearch from '../components/WorkspaceGlobalSearch';
import WorkspaceTabNav from '../components/WorkspaceTabNav';
import WorkspaceTabPanel from '../components/WorkspaceTabPanel';
import WorkspaceFeedbackSection from '../components/WorkspaceFeedbackSection';
import WorkspaceKnowledgeSection from '../components/WorkspaceKnowledgeSection';
import WorkspaceMeetingsHub from '../components/WorkspaceMeetingsHub';
import WorkspaceProgressPanel from '../components/WorkspaceProgressPanel';
import WorkspaceNotificationsPanel from '../components/WorkspaceNotificationsPanel';
import { WORKSPACE_PAGE_ROOT } from '../constants/workspaceLayout';
import { useWorkspacePlatform } from '../hooks/useWorkspacePlatform';

const WorkspacePage: FunctionComponent = () => {
  const platform = useWorkspacePlatform();

  return (
    <StudentLayout>
      <div id="student-encadrant-workspace-root" className={WORKSPACE_PAGE_ROOT}>
        <WorkspacePageHeader />
        <WorkspaceStatsGrid />
        <WorkspaceCollaboratorsHub />
        <WorkspaceWhiteboardLaunchCard />
        <WorkspaceGlobalSearch
          search={platform.search}
          onSearchChange={platform.setSearch}
          results={platform.searchResults}
        />
        <WorkspaceTabNav activeTab={platform.activeTab} onTabChange={platform.setActiveTab} />
        <WorkspaceTabPanel
          activeTab={platform.activeTab}
          loading={platform.loading}
          documentsView={platform.documentsView}
          onDocumentsViewChange={platform.setDocumentsView}
        />
        <div className="student-workspace-two-col">
          <WorkspaceFeedbackSection />
          <WorkspaceKnowledgeSection />
        </div>
        <WorkspaceMeetingsHub />
        <div className="student-workspace-two-col">
          <WorkspaceProgressPanel />
          <WorkspaceNotificationsPanel />
        </div>
      </div>
    </StudentLayout>
  );
};

export default WorkspacePage;
