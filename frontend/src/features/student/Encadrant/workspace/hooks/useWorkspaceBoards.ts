import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { studentWorkspaceBoardPath } from "../../constants/routes";
import { matchesWorkspaceSearch } from "../utils/workspaceSearch";
import {
  discardWorkspaceBoard,
  readWorkspaceBoards,
  recoverOrphanWorkspaceBoards,
  renameWorkspaceBoard,
  WORKSPACE_BOARDS_CHANGED_EVENT,
  type WorkspaceBoardEntry,
  type WorkspaceBoardStatus,
  workspaceBoardHasScene,
} from "../whiteboard/utils/whiteboardBoardRegistry";

export type WorkspaceBoardsFilter = "all" | WorkspaceBoardStatus;

export interface WorkspaceBoardListItem extends WorkspaceBoardEntry {
  hasScene: boolean;
}

export function useWorkspaceBoards() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<WorkspaceBoardListItem[]>([]);
  const [filter, setFilter] = useState<WorkspaceBoardsFilter>("all");
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => {
    recoverOrphanWorkspaceBoards();
    setBoards(
      readWorkspaceBoards().map((board) => ({
        ...board,
        hasScene: workspaceBoardHasScene(board.id),
      })),
    );
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(WORKSPACE_BOARDS_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener(WORKSPACE_BOARDS_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    const byStatus =
      filter === "all" ? boards : boards.filter((board) => board.status === filter);
    const bySearch = byStatus.filter((board) =>
      matchesWorkspaceSearch(search, [board.title, board.status, board.id]),
    );
    return [...bySearch].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [boards, filter, search]);

  const counts = useMemo(
    () => ({
      all: boards.length,
      saved: boards.filter((board) => board.status === "saved").length,
      draft: boards.filter((board) => board.status === "draft").length,
    }),
    [boards],
  );

  const openBoard = useCallback(
    (boardId: string) => {
      navigate(studentWorkspaceBoardPath(boardId));
    },
    [navigate],
  );

  const removeBoard = useCallback((boardId: string) => {
    discardWorkspaceBoard(boardId);
    refresh();
  }, [refresh]);

  const renameBoard = useCallback(
    (boardId: string, title: string) => {
      renameWorkspaceBoard(boardId, title);
      refresh();
    },
    [refresh],
  );

  return {
    boards,
    filtered,
    filter,
    setFilter,
    search,
    setSearch,
    counts,
    openBoard,
    removeBoard,
    renameBoard,
  };
}
