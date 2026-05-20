import { useState } from 'react';
import type { WorkspaceTabId } from '../types';
import { workspaceTabs } from '../data/workspaceMock';
import { WORKSPACE_MEETING_ACTIONS_ROW, WORKSPACE_PANEL_ROOT, WORKSPACE_SURFACE_INNER } from '../constants/workspaceLayout';
import { WORKSPACE_SURFACE_CARD } from '../constants/workspaceStyles';
import WorkspaceTabBar from './WorkspaceTabBar';
import WorkspaceWhiteboardTab from './WorkspaceWhiteboardTab';
import WorkspaceDocumentsTab from './WorkspaceDocumentsTab';
import WorkspaceNotesTab from './WorkspaceNotesTab';
import WorkspaceDiscussionTab from './WorkspaceDiscussionTab';
import WorkspaceStartMeetingButton from './WorkspaceStartMeetingButton';
import WorkspaceMeetingCard from './WorkspaceMeetingCard';

export default function WorkspacePanel() {
  const [activeTabId, setActiveTabId] = useState<WorkspaceTabId>('whiteboard');
  const [meetingActive, setMeetingActive] = useState(false);

  const handleStartMeeting = () => {
    setMeetingActive(true);
  };

  const handleEndMeeting = () => {
    setMeetingActive(false);
  };

  return (
    <div className={WORKSPACE_PANEL_ROOT}>
      <div className={WORKSPACE_MEETING_ACTIONS_ROW}>
        <WorkspaceStartMeetingButton onClick={handleStartMeeting} isActive={meetingActive} />
      </div>

      {meetingActive && <WorkspaceMeetingCard onEndMeeting={handleEndMeeting} />}

      <WorkspaceTabBar
        tabs={workspaceTabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
      />

      <section
        className={`${WORKSPACE_SURFACE_CARD} flex min-h-[min(520px,calc(100dvh-14rem))] max-h-[calc(100dvh-10rem)] flex-col`}
      >
        <div className={WORKSPACE_SURFACE_INNER}>
          {activeTabId === 'whiteboard' && <WorkspaceWhiteboardTab />}
          {activeTabId === 'documents' && <WorkspaceDocumentsTab />}
          {activeTabId === 'notes' && <WorkspaceNotesTab />}
          {activeTabId === 'discussion' && <WorkspaceDiscussionTab />}
        </div>
      </section>
    </div>
  );
}
