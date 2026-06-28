import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModernTimePicker from '../../../shared/forms/AdminModernTimePicker';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function parseRange(value: string): { start: string; end: string } {
  const parts = value.split('-').map((s) => s.trim());
  return { start: parts[0] ?? '09:00', end: parts[1] ?? '17:00' };
}

function formatRange(start: string, end: string): string {
  return `${start}-${end}`;
}

const ServiceCatalogTimeRangePicker: FunctionComponent<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { start, end } = parseRange(value);

  return (
    <div className="admin-doc-studio-time-range">
      <div className="admin-doc-studio-time-range__field">
        <label className="admin-doc-studio-time-range__label">
          {t('admin.documentsModule.catalog.form.studio.timeRange.from')}
        </label>
        <AdminModernTimePicker
          value={start}
          onChange={(nextStart) => onChange(formatRange(nextStart, end))}
        />
      </div>
      <span className="admin-doc-studio-time-range__sep" aria-hidden>
        —
      </span>
      <div className="admin-doc-studio-time-range__field">
        <label className="admin-doc-studio-time-range__label">
          {t('admin.documentsModule.catalog.form.studio.timeRange.to')}
        </label>
        <AdminModernTimePicker
          value={end}
          onChange={(nextEnd) => onChange(formatRange(start, nextEnd))}
        />
      </div>
    </div>
  );
};

export default ServiceCatalogTimeRangePicker;
