import { useState } from 'react';
import {
  Circle,
  Download,
  MousePointer2,
  Pencil,
  Share2,
  Square,
  StickyNote,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import {
  workspaceActiveUsersCount,
  workspaceCursorLabel,
  workspaceStickyNotes,
} from '../data/workspaceMock';
import {
  WORKSPACE_PANEL_BODY,
  WORKSPACE_PANEL_HEADER,
  WORKSPACE_STICKY_NOTE,
  WORKSPACE_TAB_ROOT,
  WORKSPACE_WHITEBOARD_CANVAS,
  WORKSPACE_WHITEBOARD_CANVAS_INNER,
} from '../constants/workspaceLayout';
import {
  WORKSPACE_ACTIVE_USERS_BADGE,
  WORKSPACE_OUTLINE_BTN,
  WORKSPACE_TOOLBAR_ACTIONS,
  WORKSPACE_TOOLBAR_GROUP,
  WORKSPACE_TOOLBAR_ROW,
  WORKSPACE_TOOL_BTN,
  WORKSPACE_TOOL_BTN_ACTIVE,
} from '../constants/workspaceStyles';
import type { WorkspaceStickyNote } from '../types';

const stickyNoteStyles: Record<WorkspaceStickyNote['color'], string> = {
  yellow: 'bg-[#fef9c3] border-[#fde68a] text-[#713f12]',
  blue: 'bg-[#dbeafe] border-[#93c5fd] text-[#1e3a8a]',
  green: 'bg-[#dcfce7] border-[#86efac] text-[#14532d]',
};

type WhiteboardTool = 'select' | 'pencil' | 'text' | 'sticky' | 'circle' | 'square';

export default function WorkspaceWhiteboardTab() {
  const [activeTool, setActiveTool] = useState<WhiteboardTool>('select');

  const tools: { id: WhiteboardTool; icon: typeof MousePointer2; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Sélection' },
    { id: 'pencil', icon: Pencil, label: 'Crayon' },
    { id: 'text', icon: Type, label: 'Texte' },
    { id: 'sticky', icon: StickyNote, label: 'Note' },
    { id: 'circle', icon: Circle, label: 'Cercle' },
    { id: 'square', icon: Square, label: 'Carré' },
  ];

  return (
    <div className={WORKSPACE_TAB_ROOT}>
      <header className={WORKSPACE_PANEL_HEADER}>
        <div className="min-w-0 max-w-full flex-1">
          <h2 className="m-0 break-words font-inter text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
            Tableau blanc collaboratif
          </h2>
          <p className="m-0 mt-0.5 break-words font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">
            Travaillez ensemble en temps réel avec votre encadrant
          </p>
        </div>
        <span className={WORKSPACE_ACTIVE_USERS_BADGE}>
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" aria-hidden />
          {workspaceActiveUsersCount} utilisateurs actifs
        </span>
      </header>

      <div className={WORKSPACE_PANEL_BODY}>
        <div className={WORKSPACE_TOOLBAR_ROW}>
          <div className={WORKSPACE_TOOLBAR_ACTIONS}>
            <div className={WORKSPACE_TOOLBAR_GROUP} role="toolbar" aria-label="Outils tableau blanc">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    aria-label={tool.label}
                    aria-pressed={isActive}
                    onClick={() => setActiveTool(tool.id)}
                    className={isActive ? WORKSPACE_TOOL_BTN_ACTIVE : WORKSPACE_TOOL_BTN}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <button type="button" className={WORKSPACE_TOOL_BTN} aria-label="Supprimer">
              <Trash2 className="h-4 w-4" />
            </button>
            <button type="button" className={WORKSPACE_TOOL_BTN} aria-label="Télécharger">
              <Download className="h-4 w-4" />
            </button>
          </div>
          <button type="button" className={`${WORKSPACE_OUTLINE_BTN} w-full sm:max-w-none sm:w-auto`}>
            <Share2 className="h-4 w-4 shrink-0" aria-hidden />
            Partager
          </button>
        </div>

        <div className={WORKSPACE_WHITEBOARD_CANVAS} role="region" aria-label="Zone tableau blanc">
          <div className={WORKSPACE_WHITEBOARD_CANVAS_INNER}>
            {workspaceStickyNotes.map((note) => (
              <article
                key={note.id}
                className={`${WORKSPACE_STICKY_NOTE} z-[1] ${stickyNoteStyles[note.color]} ${note.positionClass}`}
              >
                <button
                  type="button"
                  className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded text-current opacity-60 hover:opacity-100"
                  aria-label="Fermer la note"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="m-0 break-words font-inter text-[13px] font-medium leading-5">
                  {note.text}
                </p>
              </article>
            ))}

            <div className="relative z-[2] flex w-fit max-w-full items-center gap-1.5 self-start rounded-md bg-[var(--admin-bg-elevated)]/90 px-2 py-1 shadow-sm sm:absolute sm:bottom-6 sm:left-6">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#7c3aed]" aria-hidden />
              <span className="font-inter text-[12px] font-medium leading-4 text-[#6d28d9]">
                {workspaceCursorLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
