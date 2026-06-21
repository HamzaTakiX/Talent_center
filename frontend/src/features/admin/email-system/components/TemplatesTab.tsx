import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import { AdminFormField, AdminFormInput, AdminFormTextarea } from '../../shared/forms/AdminFormPrimitives';
import { AdminTableEmptyState } from '../../ui';
import type { EmailTemplateDetail, EmailTemplateRow } from '../types/emailSystemTypes';
import {
  AdminButton,
  EmailSystemAlert,
  EmailSystemFormActions,
  EmailSystemSectionShell,
  EmailSystemTablePanel,
  emailSystemTableTdClass,
  emailSystemTableThClass,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.templates';

interface Props {
  templates: EmailTemplateRow[];
  saving: boolean;
  loadTemplate: (code: string) => Promise<EmailTemplateDetail>;
  updateTemplate: (
    code: string,
    payload: { language: string; subject_template: string; body_html_template?: string },
  ) => Promise<EmailTemplateDetail>;
  previewTemplate: (code: string, language: string) => Promise<{ subject: string; body_html: string }>;
  testTemplate: (code: string, payload: { recipient_email: string; language: string }) => Promise<{ success: boolean; message: string }>;
}

const TemplatesTab: FunctionComponent<Props> = ({
  templates,
  saving,
  loadTemplate,
  updateTemplate,
  previewTemplate,
  testTemplate,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [language, setLanguage] = useState('fr');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [msg, setMsg] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
  ];

  useEffect(() => {
    if (!selected) return;
    void loadTemplate(selected).then((detail) => {
      const tr = detail.translations.find((x) => x.language === language) ?? detail.translations[0];
      if (tr) {
        setSubject(tr.subject_template);
        setBodyHtml(tr.body_html_template);
      }
    });
  }, [selected, language, loadTemplate]);

  const save = async () => {
    if (!selected) return;
    await updateTemplate(selected, { language, subject_template: subject, body_html_template: bodyHtml });
    setMsg({ tone: 'success', text: t(`${PREFIX}.saved`) });
  };

  return (
    <div className="email-system-tab-stack">
      <EmailSystemTablePanel
        title={t(`${PREFIX}.listTitle`, { defaultValue: 'Email templates' })}
        subtitle={t(`${PREFIX}.listSubtitle`, { defaultValue: 'Select a template to edit localized content.' })}
        minWidth="640px"
      >
        <table className="admin-table admin-table--safe w-full">
          <thead>
            <tr>
              <th className={emailSystemTableThClass}>{t(`${PREFIX}.code`)}</th>
              <th className={emailSystemTableThClass}>{t(`${PREFIX}.category`)}</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <AdminTableEmptyState colSpan={2} title={t(`${PREFIX}.empty`, { defaultValue: 'No templates' })} />
            ) : (
              templates.map((tpl) => (
                <tr
                  key={tpl.code}
                  className={`cursor-pointer transition-colors ${selected === tpl.code ? 'bg-[var(--admin-brand-muted)]/50' : ''}`}
                  onClick={() => setSelected(tpl.code)}
                >
                  <td className={`${emailSystemTableTdClass} font-mono text-xs`}>{tpl.code}</td>
                  <td className={emailSystemTableTdClass}>{tpl.category}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </EmailSystemTablePanel>

      {selected ? (
        <EmailSystemSectionShell
          icon={Layers}
          title={selected}
          subtitle={t(`${PREFIX}.editorSubtitle`, { defaultValue: 'Edit subject and HTML body for the selected language.' })}
        >
          <div className="space-y-5">
            <AdminSelect
              id="tpl-language"
              label={t(`${PREFIX}.language`)}
              value={language}
              options={languageOptions}
              onChange={setLanguage}
            />
            <AdminFormField label={t(`${PREFIX}.subject`)} htmlFor="tpl-subject">
              <AdminFormInput id="tpl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </AdminFormField>
            <AdminFormField label={t(`${PREFIX}.body`)} htmlFor="tpl-body">
              <AdminFormTextarea id="tpl-body" rows={10} value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
            </AdminFormField>
            <AdminFormField label={t(`${PREFIX}.testEmail`)} htmlFor="tpl-test-email" fieldKey="email">
              <AdminFormInput
                id="tpl-test-email"
                fieldKey="email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </AdminFormField>

            <EmailSystemFormActions className="border-t-0 pt-0">
              <AdminButton variant="primary" size="md" disabled={saving} onClick={() => void save()}>
                {t(`${PREFIX}.save`)}
              </AdminButton>
              <AdminButton
                variant="outline"
                size="md"
                onClick={() =>
                  void previewTemplate(selected, language).then((p) => setPreview(p.body_html))
                }
              >
                {t(`${PREFIX}.preview`)}
              </AdminButton>
              <AdminButton
                variant="secondary"
                size="md"
                disabled={!testEmail}
                onClick={() =>
                  void testTemplate(selected, { recipient_email: testEmail, language }).then((r) =>
                    setMsg({ tone: r.success ? 'success' : 'error', text: r.message }),
                  )
                }
              >
                {t(`${PREFIX}.sendTest`)}
              </AdminButton>
            </EmailSystemFormActions>

            {msg ? <EmailSystemAlert tone={msg.tone}>{msg.text}</EmailSystemAlert> : null}
            {preview ? (
              <div className="email-system-preview prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: preview }} />
            ) : null}
          </div>
        </EmailSystemSectionShell>
      ) : (
        <EmailSystemAlert tone="info">{t(`${PREFIX}.selectHint`)}</EmailSystemAlert>
      )}
    </div>
  );
};

export default TemplatesTab;
