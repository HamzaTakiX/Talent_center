import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, FileCode2, Layers, RefreshCw } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import { AdminFormField, AdminFormInput, AdminFormTextarea } from '../../shared/forms/AdminFormPrimitives';
import { emailSystemApi } from '../api/emailSystemApi';
import type { EmailTemplateRow, GeneralSettings } from '../types/emailSystemTypes';
import {
  AdminButton,
  EmailSystemAlert,
  EmailSystemFormActions,
  EmailSystemSectionShell,
  EmailSystemTabLoading,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.template';

interface Props {
  general: GeneralSettings | null;
}

const SAMPLE_STUDENT = {
  name: 'Amina Benali',
  email: 'amina.benali@etu.emsi.ma',
};

const TemplateTab: FunctionComponent<Props> = ({ general }) => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string>('');
  const [language, setLanguage] = useState('fr');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewMode, setPreviewMode] = useState<'draft' | 'rendered'>('draft');
  const [msg, setMsg] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
  ];

  const templateOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.selectTemplate`) },
      ...templates.map((tpl) => ({ value: tpl.code, label: tpl.code })),
    ],
    [templates, t],
  );

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const items = await emailSystemApi.listTemplates();
      setTemplates(items);
      setSelected((prev) => prev || items[0]?.code || '');
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.loadError`) });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!selected) return;
    void emailSystemApi.getTemplate(selected).then((detail) => {
      const tr = detail.translations.find((x) => x.language === language) ?? detail.translations[0];
      if (tr) {
        setSubject(tr.subject_template);
        setBodyHtml(tr.body_html_template || '');
        setPreviewMode('draft');
        setPreviewHtml(tr.body_html_template || '');
        setPreviewSubject(tr.subject_template);
      }
    });
  }, [selected, language]);

  useEffect(() => {
    if (previewMode === 'draft') {
      setPreviewHtml(bodyHtml);
      setPreviewSubject(subject);
    }
  }, [bodyHtml, subject, previewMode]);

  const renderWithVariables = async () => {
    if (!selected) return;
    try {
      const rendered = await emailSystemApi.previewTemplate(selected, language);
      setPreviewHtml(rendered.body_html);
      setPreviewSubject(rendered.subject);
      setPreviewMode('rendered');
      setMsg({ tone: 'info', text: t(`${PREFIX}.renderedHint`) });
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.renderError`) });
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setMsg(null);
    try {
      await emailSystemApi.updateTemplate(selected, {
        language,
        subject_template: subject,
        body_html_template: bodyHtml,
      });
      setMsg({ tone: 'success', text: t(`${PREFIX}.saved`) });
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.saveError`) });
    } finally {
      setSaving(false);
    }
  };

  const senderName = general?.default_sender_name || 'Digital Talent Center';
  const senderEmail = general?.default_sender_email || 'noreply@talent-center.ma';

  if (loading) {
    return <EmailSystemTabLoading variant="form" />;
  }

  return (
    <div className="email-system-tab-stack">
      <EmailSystemSectionShell
        icon={Layers}
        title={t(`${PREFIX}.title`)}
        subtitle={t(`${PREFIX}.subtitle`)}
        action={
          <AdminButton variant="outline" size="sm" onClick={() => void loadTemplates()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            {t(`${PREFIX}.refresh`)}
          </AdminButton>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminSelect
            id="template-picker"
            label={t(`${PREFIX}.template`)}
            value={selected}
            options={templateOptions}
            onChange={setSelected}
            searchable
          />
          <AdminSelect
            id="template-language"
            label={t(`${PREFIX}.language`)}
            value={language}
            options={languageOptions}
            onChange={setLanguage}
          />
          <AdminFormField label={t(`${PREFIX}.subject`)} htmlFor="template-subject">
            <AdminFormInput
              id="template-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setPreviewMode('draft');
              }}
            />
          </AdminFormField>
        </div>
      </EmailSystemSectionShell>

      {selected ? (
        <div className="email-system-template-editor">
          <section className="email-system-template-editor__panel">
            <header className="email-system-template-editor__panel-header">
              <div className="email-system-template-editor__panel-header__main">
                <div className="email-system-section-head__title-row">
                  <FileCode2 className="h-4 w-4" aria-hidden />
                  <h3 className="text-sm font-semibold text-[var(--admin-text)]">{t(`${PREFIX}.htmlEditor`)}</h3>
                </div>
              </div>
            </header>

            <div className="email-system-template-editor__panel-body">
              <AdminFormField
                className="email-system-template-editor__html-field"
                label={t(`${PREFIX}.htmlBody`)}
                htmlFor="template-html-body"
              >
                <div className="email-system-template-editor__textarea-wrap">
                  <AdminFormTextarea
                    id="template-html-body"
                    value={bodyHtml}
                    onChange={(e) => {
                      setBodyHtml(e.target.value);
                      setPreviewMode('draft');
                    }}
                    className="email-system-template-editor__textarea font-mono text-xs leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </AdminFormField>

              <p className="email-system-template-editor__footer-note text-xs text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.variablesHint`)}
              </p>

              <EmailSystemFormActions className="email-system-template-editor__actions border-t-0 pt-0">
                <AdminButton variant="primary" size="md" disabled={saving} onClick={() => void save()}>
                  {t(`${PREFIX}.save`)}
                </AdminButton>
                <AdminButton variant="outline" size="md" onClick={() => void renderWithVariables()}>
                  <Eye className="h-4 w-4" aria-hidden />
                  {t(`${PREFIX}.renderPreview`)}
                </AdminButton>
              </EmailSystemFormActions>

              {msg ? <EmailSystemAlert tone={msg.tone}>{msg.text}</EmailSystemAlert> : null}
            </div>
          </section>

          <section className="email-system-template-editor__panel email-system-template-editor__panel--preview">
            <header className="email-system-template-editor__panel-header">
              <div className="email-system-template-editor__panel-header__main">
                <div className="email-system-section-head__title-row">
                  <Eye className="h-4 w-4" aria-hidden />
                  <h3 className="text-sm font-semibold text-[var(--admin-text)]">{t(`${PREFIX}.studentPreview`)}</h3>
                </div>
                <p className="email-system-section-head__subtitle text-xs text-[var(--admin-text-secondary)]">
                  {t(`${PREFIX}.studentPreviewHint`)}
                </p>
              </div>
              {previewMode === 'rendered' ? (
                <span className="email-system-template-editor__badge">{t(`${PREFIX}.renderedBadge`)}</span>
              ) : (
                <span className="email-system-template-editor__badge email-system-template-editor__badge--draft">
                  {t(`${PREFIX}.draftBadge`)}
                </span>
              )}
            </header>

            <div className="email-system-template-editor__panel-body email-system-template-editor__panel-body--preview">
              <div className="email-system-student-preview" role="region" aria-label={t(`${PREFIX}.studentPreview`)}>
                <div className="email-system-student-preview__chrome">
                <div className="email-system-student-preview__meta">
                  <div className="email-system-student-preview__row">
                    <span className="email-system-student-preview__label">{t(`${PREFIX}.from`)}</span>
                    <span className="email-system-student-preview__value">
                      {senderName} &lt;{senderEmail}&gt;
                    </span>
                  </div>
                  <div className="email-system-student-preview__row">
                    <span className="email-system-student-preview__label">{t(`${PREFIX}.to`)}</span>
                    <span className="email-system-student-preview__value">
                      {SAMPLE_STUDENT.name} &lt;{SAMPLE_STUDENT.email}&gt;
                    </span>
                  </div>
                  <div className="email-system-student-preview__row">
                    <span className="email-system-student-preview__label">{t(`${PREFIX}.subjectLabel`)}</span>
                    <span className="email-system-student-preview__value email-system-student-preview__subject">
                      {previewSubject || t(`${PREFIX}.noSubject`)}
                    </span>
                  </div>
                </div>
                <div
                  className="email-system-student-preview__body"
                  dangerouslySetInnerHTML={{
                    __html: previewHtml || `<p style="color:#71717a">${t(`${PREFIX}.emptyBody`)}</p>`,
                  }}
                />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <EmailSystemAlert tone="info">{t(`${PREFIX}.selectHint`)}</EmailSystemAlert>
      )}
    </div>
  );
};

export default TemplateTab;
