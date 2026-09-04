import { FunctionComponent } from 'react';
import { FileText, Plus, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  STICKY_NOTE_COLORS,
  WORKSPACE_DETAIL_ADD_NOTE_BTN,
  WORKSPACE_DETAIL_BOARD_ACTIONS,
  WORKSPACE_DETAIL_BOARD_AREA,
  WORKSPACE_DETAIL_BOARD_HEADER,
  WORKSPACE_DETAIL_PANEL,
  WORKSPACE_DETAIL_PANEL_TITLE,
  WORKSPACE_DETAIL_STICKY_ICON,
  WORKSPACE_DETAIL_STICKY_NOTE,
  WORKSPACE_DETAIL_STICKY_NOTE_TEXT,
  WORKSPACE_DETAIL_UPLOAD_BTN,
} from '../constants/workspaceDetailLayout';
import type { WorkspaceStickyNote } from '../types';

interface WorkspaceDetailBoardProps {
  stickyNotes: WorkspaceStickyNote[];
}

const WorkspaceDetailBoard: FunctionComponent<WorkspaceDetailBoardProps> = ({ stickyNotes }) => {
  const { t } = useTranslation();

  return (
    <section className={WORKSPACE_DETAIL_PANEL} aria-label={t('encadrant.workspace.collaborativeBoard')}>
      <div className={WORKSPACE_DETAIL_BOARD_HEADER}>
        <h2 className={WORKSPACE_DETAIL_PANEL_TITLE}>{t('encadrant.workspace.collaborativeBoard')}</h2>
        <div className={WORKSPACE_DETAIL_BOARD_ACTIONS}>
          <button type="button" className={WORKSPACE_DETAIL_ADD_NOTE_BTN}>
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {t('encadrant.workspace.addNote')}
          </button>
          <button
            type="button"
            className={WORKSPACE_DETAIL_UPLOAD_BTN}
            aria-label={t('encadrant.workspace.uploadFile')}
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div className={WORKSPACE_DETAIL_BOARD_AREA}>
        <div className="flex w-full min-w-0 flex-wrap gap-2 md:hidden">
          {stickyNotes.map((note) => (
            <div
              key={note.id}
              className={`relative box-border min-w-0 max-w-full flex-1 basis-[calc(50%-0.25rem)] rounded-[10px] border border-solid p-3 shadow-[0_2px_8px_rgba(16,24,40,0.08)] max-[429px]:basis-full ${STICKY_NOTE_COLORS[note.color]}`}
            >
              <FileText className={`${WORKSPACE_DETAIL_STICKY_ICON} h-3.5 w-3.5`} strokeWidth={1.75} aria-hidden />
              <p className={WORKSPACE_DETAIL_STICKY_NOTE_TEXT}>{note.text}</p>
            </div>
          ))}
        </div>

        <div className="relative hidden h-full min-h-[inherit] w-full md:block">
          {stickyNotes.map((note) => (
            <div
              key={note.id}
              className={`${WORKSPACE_DETAIL_STICKY_NOTE} ${STICKY_NOTE_COLORS[note.color]}`}
              style={{ top: note.top, left: note.left }}
            >
              <FileText className={`${WORKSPACE_DETAIL_STICKY_ICON} h-3.5 w-3.5`} strokeWidth={1.75} aria-hidden />
              <p className={WORKSPACE_DETAIL_STICKY_NOTE_TEXT}>{note.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkspaceDetailBoard;
