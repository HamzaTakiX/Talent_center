import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Server } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import { AdminFormField, AdminFormInput } from '../../shared/forms/AdminFormPrimitives';
import { adminFormGridClass } from '../../shared/forms/adminFormClasses';
import type { ProviderConfig } from '../types/emailSystemTypes';
import {
  AdminButton,
  EmailSystemAlert,
  EmailSystemFormActions,
  EmailSystemSectionShell,
  EmailSystemStatusBadge,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.provider';

interface Props {
  draft: ProviderConfig;
  saving: boolean;
  onChange: (next: ProviderConfig) => void;
  onSave: () => void;
  onValidate: () => Promise<{ success: boolean; message: string }>;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onTest: () => Promise<{ success: boolean; message: string }>;
}

const providerTone = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'connected') return 'success';
  if (status === 'connection_error') return 'danger';
  return 'neutral';
};

const ProviderTab: FunctionComponent<Props> = ({
  draft,
  saving,
  onChange,
  onSave,
  onValidate,
  onConnect,
  onDisconnect,
  onTest,
}) => {
  const { t } = useTranslation();
  const [actionMsg, setActionMsg] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  const providerOptions = useMemo(
    () => [
      { value: 'mock', label: 'Mock (development)' },
      { value: 'sendgrid', label: 'SendGrid' },
      { value: 'ses', label: 'Amazon SES' },
      { value: 'mailgun', label: 'Mailgun' },
      { value: 'smtp', label: 'SMTP' },
    ],
    [],
  );

  const run = async (fn: () => Promise<{ success: boolean; message: string }>) => {
    const res = await fn();
    setActionMsg({ tone: res.success ? 'success' : 'error', text: res.message });
  };

  return (
    <EmailSystemSectionShell
      icon={Server}
      title={t(`${PREFIX}.title`, { defaultValue: 'Email provider' })}
      subtitle={t(`${PREFIX}.subtitle`, {
        defaultValue: 'Connect and validate your transactional email provider.',
      })}
      action={
        <EmailSystemStatusBadge tone={providerTone(draft.status)}>
          {t(`${PREFIX}.status.${draft.status}`)}
        </EmailSystemStatusBadge>
      }
    >
      <div className="space-y-6">
        {draft.last_error ? <EmailSystemAlert tone="error">{draft.last_error}</EmailSystemAlert> : null}

        <div className={adminFormGridClass}>
          <div className="md:col-span-2">
            <AdminSelect
              id="email-provider-type"
              label={t(`${PREFIX}.provider`)}
              value={draft.provider}
              options={providerOptions}
              onChange={(v) => onChange({ ...draft, provider: v as ProviderConfig['provider'] })}
              searchable
            />
          </div>

          {(draft.provider === 'sendgrid' || draft.provider === 'ses' || draft.provider === 'mailgun') && (
            <AdminFormField label={t(`${PREFIX}.apiKey`)} htmlFor="provider-api-key">
              <AdminFormInput
                id="provider-api-key"
                type="password"
                autoComplete="off"
                placeholder={
                  draft.has_api_key ? draft.api_key_masked : t(`${PREFIX}.placeholders.apiKey`)
                }
                onChange={(e) => onChange({ ...draft, api_key: e.target.value })}
              />
            </AdminFormField>
          )}

          <AdminFormField label={t(`${PREFIX}.domain`)} htmlFor="provider-domain">
            <AdminFormInput
              id="provider-domain"
              value={draft.domain}
              placeholder={t(`${PREFIX}.placeholders.domain`)}
              onChange={(e) => onChange({ ...draft, domain: e.target.value })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.region`)} htmlFor="provider-region">
            <AdminFormInput
              id="provider-region"
              value={draft.region}
              placeholder={t(`${PREFIX}.placeholders.region`)}
              onChange={(e) => onChange({ ...draft, region: e.target.value })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.endpoint`)} htmlFor="provider-endpoint" className="md:col-span-2">
            <AdminFormInput
              id="provider-endpoint"
              value={draft.endpoint}
              placeholder={t(`${PREFIX}.placeholders.endpoint`)}
              onChange={(e) => onChange({ ...draft, endpoint: e.target.value })}
            />
          </AdminFormField>

          {draft.provider === 'smtp' && (
            <>
              <AdminFormField label={t(`${PREFIX}.smtpHost`)} htmlFor="smtp-host">
                <AdminFormInput
                  id="smtp-host"
                  value={draft.smtp_host}
                  placeholder={t(`${PREFIX}.placeholders.smtpHost`)}
                  onChange={(e) => onChange({ ...draft, smtp_host: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label={t(`${PREFIX}.smtpPort`)} htmlFor="smtp-port">
                <AdminFormInput
                  id="smtp-port"
                  type="number"
                  value={String(draft.smtp_port ?? 587)}
                  placeholder="587"
                  onChange={(e) => onChange({ ...draft, smtp_port: Number(e.target.value) })}
                />
              </AdminFormField>
              <AdminFormField label={t(`${PREFIX}.smtpUser`)} htmlFor="smtp-user">
                <AdminFormInput
                  id="smtp-user"
                  value={draft.smtp_user}
                  placeholder={t(`${PREFIX}.placeholders.smtpUser`)}
                  onChange={(e) => onChange({ ...draft, smtp_user: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label={t(`${PREFIX}.smtpPassword`)} htmlFor="smtp-password">
                <AdminFormInput
                  id="smtp-password"
                  type="password"
                  autoComplete="off"
                  placeholder={t(`${PREFIX}.placeholders.smtpPassword`)}
                  onChange={(e) => onChange({ ...draft, smtp_password: e.target.value })}
                />
              </AdminFormField>
            </>
          )}
        </div>

        <EmailSystemFormActions>
          <AdminButton variant="primary" size="md" disabled={saving} onClick={onSave}>
            {t(`${PREFIX}.save`)}
          </AdminButton>
          <AdminButton variant="secondary" size="md" disabled={saving} onClick={() => void onConnect()}>
            {t(`${PREFIX}.connect`)}
          </AdminButton>
          <AdminButton variant="outline" size="md" disabled={saving} onClick={() => void run(onValidate)}>
            {t(`${PREFIX}.validate`)}
          </AdminButton>
          <AdminButton variant="outline" size="md" disabled={saving} onClick={() => void run(onTest)}>
            {t(`${PREFIX}.test`)}
          </AdminButton>
          <AdminButton variant="danger" size="md" disabled={saving} onClick={() => void onDisconnect()}>
            {t(`${PREFIX}.disconnect`)}
          </AdminButton>
        </EmailSystemFormActions>

        {actionMsg ? <EmailSystemAlert tone={actionMsg.tone}>{actionMsg.text}</EmailSystemAlert> : null}
      </div>
    </EmailSystemSectionShell>
  );
};

export default ProviderTab;
