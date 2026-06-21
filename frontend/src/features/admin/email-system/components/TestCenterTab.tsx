import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import { AdminFormField, AdminFormInput } from '../../shared/forms/AdminFormPrimitives';
import { adminFormGridClass } from '../../shared/forms/adminFormClasses';
import {
  AdminButton,
  EmailSystemAlert,
  EmailSystemFormActions,
  EmailSystemSectionShell,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.test';

interface Props {
  templates: { code: string }[];
  onSend: (payload: {
    recipient_email: string;
    template_code?: string;
    language: string;
  }) => Promise<{ success: boolean; message: string; data?: Record<string, unknown> }>;
}

const TestCenterTab: FunctionComponent<Props> = ({ templates, onSend }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [template, setTemplate] = useState('');
  const [language, setLanguage] = useState('fr');
  const [result, setResult] = useState<{ success: boolean; message: string; data?: Record<string, unknown> } | null>(
    null,
  );

  const templateOptions = useMemo(
    () => [{ value: '', label: t(`${PREFIX}.noTemplate`) }, ...templates.map((tpl) => ({ value: tpl.code, label: tpl.code }))],
    [templates, t],
  );

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
  ];

  const submit = async () => {
    const res = await onSend({
      recipient_email: email,
      template_code: template || undefined,
      language,
    });
    setResult(res);
  };

  return (
    <EmailSystemSectionShell
      icon={FlaskConical}
      title={t(`${PREFIX}.title`, { defaultValue: 'Test center' })}
      subtitle={t(`${PREFIX}.subtitle`, {
        defaultValue: 'Send a test email and inspect the provider response.',
      })}
    >
      <div className={adminFormGridClass}>
        <AdminFormField label={t(`${PREFIX}.recipient`)} htmlFor="test-recipient" fieldKey="email">
          <AdminFormInput
            id="test-recipient"
            fieldKey="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AdminFormField>
        <AdminSelect
          id="test-template"
          label={t(`${PREFIX}.template`)}
          value={template}
          options={templateOptions}
          onChange={setTemplate}
          searchable
        />
        <AdminSelect
          id="test-language"
          label={t(`${PREFIX}.language`)}
          value={language}
          options={languageOptions}
          onChange={setLanguage}
        />
      </div>

      <EmailSystemFormActions className="mt-6 border-t-0 pt-0">
        <AdminButton variant="primary" size="md" disabled={!email} onClick={() => void submit()}>
          {t(`${PREFIX}.send`)}
        </AdminButton>
      </EmailSystemFormActions>

      {result ? (
        <div className="mt-5 space-y-3">
          <EmailSystemAlert tone={result.success ? 'success' : 'error'}>{result.message}</EmailSystemAlert>
          {result.data ? (
            <pre className="overflow-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] p-4 text-xs text-[var(--admin-text-secondary)]">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}
    </EmailSystemSectionShell>
  );
};

export default TestCenterTab;
