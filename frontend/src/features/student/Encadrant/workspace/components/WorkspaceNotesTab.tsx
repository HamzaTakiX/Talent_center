import { Download } from 'lucide-react';
import {
  workspaceNotesLastModified,
  workspaceNotesPlaceholder,
} from '../data/workspaceMock';
import { WORKSPACE_PANEL_BODY, WORKSPACE_PANEL_HEADER, WORKSPACE_TAB_ROOT } from '../constants/workspaceLayout';
import { WORKSPACE_FIELD_TEXTAREA, WORKSPACE_FOOTER_ROW, WORKSPACE_PRIMARY_BTN } from '../constants/workspaceStyles';

export default function WorkspaceNotesTab() {
  return (
    <div className={WORKSPACE_TAB_ROOT}>
      <header className={WORKSPACE_PANEL_HEADER}>
        <div className="min-w-0 max-w-full flex-1">
          <h2 className="m-0 break-words font-inter text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
            Notes partagées
          </h2>
          <p className="m-0 mt-0.5 break-words font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">
            Prenez des notes collaboratives avec votre encadrant
          </p>
        </div>
      </header>

      <div className={`${WORKSPACE_PANEL_BODY} flex min-h-0 flex-1 flex-col`}>
        <textarea
          className={WORKSPACE_FIELD_TEXTAREA}
          placeholder={workspaceNotesPlaceholder}
          aria-label="Zone de notes partagées"
        />

        <div className={WORKSPACE_FOOTER_ROW}>
          <p className="m-0 min-w-0 max-w-full break-words font-inter text-[12px] leading-4 text-[var(--admin-text-muted)] sm:text-[13px]">
            {workspaceNotesLastModified}
          </p>
          <button type="button" className={`${WORKSPACE_PRIMARY_BTN} w-full sm:max-w-none sm:w-auto`}>
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
}
