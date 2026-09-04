import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Download,
  FileType,
  Loader2,
  LogOut,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Save,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import escaLogoLight from '../../../../auth/assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../../../../auth/assets/images/common/logo-esca.png';
import { useAdminTheme } from '../../../../admin/dashboard/context/AdminThemeContext';
import { REPORT_TITLE_MAX_LENGTH } from '../../constants/limits';
import type { AutoSaveState } from '../../types';

interface ReportEditorTopBarProps {
  title: string;
  autoSaveState: AutoSaveState;
  autoSaveEnabled: boolean;
  savedLabel: string | null;
  rightPanelOpen: boolean;
  modelCompareOpen?: boolean;
  onTitleChange: (title: string) => void;
  onAutoSaveChange: (enabled: boolean) => void;
  onSave: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onOpenModelGuide: () => void;
  onTogglePanel: () => void;
  onQuit: () => void;
}

const ReportEditorTopBar: FunctionComponent<ReportEditorTopBarProps> = ({
  title,
  autoSaveState,
  autoSaveEnabled,
  savedLabel,
  rightPanelOpen,
  modelCompareOpen = false,
  onTitleChange,
  onAutoSaveChange,
  onSave,
  onExportPdf,
  onExportDocx,
  onOpenModelGuide,
  onTogglePanel,
  onQuit,
}) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useAdminTheme();
  const escaLogo = theme === 'dark' ? escaLogoDark : escaLogoLight;
  const placeholder = t('student.reports.editor.reportName');
  const themeLabel =
    theme === 'light' ? t('student.header.darkMode') : t('student.header.lightMode');
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const onDocPointer = (e: MouseEvent) => {
      if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExportOpen(false);
    };
    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onEscape);
    };
  }, [exportOpen]);

  const handleExport = (type: 'pdf' | 'docx') => {
    setExportOpen(false);
    if (type === 'pdf') onExportPdf();
    else onExportDocx();
  };

  return (
    <header className="student-report-topbar">
      <div className="student-report-topbar__left">
        <button
          type="button"
          className="student-whiteboard-logo-link"
          title={t('student.reports.editor.backToHub')}
          onClick={onQuit}
        >
          <img src={escaLogo} alt="" className="student-whiteboard-logo" />
        </button>
        <div className="student-report-topbar__title-wrap">
          <div className="student-report-topbar__title-field" data-value={title || placeholder}>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value.slice(0, REPORT_TITLE_MAX_LENGTH))}
              placeholder={placeholder}
              maxLength={REPORT_TITLE_MAX_LENGTH}
              className="student-report-topbar__title"
              aria-label={placeholder}
            />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <div className="student-report-autosave">
              <span className="student-report-autosave__label">
                {t('student.reports.editor.autoSaveLabel')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={autoSaveEnabled}
                aria-label={t('student.reports.editor.autoSaveLabel')}
                className={`student-whiteboard-switch ${autoSaveEnabled ? 'is-on' : ''}`}
                onClick={() => onAutoSaveChange(!autoSaveEnabled)}
              >
                <span className="student-whiteboard-switch__thumb" aria-hidden />
              </button>
              {autoSaveEnabled && autoSaveState === 'saving' && (
                <span className="student-report-autosave__status is-saving">
                  <Loader2 className="inline h-3 w-3 animate-spin" aria-hidden />
                  {t('student.reports.editor.saving')}
                </span>
              )}
              {autoSaveEnabled && autoSaveState !== 'saving' && savedLabel && (
                <span className="student-report-autosave__saved">
                  {t('student.reports.editor.savedAt', { time: savedLabel })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="student-report-topbar__actions">
        {!autoSaveEnabled && (
          <button type="button" className="student-report-action student-report-action--primary" onClick={onSave}>
            <Save className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('student.reports.editor.save')}</span>
          </button>
        )}

        <div ref={exportRef} className="student-report-export-menu">
          <button
            type="button"
            className={`student-report-action ${exportOpen ? 'is-open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={exportOpen}
            aria-label={t('student.reports.editor.export')}
            onClick={() => setExportOpen((o) => !o)}
          >
            <Download className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">{t('student.reports.editor.export')}</span>
            <ChevronDown
              className={`student-report-export-menu__chevron ${exportOpen ? 'is-open' : ''}`}
              aria-hidden
            />
          </button>

          {exportOpen && (
            <div className="student-report-export-menu__panel" role="menu" aria-label={t('student.reports.editor.export')}>
              <button
                type="button"
                role="menuitem"
                className="student-report-export-menu__item"
                onClick={() => handleExport('pdf')}
              >
                <Download className="h-4 w-4" aria-hidden />
                <span className="student-report-export-menu__item-text">
                  <span className="student-report-export-menu__item-label">{t('student.reports.export.pdf')}</span>
                  <span className="student-report-export-menu__item-desc">{t('student.reports.export.pdfDesc')}</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="student-report-export-menu__item"
                onClick={() => handleExport('docx')}
              >
                <FileType className="h-4 w-4" aria-hidden />
                <span className="student-report-export-menu__item-text">
                  <span className="student-report-export-menu__item-label">{t('student.reports.export.docx')}</span>
                  <span className="student-report-export-menu__item-desc">{t('student.reports.export.docxDesc')}</span>
                </span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`student-report-action ${modelCompareOpen ? 'student-report-action--primary' : ''}`}
          onClick={onOpenModelGuide}
          title={
            modelCompareOpen
              ? t('student.reports.modelGuide.closeCompare')
              : t('student.reports.editor.modelGuideTooltip')
          }
          aria-pressed={modelCompareOpen}
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          <span className="hidden lg:inline">
            {modelCompareOpen
              ? t('student.reports.modelGuide.closeCompare')
              : t('student.reports.editor.modelGuide')}
          </span>
        </button>
        <button
          type="button"
          className="student-report-action student-report-action--ghost"
          onClick={toggleTheme}
          aria-label={themeLabel}
          title={themeLabel}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" strokeWidth={2} aria-hidden />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </button>
        {!modelCompareOpen && (
          <button
            type="button"
            className="student-report-action student-report-action--ghost"
            onClick={onTogglePanel}
            aria-label={rightPanelOpen ? t('student.reports.editor.hideComments') : t('student.reports.editor.showComments')}
            title={rightPanelOpen ? t('student.reports.editor.hideComments') : t('student.reports.editor.showComments')}
          >
            {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        )}
        <button
          type="button"
          className="student-report-action student-report-action--exit"
          onClick={onQuit}
          title={t('student.reports.editor.exit.button')}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{t('student.reports.editor.exit.button')}</span>
        </button>
      </div>
    </header>
  );
};

export default ReportEditorTopBar;
