import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput } from '../../shared/forms/AdminFormPrimitives';
import { adminFormGridClass } from '../../shared/forms/adminFormClasses';
import type { GeneralSettings } from '../types/emailSystemTypes';
import {
  AdminButton,
  EmailSystemFormActions,
  EmailSystemSectionShell,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.general';

interface Props {
  draft: GeneralSettings;
  saving: boolean;
  onChange: (next: GeneralSettings) => void;
  onSave: () => void;
}

const GeneralSettingsTab: FunctionComponent<Props> = ({ draft, saving, onChange, onSave }) => {
  const { t } = useTranslation();

  const languageOptions = [
    { value: 'fr', label: t(`${PREFIX}.langFr`) },
    { value: 'en', label: t(`${PREFIX}.langEn`) },
  ];

  return (
    <EmailSystemSectionShell
      icon={Settings2}
      busy={saving}
      title={t(`${PREFIX}.title`, { defaultValue: 'General settings' })}
      subtitle={t(`${PREFIX}.subtitle`, {
        defaultValue: 'Default sender identity and platform-wide email preferences.',
      })}
    >
      <div className="space-y-6">
        <AdminFormSwitch
          id="platform-email-enabled"
          label={t(`${PREFIX}.platformEnabled`)}
          checked={draft.platform_email_enabled}
          onChange={(v) => onChange({ ...draft, platform_email_enabled: v })}
        />

        <div className={adminFormGridClass}>
          <AdminFormField label={t(`${PREFIX}.senderName`)} htmlFor="email-sender-name" fieldKey="title">
            <AdminFormInput
              id="email-sender-name"
              fieldKey="title"
              value={draft.default_sender_name}
              onChange={(e) => onChange({ ...draft, default_sender_name: e.target.value })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.senderEmail`)} htmlFor="email-sender-email" fieldKey="email">
            <AdminFormInput
              id="email-sender-email"
              fieldKey="email"
              type="email"
              value={draft.default_sender_email}
              onChange={(e) => onChange({ ...draft, default_sender_email: e.target.value })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.replyTo`)} htmlFor="email-reply-to" fieldKey="email">
            <AdminFormInput
              id="email-reply-to"
              fieldKey="email"
              type="email"
              value={draft.reply_to_email}
              onChange={(e) => onChange({ ...draft, reply_to_email: e.target.value })}
            />
          </AdminFormField>
          <AdminSelect
            id="email-default-language"
            label={t(`${PREFIX}.language`)}
            value={draft.default_language}
            options={languageOptions}
            onChange={(v) => onChange({ ...draft, default_language: v as 'fr' | 'en' })}
          />
        </div>

        <EmailSystemFormActions>
          <AdminButton variant="primary" size="md" disabled={saving} onClick={onSave}>
            {t(`${PREFIX}.save`)}
          </AdminButton>
        </EmailSystemFormActions>
      </div>
    </EmailSystemSectionShell>
  );
};

export default GeneralSettingsTab;
