import { FunctionComponent, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { AdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';
import type { WhiteboardBackgroundType, WhiteboardPreferences } from '../types/whiteboardPreferences';
import { resolveCanvasBackgroundColor } from '../utils/whiteboardColorUtils';
import WhiteboardFreeColorPicker from './WhiteboardFreeColorPicker';

interface WhiteboardSettingsModalProps {
  open: boolean;
  onClose: () => void;
  theme: AdminTheme;
  prefs: WhiteboardPreferences;
  onThemeChange: (theme: AdminTheme) => void;
  onBackgroundAppearanceChange: (color: string, opacity: number) => void;
  onBackgroundTypeChange: (type: WhiteboardBackgroundType) => void;
}

const BACKGROUND_TYPE_KEYS: WhiteboardBackgroundType[] = [
  'solid',
  'dotted-grid',
  'square-grid',
  'graph-paper',
  'lined-paper',
  'blank',
];

const WhiteboardSettingsModal: FunctionComponent<WhiteboardSettingsModalProps> = ({
  open,
  onClose,
  theme,
  prefs,
  onThemeChange,
  onBackgroundAppearanceChange,
  onBackgroundTypeChange,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const previewFill = resolveCanvasBackgroundColor(
    prefs.backgroundColor,
    prefs.backgroundOpacity,
  );

  return (
    <>
      <button
        type="button"
        className="student-whiteboard-settings-backdrop"
        aria-label={t('student.encadrant.workspace.whiteboardPage.settings.close')}
        onClick={onClose}
      />
      <dialog
        open
        className="student-whiteboard-settings-modal student-whiteboard-settings-modal--wide"
        aria-labelledby="whiteboard-settings-title"
      >
        <header className="student-whiteboard-settings-modal__head">
          <div>
            <h2 id="whiteboard-settings-title" className="student-whiteboard-settings-modal__title">
              {t('student.encadrant.workspace.whiteboardPage.settings.title')}
            </h2>
            <p className="student-whiteboard-settings-modal__subtitle">
              {t('student.encadrant.workspace.whiteboardPage.settings.subtitle')}
            </p>
          </div>
          <button
            type="button"
            className="student-whiteboard-icon-btn"
            onClick={onClose}
            aria-label={t('student.encadrant.workspace.whiteboardPage.settings.close')}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="student-whiteboard-settings-modal__body">
          <section className="student-whiteboard-settings-section">
            <h3>{t('student.encadrant.workspace.whiteboardPage.settings.theme.title')}</h3>
            <div className="student-whiteboard-settings-theme" role="group">
              <button
                type="button"
                className={`student-whiteboard-settings-chip ${theme === 'light' ? 'is-active' : ''}`}
                onClick={() => onThemeChange('light')}
                aria-pressed={theme === 'light'}
              >
                {t('student.encadrant.workspace.whiteboardPage.settings.theme.light')}
              </button>
              <button
                type="button"
                className={`student-whiteboard-settings-chip ${theme === 'dark' ? 'is-active' : ''}`}
                onClick={() => onThemeChange('dark')}
                aria-pressed={theme === 'dark'}
              >
                {t('student.encadrant.workspace.whiteboardPage.settings.theme.dark')}
              </button>
            </div>
            <p className="student-whiteboard-settings-hint">
              {t('student.encadrant.workspace.whiteboardPage.settings.theme.syncHint')}
            </p>
          </section>

          <section className="student-whiteboard-settings-section">
            <h3>{t('student.encadrant.workspace.whiteboardPage.settings.background.title')}</h3>
            <p className="student-whiteboard-settings-hint">
              {t('student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.hint')}
            </p>

            <WhiteboardFreeColorPicker
              color={prefs.backgroundColor}
              opacity={prefs.backgroundOpacity}
              onChange={onBackgroundAppearanceChange}
            />

            <p className="student-whiteboard-settings-label">
              {t('student.encadrant.workspace.whiteboardPage.settings.background.typeTitle')}
            </p>
            <div className="student-whiteboard-settings-bg-types" role="group">
              {BACKGROUND_TYPE_KEYS.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`student-whiteboard-settings-bg-type ${
                    prefs.backgroundType === type ? 'is-active' : ''
                  }`}
                  data-preview-type={type}
                  style={{ '--wb-preview-color': previewFill } as React.CSSProperties}
                  onClick={() => onBackgroundTypeChange(type)}
                  aria-pressed={prefs.backgroundType === type}
                  aria-label={t(
                    `student.encadrant.workspace.whiteboardPage.settings.background.types.${type}`,
                  )}
                >
                  <span className="student-whiteboard-settings-bg-type__preview" aria-hidden />
                  <span className="student-whiteboard-settings-bg-type__label">
                    {t(
                      `student.encadrant.workspace.whiteboardPage.settings.background.types.${type}`,
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </dialog>
    </>
  );
};

export default WhiteboardSettingsModal;
