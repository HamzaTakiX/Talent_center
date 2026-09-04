import { FunctionComponent, useEffect } from 'react';
import { FileClock, Save, Undo2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { WorkspaceBoardStatus } from '../utils/whiteboardBoardRegistry';

interface WhiteboardExitDialogProps {
  open: boolean;
  onCancel: () => void;
  onKeep: (status: WorkspaceBoardStatus) => void;
  onDiscard: () => void;
}

const WhiteboardExitDialog: FunctionComponent<WhiteboardExitDialogProps> = ({
  open,
  onCancel,
  onKeep,
  onDiscard,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="student-whiteboard-settings-backdrop"
        aria-label={t('student.encadrant.workspace.whiteboardPage.exit.cancel')}
        onClick={onCancel}
      />
      <dialog open className="student-whiteboard-settings-modal" aria-labelledby="whiteboard-exit-title">
        <header className="student-whiteboard-settings-modal__head">
          <div>
            <h2 id="whiteboard-exit-title" className="student-whiteboard-settings-modal__title">
              {t('student.encadrant.workspace.whiteboardPage.exit.title')}
            </h2>
            <p className="student-whiteboard-settings-modal__subtitle">
              {t('student.encadrant.workspace.whiteboardPage.exit.subtitle')}
            </p>
          </div>
          <button
            type="button"
            className="student-whiteboard-icon-btn"
            onClick={onCancel}
            aria-label={t('student.encadrant.workspace.whiteboardPage.exit.cancel')}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="student-whiteboard-settings-modal__body">
          <div className="student-whiteboard-exit-choices">
            <button
              type="button"
              className="student-whiteboard-exit-choice student-whiteboard-exit-choice--primary"
              onClick={() => onKeep('saved')}
            >
              <Save className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <strong>{t('student.encadrant.workspace.whiteboardPage.exit.save')}</strong>
                <small>{t('student.encadrant.workspace.whiteboardPage.exit.saveHint')}</small>
              </span>
            </button>

            <button
              type="button"
              className="student-whiteboard-exit-choice"
              onClick={() => onKeep('draft')}
            >
              <FileClock className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <strong>{t('student.encadrant.workspace.whiteboardPage.exit.draft')}</strong>
                <small>{t('student.encadrant.workspace.whiteboardPage.exit.draftHint')}</small>
              </span>
            </button>

            <button
              type="button"
              className="student-whiteboard-exit-choice student-whiteboard-exit-choice--danger"
              onClick={onDiscard}
            >
              <Undo2 className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <strong>{t('student.encadrant.workspace.whiteboardPage.exit.discard')}</strong>
                <small>{t('student.encadrant.workspace.whiteboardPage.exit.discardHint')}</small>
              </span>
            </button>
          </div>

          <button
            type="button"
            className="student-whiteboard-exit-cancel"
            onClick={onCancel}
          >
            {t('student.encadrant.workspace.whiteboardPage.exit.cancel')}
          </button>
        </div>
      </dialog>
    </>
  );
};

export default WhiteboardExitDialog;
