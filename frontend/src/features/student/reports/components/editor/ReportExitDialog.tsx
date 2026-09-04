import { FunctionComponent, useEffect } from 'react';
import { LogOut, Save, Undo2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReportExitDialogProps {
  open: boolean;
  onCancel: () => void;
  onSaveAndQuit: () => void;
  onDiscardAndQuit: () => void;
}

const ReportExitDialog: FunctionComponent<ReportExitDialogProps> = ({
  open,
  onCancel,
  onSaveAndQuit,
  onDiscardAndQuit,
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
    <div className="student-report-modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="student-report-modal student-report-modal--compact"
        role="dialog"
        aria-labelledby="report-exit-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="student-report-modal__header">
          <div className="student-report-modal__icon">
            <LogOut className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 id="report-exit-title" className="student-report-modal__title">
              {t('student.reports.editor.exit.title')}
            </h2>
            <p className="student-report-modal__subtitle">
              {t('student.reports.editor.exit.subtitle')}
            </p>
          </div>
          <button
            type="button"
            className="student-report-modal__close"
            onClick={onCancel}
            aria-label={t('student.reports.editor.exit.cancel')}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="student-report-modal__body student-report-exit-body">
          <div className="student-report-exit-choices">
            <button
              type="button"
              className="student-report-exit-choice student-report-exit-choice--primary"
              onClick={onSaveAndQuit}
            >
              <Save className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <strong>{t('student.reports.editor.exit.save')}</strong>
                <small>{t('student.reports.editor.exit.saveHint')}</small>
              </span>
            </button>

            <button
              type="button"
              className="student-report-exit-choice student-report-exit-choice--danger"
              onClick={onDiscardAndQuit}
            >
              <Undo2 className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <strong>{t('student.reports.editor.exit.discard')}</strong>
                <small>{t('student.reports.editor.exit.discardHint')}</small>
              </span>
            </button>
          </div>

          <button
            type="button"
            className="student-report-modal__btn student-report-modal__btn--ghost student-report-exit-cancel"
            onClick={onCancel}
          >
            {t('student.reports.editor.exit.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExitDialog;
