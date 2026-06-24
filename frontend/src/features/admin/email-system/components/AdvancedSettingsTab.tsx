import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput } from '../../shared/forms/AdminFormPrimitives';
import { adminFormGridClass } from '../../shared/forms/adminFormClasses';
import type { AdvancedSettings } from '../types/emailSystemTypes';
import {
  AdminButton,
  EmailSystemFormActions,
  EmailSystemSectionShell,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.advanced';

interface Props {
  draft: AdvancedSettings;
  saving: boolean;
  onChange: (next: AdvancedSettings) => void;
  onSave: () => void;
}

const AdvancedSettingsTab: FunctionComponent<Props> = ({ draft, saving, onChange, onSave }) => {
  const { t } = useTranslation();

  return (
    <EmailSystemSectionShell
      icon={SlidersHorizontal}
      busy={saving}
      title={t(`${PREFIX}.title`, { defaultValue: 'Advanced settings' })}
      subtitle={t(`${PREFIX}.subtitle`, {
        defaultValue: 'Rate limits, retries, queue size and delivery policies.',
      })}
    >
      <div className="space-y-6">
        <div className={adminFormGridClass}>
          <AdminFormField label={t(`${PREFIX}.rateLimitEmail`)} htmlFor="adv-rate-email">
            <AdminFormInput
              id="adv-rate-email"
              type="number"
              value={String(draft.rate_limit_email_per_hour)}
              onChange={(e) => onChange({ ...draft, rate_limit_email_per_hour: Number(e.target.value) })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.rateLimitGlobal`)} htmlFor="adv-rate-global">
            <AdminFormInput
              id="adv-rate-global"
              type="number"
              value={String(draft.rate_limit_global_per_minute)}
              onChange={(e) => onChange({ ...draft, rate_limit_global_per_minute: Number(e.target.value) })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.maxRetries`)} htmlFor="adv-max-retries">
            <AdminFormInput
              id="adv-max-retries"
              type="number"
              value={String(draft.max_retry_attempts)}
              onChange={(e) => onChange({ ...draft, max_retry_attempts: Number(e.target.value) })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.queueSize`)} htmlFor="adv-queue-size">
            <AdminFormInput
              id="adv-queue-size"
              type="number"
              value={String(draft.queue_max_size)}
              onChange={(e) => onChange({ ...draft, queue_max_size: Number(e.target.value) })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.digestSchedule`)} htmlFor="adv-digest" className="md:col-span-2">
            <AdminFormInput
              id="adv-digest"
              value={draft.digest_schedule}
              onChange={(e) => onChange({ ...draft, digest_schedule: e.target.value })}
            />
          </AdminFormField>
        </div>

        <AdminFormSwitch
          id="bounce-handling"
          label={t(`${PREFIX}.bounceHandling`)}
          checked={draft.bounce_handling_enabled}
          onChange={(v) => onChange({ ...draft, bounce_handling_enabled: v })}
        />

        <EmailSystemFormActions className="border-t-0 pt-0">
          <AdminButton variant="primary" size="md" disabled={saving} onClick={onSave}>
            {t(`${PREFIX}.save`)}
          </AdminButton>
        </EmailSystemFormActions>
      </div>
    </EmailSystemSectionShell>
  );
};

export default AdvancedSettingsTab;
