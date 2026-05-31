import { FunctionComponent } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Columns,
  Merge,
  Minus,
  Plus,
  Rows,
  SplitSquareHorizontal,
  Trash2,
  Type,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EditorFloatingControlsProps {
  type: 'image' | 'table';
  onImageAlign?: (align: 'left' | 'center' | 'right') => void;
  onImageResize?: (width: number) => void;
  onImageCaption?: () => void;
  onImageRemove?: () => void;
  onTableAddRow?: () => void;
  onTableDeleteRow?: () => void;
  onTableAddCol?: () => void;
  onTableDeleteCol?: () => void;
  onTableMerge?: () => void;
  onTableSplit?: () => void;
}

const EditorFloatingControls: FunctionComponent<EditorFloatingControlsProps> = ({
  type,
  onImageAlign,
  onImageResize,
  onImageCaption,
  onImageRemove,
  onTableAddRow,
  onTableDeleteRow,
  onTableAddCol,
  onTableDeleteCol,
  onTableMerge,
  onTableSplit,
}) => {
  const { t } = useTranslation();

  if (type === 'image') {
    return (
      <div className="student-report-float-controls" role="toolbar" aria-label={t('student.reports.editor.imageControls.title')}>
        <span className="student-report-float-controls__label">{t('student.reports.editor.imageControls.align')}</span>
        <button type="button" className="student-report-float-controls__btn" title={t('student.encadrant.reportEditor.alignLeft')} onClick={() => onImageAlign?.('left')}>
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="student-report-float-controls__btn" title={t('student.encadrant.reportEditor.alignCenter')} onClick={() => onImageAlign?.('center')}>
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="student-report-float-controls__btn" title={t('student.encadrant.reportEditor.alignRight')} onClick={() => onImageAlign?.('right')}>
          <AlignRight className="h-3.5 w-3.5" />
        </button>
        <span className="student-report-float-controls__divider" />
        <span className="student-report-float-controls__label">{t('student.reports.editor.imageControls.size')}</span>
        {[240, 360, 480, 640].map((w) => (
          <button key={w} type="button" className="student-report-float-controls__btn student-report-float-controls__btn--text" onClick={() => onImageResize?.(w)}>
            {w}px
          </button>
        ))}
        <span className="student-report-float-controls__divider" />
        <button type="button" className="student-report-float-controls__btn" title={t('student.reports.editor.imageControls.caption')} onClick={onImageCaption}>
          <Type className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="student-report-float-controls__btn student-report-float-controls__btn--danger" title={t('student.reports.editor.imageControls.remove')} onClick={onImageRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="student-report-float-controls" role="toolbar" aria-label={t('student.reports.editor.tableControls.title')}>
      <button type="button" className="student-report-float-controls__btn" title={t('student.reports.editor.tableControls.addRow')} onClick={onTableAddRow}>
        <Plus className="h-3.5 w-3.5" /><Rows className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="student-report-float-controls__btn" title={t('student.reports.editor.tableControls.deleteRow')} onClick={onTableDeleteRow}>
        <Minus className="h-3.5 w-3.5" /><Rows className="h-3.5 w-3.5" />
      </button>
      <span className="student-report-float-controls__divider" />
      <button type="button" className="student-report-float-controls__btn" title={t('student.reports.editor.tableControls.addCol')} onClick={onTableAddCol}>
        <Plus className="h-3.5 w-3.5" /><Columns className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="student-report-float-controls__btn" title={t('student.reports.editor.tableControls.deleteCol')} onClick={onTableDeleteCol}>
        <Minus className="h-3.5 w-3.5" /><Columns className="h-3.5 w-3.5" />
      </button>
      <span className="student-report-float-controls__divider" />
      <button type="button" className="student-report-float-controls__btn" title={t('student.reports.editor.tableControls.merge')} onClick={onTableMerge}>
        <Merge className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="student-report-float-controls__btn" title={t('student.reports.editor.tableControls.split')} onClick={onTableSplit}>
        <SplitSquareHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default EditorFloatingControls;
