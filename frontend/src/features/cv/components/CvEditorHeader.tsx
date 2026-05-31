import { FunctionComponent } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import escaLogoLight from '../../auth/assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../../auth/assets/images/common/logo-esca.png';
import AdminLanguageSwitcher from '../../admin/dashboard/components/AdminLanguageSwitcher';
import { useAdminTheme } from '../../admin/dashboard/context/AdminThemeContext';
import {
  STUDENT_TEXT_MUTED,
  STUDENT_TEXT_PRIMARY,
  STUDENT_TEXT_SECONDARY,
} from '../../student/design-system/studentTokens';

interface CvEditorHeaderProps {
  saving?: boolean;
  /** Required when the back control is shown (provided by CvEditorShell). */
  backTo: string;
  hideBack?: boolean;
}

const CvEditorHeader: FunctionComponent<CvEditorHeaderProps> = ({
  saving = false,
  backTo,
  hideBack = false,
}) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useAdminTheme();
  const logoImage = theme === 'dark' ? escaLogoDark : escaLogoLight;
  const isRtl = i18n.dir() === 'rtl';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <header className="cv-editor-header admin-glass relative z-10 flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 sm:px-6 sm:py-4">
      <div className="cv-editor-header__brand flex min-w-0 items-center gap-3">
        {!hideBack && (
          <Link
            to={backTo}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-brand-muted)] hover:text-[var(--admin-brand)]"
            aria-label={t('cv.editor.back')}
          >
            <BackIcon className="h-[18px] w-[18px]" />
          </Link>
        )}
        <img
          className="h-9 w-auto shrink-0 object-contain sm:h-10"
          src={logoImage}
          alt={t('admin.brand.logoAlt')}
        />
        <div className="min-w-0">
          <h1 className={`truncate text-base font-semibold tracking-tight ${STUDENT_TEXT_PRIMARY}`}>
            {t('cv.editor.title')}
          </h1>
          <p className={`truncate text-xs font-medium ${STUDENT_TEXT_SECONDARY}`}>
            {t('cv.editor.calmSubtitle')}
          </p>
        </div>
      </div>

      <div className="cv-editor-header__actions flex shrink-0 items-center gap-3">
        {saving && (
          <span className={`hidden items-center gap-1.5 text-[10px] sm:flex ${STUDENT_TEXT_MUTED}`}>
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('cv.editor.saving')}
          </span>
        )}
        <div className="cv-editor-header-prefs flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-brand-muted)] hover:text-[var(--admin-brand)]"
            aria-label={theme === 'light' ? t('auth.preferences.darkMode') : t('auth.preferences.lightMode')}
          >
            {theme === 'light' ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </button>
          <AdminLanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default CvEditorHeader;
