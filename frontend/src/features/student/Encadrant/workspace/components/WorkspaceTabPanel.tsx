import { FunctionComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import type { UseWorkspaceDocumentsResult } from '../hooks/useWorkspaceDocuments';
import type { UseWorkspaceNotesResult } from '../hooks/useWorkspaceNotes';
import type { WorkspaceTabId } from '../types';
import WorkspaceDocumentsPanel from './WorkspaceDocumentsPanel';
import WorkspaceNotesPanel from './WorkspaceNotesPanel';
import WorkspaceActivityPanel from './WorkspaceActivityPanel';
import { WorkspaceSkeletonBlock } from './WorkspaceSkeleton';

interface WorkspaceTabPanelProps {
  activeTab: WorkspaceTabId;
  loading: boolean;
  search: string;
  notes: UseWorkspaceNotesResult;
  documentsState: UseWorkspaceDocumentsResult;
  documentsView: 'grid' | 'list';
  onDocumentsViewChange: (v: 'grid' | 'list') => void;
}

const WorkspaceTabPanel: FunctionComponent<WorkspaceTabPanelProps> = ({
  activeTab,
  loading,
  search,
  notes,
  documentsState,
  documentsView,
  onDocumentsViewChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="student-workspace-hub__panel" data-active-tab={loading ? undefined : activeTab}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skel"
            {...fadeInUp}
            className="student-workspace-hub__panel-inner flex flex-col gap-4 p-5 sm:p-6"
            role="status"
            aria-busy="true"
            aria-label={t('student.encadrant.workspace.platform.loading', {
              defaultValue: 'Chargement…',
            })}
          >
            <span className="sr-only">
              {t('student.encadrant.workspace.platform.loading', { defaultValue: 'Chargement…' })}
            </span>
            <div className="flex flex-wrap gap-2">
              <WorkspaceSkeletonBlock className="h-8 w-28 rounded-lg" />
              <WorkspaceSkeletonBlock className="h-8 w-24 rounded-lg" />
              <WorkspaceSkeletonBlock className="ml-auto h-8 w-20 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <WorkspaceSkeletonBlock key={i} className="h-28 w-full" />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="student-workspace-hub__panel-inner"
          >
            {activeTab === 'documents' && (
              <WorkspaceDocumentsPanel
                view={documentsView}
                onViewChange={onDocumentsViewChange}
                search={search}
                documentsState={documentsState}
              />
            )}
            {activeTab === 'notes' && <WorkspaceNotesPanel search={search} notes={notes} />}
            {activeTab === 'activity' && <WorkspaceActivityPanel search={search} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceTabPanel;
