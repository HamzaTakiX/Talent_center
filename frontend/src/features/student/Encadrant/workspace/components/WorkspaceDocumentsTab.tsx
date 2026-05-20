import { Download, FileText, Upload } from 'lucide-react';
import { workspaceDocuments } from '../data/workspaceMock';
import { WORKSPACE_PANEL_BODY, WORKSPACE_PANEL_HEADER, WORKSPACE_TAB_ROOT } from '../constants/workspaceLayout';
import {
  WORKSPACE_DOCUMENT_ROW,
  WORKSPACE_OUTLINE_BTN,
  WORKSPACE_PRIMARY_BTN,
} from '../constants/workspaceStyles';

export default function WorkspaceDocumentsTab() {
  return (
    <div className={WORKSPACE_TAB_ROOT}>
      <header className={WORKSPACE_PANEL_HEADER}>
        <div className="min-w-0 max-w-full flex-1">
          <h2 className="m-0 break-words font-inter text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
            Documents partagés
          </h2>
          <p className="m-0 mt-0.5 break-words font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">
            Fichiers partagés avec votre encadrant
          </p>
        </div>
        <button type="button" className={`${WORKSPACE_PRIMARY_BTN} w-full sm:max-w-none sm:w-auto`}>
          <Upload className="h-4 w-4 shrink-0" aria-hidden />
          Téléverser
        </button>
      </header>

      <ul className={`${WORKSPACE_PANEL_BODY} m-0 flex list-none flex-col gap-3 overflow-y-auto`}>
        {workspaceDocuments.map((doc) => (
          <li key={doc.id} className="min-w-0 max-w-full">
            <article className={WORKSPACE_DOCUMENT_ROW}>
              <div className="flex min-w-0 max-w-full flex-1 items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 max-w-full flex-1">
                  <p className="m-0 break-all font-inter text-[14px] font-semibold leading-5 text-[var(--admin-text)] sm:break-words">
                    {doc.name}
                  </p>
                  <p className="m-0 mt-0.5 break-words font-inter text-[12px] leading-4 text-[var(--admin-text-muted)] sm:text-[13px]">
                    {doc.author} • {doc.date} • {doc.size}
                  </p>
                </div>
              </div>
              <button type="button" className={`${WORKSPACE_OUTLINE_BTN} w-full sm:max-w-none sm:shrink-0 sm:w-auto`}>
                <Download className="h-4 w-4 shrink-0" aria-hidden />
                Télécharger
              </button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
