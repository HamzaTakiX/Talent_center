import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { STUDENT_ENCADRANT_WORKSPACE_PATH } from '../../../constants/routes';
import { upsertWorkspaceBoard, type WorkspaceBoardStatus } from '../utils/whiteboardBoardRegistry';

/**
 * Sortie du workspace : si la sauvegarde auto est active, on quitte directement.
 * Sinon l'étudiant choisit le sort du tableau (enregistrer, brouillon, ou ignorer les derniers edits).
 */
export function useWhiteboardExit(
  boardId: string,
  saveBoard: (status?: WorkspaceBoardStatus) => boolean,
  autoSaveEnabled: boolean,
  abandonUnsavedEdits: () => void,
) {
  const navigate = useNavigate();
  const [exitOpen, setExitOpen] = useState(false);

  const leave = useCallback(() => {
    setExitOpen(false);
    navigate(STUDENT_ENCADRANT_WORKSPACE_PATH);
  }, [navigate]);

  const requestExit = useCallback(() => {
    if (autoSaveEnabled) {
      saveBoard('saved');
      leave();
      return;
    }
    setExitOpen(true);
  }, [autoSaveEnabled, leave, saveBoard]);
  const cancelExit = useCallback(() => setExitOpen(false), []);

  const keepAndExit = useCallback(
    (status: WorkspaceBoardStatus) => {
      if (!saveBoard(status)) {
        upsertWorkspaceBoard(boardId, status === 'saved' ? 'draft' : status);
      }
      leave();
    },
    [boardId, leave, saveBoard],
  );

  const discardAndExit = useCallback(() => {
    abandonUnsavedEdits();
    leave();
  }, [abandonUnsavedEdits, leave]);

  return { exitOpen, requestExit, cancelExit, keepAndExit, discardAndExit };
}
