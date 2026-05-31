import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileImage, History, Save, Settings2, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import escaLogoLight from '../../../../../auth/assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../../../../../auth/assets/images/common/logo-esca.png';
import { STUDENT_ENCADRANT_WORKSPACE_PATH } from '../../../constants/routes';
import WhiteboardCollaboratorsBar from './WhiteboardCollaboratorsBar';
import WhiteboardLanguageSwitcher from './WhiteboardLanguageSwitcher';
import WhiteboardThemeToggle from './WhiteboardThemeToggle';
import type { AppLanguage } from '../../../../../../i18n/types';
import type { AdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';

interface WhiteboardTopBarProps {
  onSave: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onShare: () => void;
  onOpenVersions: () => void;
  savedLabel: string | null;
  autoSaveEnabled: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
  isExporting: boolean;
  shareOpen: boolean;
  theme: AdminTheme;
  onThemeToggle: () => void;
  onLanguageSelect: (lang: AppLanguage) => void;
  onOpenSettings: () => void;
}

const WhiteboardTopBar: FunctionComponent<WhiteboardTopBarProps> = ({
  onSave,
  onExportPng,
  onExportPdf,
  onShare,
  onOpenVersions,
  savedLabel,
  autoSaveEnabled,
  onAutoSaveChange,
  isExporting,
  shareOpen,
  theme,
  onThemeToggle,
  onLanguageSelect,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const escaLogo = theme === 'dark' ? escaLogoDark : escaLogoLight;

  return (
    <header className="student-whiteboard-topbar">
      <div className="student-whiteboard-topbar__left">
        <Link
          to={STUDENT_ENCADRANT_WORKSPACE_PATH}
          className="student-whiteboard-logo-link"
          title={t('student.encadrant.workspace.whiteboardPage.back')}
        >
          <img
            src={escaLogo}
            alt={t('admin.brand.logoAlt')}
            className="student-whiteboard-logo"
          />
        </Link>
        <div className="student-whiteboard-topbar__title-wrap">
          <h1 className="student-whiteboard-topbar__title">
            {t('student.encadrant.workspace.platform.title')}
          </h1>
          <div className="student-whiteboard-autosave">
            <span className="student-whiteboard-autosave__label">
              {t('student.encadrant.workspace.whiteboardPage.autoSaveLabel')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoSaveEnabled}
              aria-label={t('student.encadrant.workspace.whiteboardPage.autoSaveLabel')}
              className={`student-whiteboard-switch ${autoSaveEnabled ? 'is-on' : ''}`}
              onClick={() => onAutoSaveChange(!autoSaveEnabled)}
            >
              <span className="student-whiteboard-switch__thumb" aria-hidden />
            </button>
            {savedLabel && autoSaveEnabled && (
              <span className="student-whiteboard-autosave__saved">
                {t('student.encadrant.workspace.whiteboardPage.savedAt', { time: savedLabel })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="student-whiteboard-topbar__personalization">
        <WhiteboardThemeToggle theme={theme} onToggle={onThemeToggle} />
        <WhiteboardLanguageSwitcher onSelect={onLanguageSelect} />
        <button
          type="button"
          className="student-whiteboard-icon-btn"
          onClick={onOpenSettings}
          aria-label={t('student.encadrant.workspace.whiteboardPage.settings.open')}
          title={t('student.encadrant.workspace.whiteboardPage.settings.open')}
        >
          <Settings2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="student-whiteboard-topbar__actions">
        <button type="button" className="student-whiteboard-action student-whiteboard-action--primary" onClick={onSave}>
          <Save className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{t('student.encadrant.workspace.whiteboardPage.save')}</span>
        </button>
        <button
          type="button"
          className="student-whiteboard-action"
          onClick={onExportPng}
          disabled={isExporting}
        >
          <FileImage className="h-4 w-4" aria-hidden />
          <span className="hidden md:inline">{t('student.encadrant.workspace.whiteboardPage.exportPng')}</span>
        </button>
        <button
          type="button"
          className="student-whiteboard-action"
          onClick={onExportPdf}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" aria-hidden />
          <span className="hidden md:inline">{t('student.encadrant.workspace.whiteboardPage.exportPdf')}</span>
        </button>
        <button
          type="button"
          className={`student-whiteboard-action ${shareOpen ? 'is-active' : ''}`}
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          <span className="hidden lg:inline">{t('student.encadrant.workspace.whiteboardPage.share')}</span>
        </button>
        <button type="button" className="student-whiteboard-action" onClick={onOpenVersions}>
          <History className="h-4 w-4" aria-hidden />
          <span className="hidden lg:inline">{t('student.encadrant.workspace.whiteboardPage.versions.button')}</span>
        </button>
      </div>

      <WhiteboardCollaboratorsBar />
    </header>
  );
};

export default WhiteboardTopBar;
