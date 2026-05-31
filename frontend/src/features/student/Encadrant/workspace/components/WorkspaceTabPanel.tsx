import { FunctionComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';
import type { WorkspaceTabId } from '../types';
import WorkspaceDocumentsPanel from './WorkspaceDocumentsPanel';
import WorkspaceNotesPanel from './WorkspaceNotesPanel';
import WorkspaceDiscussionsPanel from './WorkspaceDiscussionsPanel';
import WorkspaceTasksPanel from './WorkspaceTasksPanel';
import WorkspaceActivityPanel from './WorkspaceActivityPanel';

interface WorkspaceTabPanelProps {
  activeTab: WorkspaceTabId;
  loading: boolean;
  documentsView: 'grid' | 'list';
  onDocumentsViewChange: (v: 'grid' | 'list') => void;
}

const WorkspaceTabPanel: FunctionComponent<WorkspaceTabPanelProps> = ({
  activeTab,
  loading,
  documentsView,
  onDocumentsViewChange,
}) => (
  <section className={`${WORKSPACE_GLASS_CARD} student-workspace-glass min-h-[min(480px,65vh)] overflow-hidden`}>
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="skel" {...fadeInUp} className="p-8">
          <div className="student-workspace-skeleton h-64 w-full" />
        </motion.div>
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
          {activeTab === 'documents' && <WorkspaceDocumentsPanel view={documentsView} onViewChange={onDocumentsViewChange} />}
          {activeTab === 'notes' && <WorkspaceNotesPanel />}
          {activeTab === 'discussions' && <WorkspaceDiscussionsPanel />}
          {activeTab === 'tasks' && <WorkspaceTasksPanel />}
          {activeTab === 'activity' && <WorkspaceActivityPanel />}
        </motion.div>
      )}
    </AnimatePresence>
  </section>
);

export default WorkspaceTabPanel;
