import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ANNOUNCEMENT_TYPE_COLOR_OPTIONS,
  ANNOUNCEMENT_TYPE_ICON_OPTIONS,
  resolveAnnouncementTypeIcon,
} from '../utils/announcementTypeIcons';

interface Props {
  iconKey: string;
  color: string;
  onIconChange: (key: string) => void;
  onColorChange: (color: string) => void;
}

const P = 'admin.announcementsModule.types.form';

const AnnouncementTypeIconPicker: FunctionComponent<Props> = ({
  iconKey,
  color,
  onIconChange,
  onColorChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="admin-doc-studio-icon-picker">
      <p className="admin-doc-studio-icon-picker__label">{t(`${P}.iconLabel`)}</p>
      <div
        className="admin-doc-studio-icon-picker__grid"
        role="listbox"
        aria-label={t(`${P}.iconLabel`)}
      >
        {ANNOUNCEMENT_TYPE_ICON_OPTIONS.map((key) => {
          const Icon = resolveAnnouncementTypeIcon(key);
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
            </button>
          );
        })}
      </div>

      <p className="admin-doc-studio-icon-picker__label mt-4">{t(`${P}.colorLabel`)}</p>
      <div className="flex flex-wrap gap-2">
        {ANNOUNCEMENT_TYPE_COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            className={`h-8 w-8 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-[var(--admin-text)]' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
            onClick={() => onColorChange(c)}
            aria-pressed={color === c}
            title={c}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementTypeIconPicker;
