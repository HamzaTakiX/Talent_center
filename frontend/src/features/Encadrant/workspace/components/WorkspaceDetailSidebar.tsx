import { FunctionComponent } from 'react';
import { Download } from 'lucide-react';
import {
  WORKSPACE_DETAIL_ACTIVITY_ACTION,
  WORKSPACE_DETAIL_ACTIVITY_DOT,
  WORKSPACE_DETAIL_ACTIVITY_ITEM,
  WORKSPACE_DETAIL_ACTIVITY_LIST,
  WORKSPACE_DETAIL_ACTIVITY_TIME,
  WORKSPACE_DETAIL_DOWNLOAD_BTN,
  WORKSPACE_DETAIL_FILE_CARD,
  WORKSPACE_DETAIL_FILE_MAIN,
  WORKSPACE_DETAIL_FILE_META,
  WORKSPACE_DETAIL_FILE_NAME,
  WORKSPACE_DETAIL_FILE_UPLOADER,
  WORKSPACE_DETAIL_PANEL,
  WORKSPACE_DETAIL_PANEL_TITLE,
  WORKSPACE_DETAIL_SIDEBAR,
} from '../constants/workspaceDetailLayout';
import type { WorkspaceRecentActivity, WorkspaceSharedFile } from '../types';

interface WorkspaceDetailSidebarProps {
  sharedFiles: WorkspaceSharedFile[];
  recentActivity: WorkspaceRecentActivity[];
}

const WorkspaceDetailSidebar: FunctionComponent<WorkspaceDetailSidebarProps> = ({
  sharedFiles,
  recentActivity,
}) => (
  <aside className={WORKSPACE_DETAIL_SIDEBAR}>
    <section className={WORKSPACE_DETAIL_PANEL} aria-label="Shared files">
      <h2 className={WORKSPACE_DETAIL_PANEL_TITLE}>Shared Files</h2>
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        {sharedFiles.map((file) => (
          <article key={file.id} className={WORKSPACE_DETAIL_FILE_CARD}>
            <div className={WORKSPACE_DETAIL_FILE_MAIN}>
              <h3 className={WORKSPACE_DETAIL_FILE_NAME}>{file.name}</h3>
              <p className={WORKSPACE_DETAIL_FILE_META}>{file.meta}</p>
              <p className={WORKSPACE_DETAIL_FILE_UPLOADER}>{file.uploadedBy}</p>
            </div>
            <button type="button" className={WORKSPACE_DETAIL_DOWNLOAD_BTN} aria-label={`Download ${file.name}`}>
              <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </article>
        ))}
      </div>
    </section>

    <section className={WORKSPACE_DETAIL_PANEL} aria-label="Recent activity">
      <h2 className={WORKSPACE_DETAIL_PANEL_TITLE}>Recent Activity</h2>
      <ul className={WORKSPACE_DETAIL_ACTIVITY_LIST}>
        {recentActivity.map((item) => (
          <li key={item.id} className={WORKSPACE_DETAIL_ACTIVITY_ITEM}>
            <span className={WORKSPACE_DETAIL_ACTIVITY_DOT} aria-hidden />
            <p className={WORKSPACE_DETAIL_ACTIVITY_ACTION}>{item.action}</p>
            <p className={WORKSPACE_DETAIL_ACTIVITY_TIME}>{item.timeAgo}</p>
          </li>
        ))}
      </ul>
    </section>
  </aside>
);

export default WorkspaceDetailSidebar;
