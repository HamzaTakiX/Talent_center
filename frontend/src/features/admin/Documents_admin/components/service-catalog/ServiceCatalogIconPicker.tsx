import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { resolveServiceIcon } from './serviceCatalogIcons';
import { COLOR_THEME_OPTIONS, SERVICE_ICON_OPTIONS } from './serviceCatalogStudioSteps';

interface Props {
  iconKey: string;
  colorTheme: string;
  onIconChange: (key: string) => void;
  onThemeChange: (theme: string) => void;
}

const ServiceCatalogIconPicker: FunctionComponent<Props> = ({
  iconKey,
  colorTheme,
  onIconChange,
  onThemeChange,
}) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio';

  return (
    <motion.div className="admin-doc-studio-icon-picker">
      <p className="admin-doc-studio-icon-picker__label">{t(`${P}.iconGridLabel`)}</p>
      <motion.div
        className="admin-doc-studio-icon-picker__grid"
        role="listbox"
        aria-label={t(`${P}.iconGridLabel`)}
      >
        {SERVICE_ICON_OPTIONS.map((key) => {
          const Icon = resolveServiceIcon(key);
          const selected = iconKey === key;
          return (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={selected}
              className={`admin-doc-studio-icon-picker__item ${selected ? 'is-selected' : ''}`}
              onClick={() => onIconChange(key)}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              <span>{t(`${P}.icons.${key.replace(/-/g, '_')}`)}</span>
            </button>
          );
        })}
      </motion.div>

      <p className="admin-doc-studio-icon-picker__label mt-4">{t(`${P}.themeLabel`)}</p>
      <div className="admin-doc-studio-theme-grid">
        {COLOR_THEME_OPTIONS.map((theme) => (
          <button
            key={theme}
            type="button"
            className={`admin-doc-studio-theme-swatch admin-doc-studio-theme-swatch--${theme} ${colorTheme === theme ? 'is-selected' : ''}`}
            onClick={() => onThemeChange(theme)}
            aria-pressed={colorTheme === theme}
            title={t(`${P}.colorThemes.${theme}`)}
          >
            <span className="admin-doc-studio-theme-swatch__dot" aria-hidden />
            <span>{t(`${P}.colorThemes.${theme}`)}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default ServiceCatalogIconPicker;
