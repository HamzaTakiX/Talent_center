import { useTranslation } from 'react-i18next';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react';
import {
  REPORT_TOOLBAR,
  REPORT_TOOLBAR_BTN,
  REPORT_TOOLBAR_SELECT,
} from '../constants/reportStyles';

export default function ReportEditorToolbar() {
  const { t } = useTranslation();

  return (
    <div
      className={`${REPORT_TOOLBAR} mx-3 mb-0 mt-3 sm:mx-4`}
      role="toolbar"
      aria-label={t('student.encadrant.reportEditor.toolbarAria')}
    >
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.undo')}>
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.redo')}>
        <Redo2 className="h-4 w-4" />
      </button>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[var(--admin-border)] sm:inline" aria-hidden />
      <label className="sr-only" htmlFor="report-style-select">
        {t('student.encadrant.reportEditor.style')}
      </label>
      <select id="report-style-select" className={REPORT_TOOLBAR_SELECT} defaultValue="normal">
        <option value="normal">{t('student.encadrant.reportEditor.style')}</option>
        <option value="h1">{t('student.encadrant.reportEditor.heading1')}</option>
        <option value="h2">{t('student.encadrant.reportEditor.heading2')}</option>
      </select>
      <label className="sr-only" htmlFor="report-size-select">
        {t('student.encadrant.reportEditor.size')}
      </label>
      <select id="report-size-select" className={REPORT_TOOLBAR_SELECT} defaultValue="14">
        <option value="12">12</option>
        <option value="14">{t('student.encadrant.reportEditor.size')}</option>
        <option value="16">16</option>
        <option value="18">18</option>
      </select>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[var(--admin-border)] sm:inline" aria-hidden />
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.bold')}>
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.italic')}>
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.underline')}>
        <Underline className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.textColor')}>
        <Palette className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.clearFormat')}>
        <Eraser className="h-4 w-4" />
      </button>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[var(--admin-border)] sm:inline" aria-hidden />
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.alignLeft')}>
        <AlignLeft className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.alignCenter')}>
        <AlignCenter className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.alignRight')}>
        <AlignRight className="h-4 w-4" />
      </button>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[var(--admin-border)] sm:inline" aria-hidden />
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.bulletList')}>
        <List className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.numberedList')}>
        <ListOrdered className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.insertLink')}>
        <Link2 className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label={t('student.encadrant.reportEditor.horizontalRule')}>
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}
