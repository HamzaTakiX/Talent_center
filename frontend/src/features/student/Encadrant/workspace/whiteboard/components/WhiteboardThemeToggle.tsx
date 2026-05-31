import { FunctionComponent } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { AdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';

interface WhiteboardThemeToggleProps {
  theme: AdminTheme;
  onToggle: () => void;
}

const WhiteboardThemeToggle: FunctionComponent<WhiteboardThemeToggleProps> = ({
  theme,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="student-whiteboard-icon-btn student-whiteboard-theme-toggle"
      onClick={onToggle}
      aria-label={
        theme === 'light'
          ? t('student.encadrant.workspace.whiteboardPage.settings.theme.dark')
          : t('student.encadrant.workspace.whiteboardPage.settings.theme.light')
      }
      title={
        theme === 'light'
          ? t('student.encadrant.workspace.whiteboardPage.settings.theme.dark')
          : t('student.encadrant.workspace.whiteboardPage.settings.theme.light')
      }
    >
      {theme === 'light' ? (
        <Moon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
      ) : (
        <Sun className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
};

export default WhiteboardThemeToggle;
