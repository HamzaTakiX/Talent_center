import { FunctionComponent } from 'react';
import { CalendarClock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AdminFormField } from '../../shared/forms/AdminFormPrimitives';
import AdminModernDatePicker from '../../shared/forms/AdminModernDatePicker';
import AdminModernTimePicker from '../../shared/forms/AdminModernTimePicker';
import AdminSelect from '../../account/components/AdminSelect';
import AdminFormSection from '../../shared/forms/AdminFormSection';
import { adminFormGridClass } from '../../shared/forms/adminFormClasses';
import {
  SCHEDULE_TIMEZONE_OPTIONS,
  formatScheduledPreview,
  type PublicationMode,
} from '../utils/scheduleUtils';

const FORM_PREFIX = 'admin.forms.createAnnouncement';

interface PublicationSettingsSectionProps {
  publicationMode: PublicationMode;
  publishDate: string;
  publishTime: string;
  timezone: string;
  errors?: {
    publishDate?: string;
    publishTime?: string;
    timezone?: string;
    publicationMode?: string;
  };
  disabled?: boolean;
  onPublicationModeChange: (mode: PublicationMode) => void;
  onPublishDateChange: (value: string) => void;
  onPublishTimeChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

const PublicationSettingsSection: FunctionComponent<PublicationSettingsSectionProps> = ({
  publicationMode,
  publishDate,
  publishTime,
  timezone,
  errors = {},
  disabled = false,
  onPublicationModeChange,
  onPublishDateChange,
  onPublishTimeChange,
  onTimezoneChange,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('ar') ? 'ar-MA' : i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR';
  const preview = formatScheduledPreview(publishDate, publishTime, locale);

  return (
    <AdminFormSection
      className="admin-ann-publication-section"
      title={t(`${FORM_PREFIX}.publication.title`)}
      description={t(`${FORM_PREFIX}.publication.hint`)}
    >
      <div className="admin-ann-publication-card">
        <div className="admin-ann-publication-card__header">
          <span className="admin-ann-publication-card__header-icon" aria-hidden>
            <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="admin-ann-publication-card__header-text">
            <span className="admin-ann-publication-card__header-title">
              {t(`${FORM_PREFIX}.publication.title`)}
            </span>
          </div>
        </div>

        <fieldset className="admin-ann-publication-card__modes" disabled={disabled}>
          <legend className="sr-only">{t(`${FORM_PREFIX}.publication.modeLabel`)}</legend>
          <div
            className="admin-ann-publication-card__segmented"
            role="radiogroup"
            aria-label={t(`${FORM_PREFIX}.publication.modeLabel`)}
          >
            {(['immediate', 'schedule'] as const).map((mode) => {
              const active = publicationMode === mode;
              return (
                <label
                  key={mode}
                  className={`admin-ann-publication-card__segment ${active ? 'is-active' : ''}`}
                >
                  <input
                    type="radio"
                    name="publication-mode"
                    value={mode}
                    checked={active}
                    onChange={() => onPublicationModeChange(mode)}
                    className="sr-only"
                  />
                  <span>{t(`${FORM_PREFIX}.publication.${mode}`)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <AnimatePresence initial={false}>
          {publicationMode === 'schedule' ? (
            <motion.div
              key="schedule-fields"
              className="admin-ann-publication-card__schedule"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={adminFormGridClass}>
                <AdminFormField
                  label={t(`${FORM_PREFIX}.publication.publishDate`)}
                  htmlFor="publish-date"
                  required
                  error={errors.publishDate}
                >
                  <AdminModernDatePicker
                    id="publish-date"
                    value={publishDate}
                    onChange={onPublishDateChange}
                    disabled={disabled}
                    min={new Date().toISOString().slice(0, 10)}
                    aria-invalid={errors.publishDate ? true : undefined}
                    aria-label={t(`${FORM_PREFIX}.publication.publishDate`)}
                  />
                </AdminFormField>

                <AdminFormField
                  label={t(`${FORM_PREFIX}.publication.publishTime`)}
                  htmlFor="publish-time"
                  required
                  error={errors.publishTime}
                >
                  <AdminModernTimePicker
                    id="publish-time"
                    value={publishTime}
                    onChange={onPublishTimeChange}
                    disabled={disabled}
                    aria-invalid={errors.publishTime ? true : undefined}
                    aria-label={t(`${FORM_PREFIX}.publication.publishTime`)}
                  />
                </AdminFormField>

                <AdminSelect
                  id="publish-timezone"
                  label={t(`${FORM_PREFIX}.publication.timezone`)}
                  value={timezone}
                  onChange={onTimezoneChange}
                  options={SCHEDULE_TIMEZONE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                  disabled={disabled}
                  error={errors.timezone}
                />
              </div>

              {preview ? (
                <motion.p
                  className="admin-ann-publication-card__preview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.08 }}
                >
                  {t(`${FORM_PREFIX}.publication.preview`, { datetime: preview })}
                </motion.p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </AdminFormSection>
  );
};

export default PublicationSettingsSection;
