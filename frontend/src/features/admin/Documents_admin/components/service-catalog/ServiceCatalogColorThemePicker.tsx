import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COLOR_THEME_OPTIONS } from './serviceCatalogStudioSteps';
import {
  DEFAULT_CUSTOM_COLOR,
  isCustomServiceColor,
  isPresetServiceColor,
} from './serviceCatalogColor';

interface Props {
  colorTheme: string;
  onThemeChange: (theme: string) => void;
}

const ServiceCatalogColorThemePicker: FunctionComponent<Props> = ({ colorTheme, onThemeChange }) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio';
  const customActive = isCustomServiceColor(colorTheme);
  const [customHex, setCustomHex] = useState(
    customActive ? colorTheme : DEFAULT_CUSTOM_COLOR,
  );

  useEffect(() => {
    if (isCustomServiceColor(colorTheme)) {
      setCustomHex(colorTheme);
    }
  }, [colorTheme]);

  const applyCustomColor = (hex: string) => {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(normalized)) return;
    setCustomHex(normalized);
    onThemeChange(normalized);
  };

  return (
    <div className="admin-doc-studio-color-picker">
      <p className="admin-doc-studio-color-picker__label">{t(`${P}.themeLabel`)}</p>
      <div className="admin-doc-studio-theme-grid">
        {COLOR_THEME_OPTIONS.map((theme) => (
          <button
            key={theme}
            type="button"
            className={`admin-doc-studio-theme-swatch admin-doc-studio-theme-swatch--${theme} ${isPresetServiceColor(colorTheme) && colorTheme === theme ? 'is-selected' : ''}`}
            onClick={() => onThemeChange(theme)}
            aria-pressed={isPresetServiceColor(colorTheme) && colorTheme === theme}
            title={t(`${P}.colorThemes.${theme}`)}
          >
            <span className="admin-doc-studio-theme-swatch__dot" aria-hidden />
            <span>{t(`${P}.colorThemes.${theme}`)}</span>
          </button>
        ))}
      </div>

      <div className={`admin-doc-studio-theme-custom ${customActive ? 'is-selected' : ''}`}>
        <label className="admin-doc-studio-theme-custom__picker">
          <input
            type="color"
            className="admin-doc-studio-theme-custom__input"
            value={customHex.length === 7 ? customHex : DEFAULT_CUSTOM_COLOR}
            onChange={(e) => applyCustomColor(e.target.value)}
            aria-label={t(`${P}.customColorLabel`)}
          />
          <span className="admin-doc-studio-theme-custom__dot" style={{ background: customHex }} aria-hidden />
          <span>{t(`${P}.customColorLabel`)}</span>
        </label>
        <input
          type="text"
          className="admin-doc-studio-theme-custom__hex"
          value={customHex}
          onChange={(e) => applyCustomColor(e.target.value)}
          onBlur={() => {
            if (!isCustomServiceColor(customHex)) {
              applyCustomColor(DEFAULT_CUSTOM_COLOR);
            }
          }}
          placeholder="#4a7bb8"
          spellCheck={false}
          maxLength={7}
          aria-label={t(`${P}.customColorHexLabel`)}
        />
      </div>
    </div>
  );
};

export default ServiceCatalogColorThemePicker;
