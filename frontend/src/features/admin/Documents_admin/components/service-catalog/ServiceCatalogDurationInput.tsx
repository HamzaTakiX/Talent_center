import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';

interface Props {
  hours: number;
  onChange: (hours: number) => void;
  min?: number;
  max?: number;
}

const PRESETS = [24, 48, 72, 168];

const ServiceCatalogDurationInput: FunctionComponent<Props> = ({
  hours,
  onChange,
  min = 1,
  max = 336,
}) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio.duration';

  const adjust = (delta: number) => {
    const next = Math.min(max, Math.max(min, hours + delta));
    onChange(next);
  };

  const days = Math.floor(hours / 24);
  const remainder = hours % 24;

  return (
    <div className="admin-doc-studio-duration">
      <div className="admin-doc-studio-duration__control">
        <button
          type="button"
          className="admin-doc-studio-duration__btn"
          onClick={() => adjust(-24)}
          disabled={hours <= min}
          aria-label={t(`${P}.decrease`)}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="admin-doc-studio-duration__value">
          <span className="admin-doc-studio-duration__number">{hours}</span>
          <span className="admin-doc-studio-duration__unit">{t(`${P}.hours`)}</span>
          {days > 0 && (
            <span className="admin-doc-studio-duration__hint">
              {t(`${P}.equivalent`, { days, hours: remainder })}
            </span>
          )}
        </div>
        <button
          type="button"
          className="admin-doc-studio-duration__btn"
          onClick={() => adjust(24)}
          disabled={hours >= max}
          aria-label={t(`${P}.increase`)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="admin-doc-studio-duration__presets">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`admin-doc-studio-duration__preset ${hours === preset ? 'is-selected' : ''}`}
            onClick={() => onChange(preset)}
          >
            {preset}h
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceCatalogDurationInput;
