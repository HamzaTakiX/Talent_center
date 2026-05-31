import { FunctionComponent, useState } from 'react';
import { Grid3X3, Minus, Plus, Table, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TableBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
}

const TableBuilderModal: FunctionComponent<TableBuilderModalProps> = ({ open, onClose, onInsert }) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  if (!open) return null;

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInsert(rows, cols);
    onClose();
  };

  return (
    <div className="student-report-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="student-report-modal student-report-modal--compact"
        role="dialog"
        aria-labelledby="table-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="student-report-modal__header">
          <div className="student-report-modal__icon">
            <Table className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 id="table-modal-title" className="student-report-modal__title">
              {t('student.reports.editor.tableModal.title')}
            </h2>
            <p className="student-report-modal__subtitle">{t('student.reports.editor.tableModal.subtitle')}</p>
          </div>
          <button type="button" className="student-report-modal__close" onClick={onClose} aria-label={t('student.reports.editor.tableModal.cancel')}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <form className="student-report-modal__body" onSubmit={handleSubmit}>
          <div className="student-report-table-preview" aria-hidden>
            {Array.from({ length: Math.min(rows, 6) }).map((_, r) => (
              <div key={r} className="student-report-table-preview__row">
                {Array.from({ length: Math.min(cols, 8) }).map((__, c) => (
                  <div key={c} className="student-report-table-preview__cell" />
                ))}
              </div>
            ))}
          </div>
          <div className="student-report-modal__counter-row">
            <label className="student-report-modal__counter">
              <span>{t('student.reports.editor.tableModal.rows')}</span>
              <div className="student-report-modal__stepper">
                <button type="button" onClick={() => setRows((v) => clamp(v - 1, 1, 20))} aria-label="-">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span>{rows}</span>
                <button type="button" onClick={() => setRows((v) => clamp(v + 1, 1, 20))} aria-label="+">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </label>
            <label className="student-report-modal__counter">
              <span>{t('student.reports.editor.tableModal.columns')}</span>
              <div className="student-report-modal__stepper">
                <button type="button" onClick={() => setCols((v) => clamp(v - 1, 1, 12))} aria-label="-">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span>{cols}</span>
                <button type="button" onClick={() => setCols((v) => clamp(v + 1, 1, 12))} aria-label="+">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </label>
          </div>
          <div className="student-report-modal__actions">
            <button type="button" className="student-report-modal__btn student-report-modal__btn--ghost" onClick={onClose}>
              {t('student.reports.editor.tableModal.cancel')}
            </button>
            <button type="submit" className="student-report-modal__btn student-report-modal__btn--primary">
              <Grid3X3 className="h-4 w-4" aria-hidden />
              {t('student.reports.editor.tableModal.insert')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableBuilderModal;
