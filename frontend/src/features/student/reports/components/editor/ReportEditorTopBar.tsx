import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  Download,
  FileType,
  History,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Save,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import escaLogoLight from '../../../../auth/assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../../../../auth/assets/images/common/logo-esca.png';
import { useAdminTheme } from '../../../../admin/dashboard/context/AdminThemeContext';
import { STUDENT_REPORTS_PATH } from '../../constants/routes';
import { REPORT_TITLE_MAX_LENGTH } from '../../constants/limits';
import type { AutoSaveState } from '../../types';

interface ReportEditorTopBarProps {
  title: string;
  autoSaveState: AutoSaveState;
  autoSaveEnabled: boolean;
  savedLabel: string | null;
  rightPanelOpen: boolean;
  onTitleChange: (title: string) => void;
  onAutoSaveChange: (enabled: boolean) => void;
  onSave: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onOpenVersions: () => void;
  onOpenReferences: () => void;
  onTogglePanel: () => void;
}

const ReportEditorTopBar: FunctionComponent<ReportEditorTopBarProps> = ({
  title,
  autoSaveState,
  autoSaveEnabled,
  savedLabel,
  rightPanelOpen,
  onTitleChange,
  onAutoSaveChange,
  onSave,
  onExportPdf,
  onExportDocx,
  onOpenVersions,
  onOpenReferences,
  onTogglePanel,
}) => {
  const { t } = useTranslation();
  const { theme } = useAdminTheme();
  const escaLogo = theme === 'dark' ? escaLogoDark : escaLogoLight;
  const placeholder = t('student.reports.editor.reportName');

  return (
    <header className="student-report-topbar">
      <div className="student-report-topbar__left">
        <Link to={STUDENT_REPORTS_PATH} className="student-whiteboard-logo-link" title={t('student.reports.editor.backToHub')}>
          <img src={escaLogo} alt="" className="student-whiteboard-logo" />
        </Link>
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
        <button type="button" className="student-report-action student-report-action--primary" onClick={onSave}>
          <Save className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{t('student.reports.editor.save')}</span>
        </button>
        <button type="button" className="student-report-action" onClick={onExportPdf}>
          <Download className="h-4 w-4" aria-hidden />
          <span className="hidden md:inline">{t('student.reports.editor.exportPdf')}</span>
        </button>
        <button type="button" className="student-report-action" onClick={onExportDocx}>
          <FileType className="h-4 w-4" aria-hidden />
          <span className="hidden md:inline">{t('student.reports.editor.exportDocx')}</span>
        </button>
        <button type="button" className="student-report-action" onClick={onOpenVersions}>
          <History className="h-4 w-4" aria-hidden />
          <span className="hidden lg:inline">{t('student.reports.editor.versions')}</span>
        </button>
        <button type="button" className="student-report-action" onClick={onOpenReferences}>
          <BookMarked className="h-4 w-4" aria-hidden />
          <span className="hidden lg:inline">{t('student.reports.editor.references')}</span>
        </button>
        <button
          type="button"
          className="student-report-action student-report-action--ghost"
          onClick={onTogglePanel}
          aria-label={rightPanelOpen ? t('student.reports.editor.hideComments') : t('student.reports.editor.showComments')}
          title={rightPanelOpen ? t('student.reports.editor.hideComments') : t('student.reports.editor.showComments')}
        >
          {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};

export default ReportEditorTopBar;
