import { WHITEBOARD_STORAGE_KEY } from "../data/whiteboardMock";
import {
  DEFAULT_WHITEBOARD_BOARD_ID,
  whiteboardStorageKey,
} from "./whiteboardBoardStorage";
import { whiteboardSceneHasContent } from "./whiteboardSceneStorage";

const REGISTRY_KEY = "esca-student-workspace-boards-v1";

export const WORKSPACE_BOARDS_CHANGED_EVENT = "esca-workspace-boards-changed";

export type WorkspaceBoardStatus = "saved" | "draft";

export interface WorkspaceBoardEntry {
  id: string;
  status: WorkspaceBoardStatus;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceBoardPatch = Partial<
  Pick<WorkspaceBoardEntry, "title" | "status">
>;

function defaultBoardTitle(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Workspace";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `Workspace ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function notifyWorkspaceBoardsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WORKSPACE_BOARDS_CHANGED_EVENT));
}

function normalizeEntry(raw: unknown): WorkspaceBoardEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== "string" || value.id.trim().length === 0) return null;
  const updatedAt =
    typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString();
  const createdAt =
    typeof value.createdAt === "string" ? value.createdAt : updatedAt;
  const title =
    typeof value.title === "string" && value.title.trim().length > 0
      ? value.title.trim()
      : defaultBoardTitle(createdAt);

  return {
    id: value.id,
    status: value.status === "saved" ? "saved" : "draft",
    title,
    createdAt,
    updatedAt,
  };
}

export function readWorkspaceBoards(): WorkspaceBoardEntry[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeEntry)
      .filter((entry): entry is WorkspaceBoardEntry => entry !== null);
  } catch {
    return [];
  }
}

function writeWorkspaceBoards(entries: WorkspaceBoardEntry[]): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries));
    notifyWorkspaceBoardsChanged();
  } catch {
    /* quota or private mode — the board scene itself stays authoritative */
  }
}

export function findWorkspaceBoard(boardId: string): WorkspaceBoardEntry | undefined {
  return readWorkspaceBoards().find((board) => board.id === boardId);
}

export function upsertWorkspaceBoard(
  boardId: string,
  status: WorkspaceBoardStatus,
  patch?: WorkspaceBoardPatch,
): WorkspaceBoardEntry {
  const existing = findWorkspaceBoard(boardId);
  const now = new Date().toISOString();
  const title =
    patch?.title?.trim() || existing?.title || defaultBoardTitle(existing?.createdAt ?? now);
  const entry: WorkspaceBoardEntry = {
    id: boardId,
    status: patch?.status ?? status,
    title,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const others = readWorkspaceBoards().filter((board) => board.id !== boardId);
  writeWorkspaceBoards([entry, ...others]);
  return entry;
}

/** Registers a board as draft without touching an existing saved entry. */
export function registerWorkspaceBoard(boardId: string): WorkspaceBoardEntry {
  const existing = findWorkspaceBoard(boardId);
  if (existing) return existing;
  return upsertWorkspaceBoard(boardId, "draft");
}

export function renameWorkspaceBoard(boardId: string, title: string): void {
  const existing = findWorkspaceBoard(boardId);
  if (!existing) return;
  const nextTitle = title.trim() || existing.title;
  upsertWorkspaceBoard(boardId, existing.status, { title: nextTitle });
}

export function workspaceBoardHasScene(boardId: string): boolean {
  return whiteboardSceneHasContent(whiteboardStorageKey(boardId));
}

/** Imports boards that already have a scene but are missing from the registry. */
export function recoverOrphanWorkspaceBoards(): void {
  if (typeof localStorage === "undefined") return;
  const known = new Set(readWorkspaceBoards().map((board) => board.id));
  const recovered: WorkspaceBoardEntry[] = [];
  const prefix = `${WHITEBOARD_STORAGE_KEY}:`;

  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;

      let boardId: string | null = null;
      if (key === WHITEBOARD_STORAGE_KEY) {
        boardId = DEFAULT_WHITEBOARD_BOARD_ID;
      } else if (key.startsWith(prefix)) {
        boardId = key.slice(prefix.length);
      }
      if (!boardId || known.has(boardId)) continue;

      const now = new Date().toISOString();
      recovered.push({
        id: boardId,
        status: "draft",
        title: defaultBoardTitle(now),
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch {
    return;
  }

  if (recovered.length === 0) return;
  writeWorkspaceBoards([...recovered, ...readWorkspaceBoards()]);
}

/** Drops both the registry entry and the drawing itself. */
export function discardWorkspaceBoard(boardId: string): void {
  writeWorkspaceBoards(readWorkspaceBoards().filter((board) => board.id !== boardId));
  try {
    localStorage.removeItem(whiteboardStorageKey(boardId));
  } catch {
    /* ignore */
  }
}
