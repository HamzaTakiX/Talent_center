import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, Copy, Eye, FileCode2, Layers, Plus, RefreshCw, Send, Star } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import { AdminFormField, AdminFormInput, AdminFormTextarea } from '../../shared/forms/AdminFormPrimitives';
import { emailSystemApi } from '../api/emailSystemApi';
import type {
  EmailEventCatalogItem,
  EmailTemplateRow,
  GeneralSettings,
  TemplateVariable,
} from '../types/emailSystemTypes';
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
  const [events, setEvents] = useState<EmailEventCatalogItem[]>([]);
  const [eventFilter, setEventFilter] = useState('');
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [testEmail, setTestEmail] = useState('');


  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
  ];

  const eventOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.allEvents`, { defaultValue: 'All notification types' }) },
      ...events.map((ev) => ({ value: ev.event_code, label: `${ev.event_code} (${ev.category})` })),
    ],
    [events, t],
  );

  const filteredTemplates = useMemo(() => {
    if (!eventFilter) return templates;
    return templates.filter((tpl) => (tpl as EmailTemplateRow).event_code === eventFilter);
  }, [templates, eventFilter]);

  const templateOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.selectTemplate`) },
      ...filteredTemplates.map((tpl) => ({
        value: tpl.code,
        label: `${(tpl as EmailTemplateRow).name || tpl.code}${
          (tpl as EmailTemplateRow).is_selected ? ' ★' : ''
        }${(tpl as EmailTemplateRow).is_default ? ' (default)' : ''}`,
      })),
    ],
    [filteredTemplates, t],
  );

  const selectedMeta = templates.find((tpl) => tpl.code === selected) as EmailTemplateRow | undefined;

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const [items, catalog] = await Promise.all([
        emailSystemApi.listTemplates(),
        emailSystemApi.listEvents().catch(() => [] as EmailEventCatalogItem[]),
      ]);
      setTemplates(items);
      setEvents(catalog);
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
      if (detail.available_variables?.length) {
        setVariables(detail.available_variables);
      } else if (detail.event_code) {
        void emailSystemApi.getEventVariables(detail.event_code).then((res) => {
          setVariables(res.variables || []);
        }).catch(() => setVariables([]));
      } else {
        setVariables([]);
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
      const rendered = await emailSystemApi.safePreviewTemplate(selected, language);
      setPreviewHtml(rendered.body_html);
      setPreviewSubject(rendered.subject);
      setPreviewMode('rendered');
      setMsg({ tone: 'info', text: t(`${PREFIX}.renderedHint`) });
    } catch {
      try {
        const rendered = await emailSystemApi.previewTemplate(selected, language);
        setPreviewHtml(rendered.body_html);
        setPreviewSubject(rendered.subject);
        setPreviewMode('rendered');
        setMsg({ tone: 'info', text: t(`${PREFIX}.renderedHint`) });
      } catch {
        setMsg({ tone: 'error', text: t(`${PREFIX}.renderError`) });
      }
    }
  };

  const markSelected = async () => {
    if (!selected) return;
    try {
      await emailSystemApi.selectTemplate(selected);
      setMsg({ tone: 'success', text: t(`${PREFIX}.selectedOk`, { defaultValue: 'Template selected for this event.' }) });
      await loadTemplates();
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.selectedError`, { defaultValue: 'Could not select template.' }) });
    }
  };

  const markDefault = async () => {
    if (!selected) return;
    try {
      await emailSystemApi.setDefaultTemplate(selected);
      setMsg({ tone: 'success', text: t(`${PREFIX}.defaultOk`, { defaultValue: 'Template set as default for this event.' }) });
      await loadTemplates();
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.defaultError`, { defaultValue: 'Could not set default template.' }) });
    }
  };

  const sendTest = async () => {
    if (!selected || !testEmail) return;
    try {
      const res = await emailSystemApi.safeTestTemplate(selected, {
        recipient_email: testEmail,
        language,
      });
      setMsg({
        tone: res.success ? 'success' : 'error',
        text: res.message || (res.success ? 'Test email sent' : 'Test email failed'),
      });
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.testError`, { defaultValue: 'Test send failed.' }) });
    }
  };

  const copyVariable = async (key: string) => {
    const token = `{{ ${key} }}`;
    try {
      await navigator.clipboard.writeText(token);
      setMsg({ tone: 'info', text: t(`${PREFIX}.copied`, { defaultValue: `Copied ${token}` }) });
    } catch {
      setMsg({ tone: 'error', text: 'Copy failed' });
    }
  };


  const createNew = async () => {
    if (!eventFilter) {
      setMsg({ tone: 'error', text: t(`${PREFIX}.pickEventFirst`, { defaultValue: 'Select a notification type first.' }) });
      return;
    }
    const code = window.prompt(t(`${PREFIX}.newCodePrompt`, { defaultValue: 'New template code (slug)' }) || '');
    if (!code) return;
    const name = window.prompt(t(`${PREFIX}.newNamePrompt`, { defaultValue: 'Template name' }) || '', code) || code;
    try {
      const created = await emailSystemApi.createTemplate({
        code: code.trim(),
        name: name.trim(),
        event_code: eventFilter,
        category: events.find((e) => e.event_code === eventFilter)?.category || 'system',
        language,
        subject_template: subject || '{{ title }}',
        body_html_template: bodyHtml || '<p>{{ body }}</p>',
        set_as_selected: false,
        set_as_default: false,
      });
      setMsg({ tone: 'success', text: t(`${PREFIX}.createdOk`, { defaultValue: 'Template created.' }) });
      await loadTemplates();
      setSelected(created.code);
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.createdError`, { defaultValue: 'Could not create template.' }) });
    }
  };

  const duplicateCurrent = async () => {
    if (!selected) return;
    const newCode = window.prompt(
      t(`${PREFIX}.duplicateCodePrompt`, { defaultValue: 'Code for the duplicate' }) || '',
      `${selected}_copy`,
    );
    if (!newCode) return;
    try {
      const dup = await emailSystemApi.duplicateTemplate(selected, { new_code: newCode.trim() });
      setMsg({ tone: 'success', text: t(`${PREFIX}.duplicatedOk`, { defaultValue: 'Template duplicated.' }) });
      await loadTemplates();
      setSelected(dup.code);
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.duplicatedError`, { defaultValue: 'Could not duplicate template.' }) });
    }
  };

  const archiveCurrent = async () => {
    if (!selected) return;
    if (!window.confirm(t(`${PREFIX}.archiveConfirm`, { defaultValue: 'Archive this template?' }))) return;
    try {
      await emailSystemApi.archiveTemplate(selected);
      setMsg({ tone: 'success', text: t(`${PREFIX}.archivedOk`, { defaultValue: 'Template archived.' }) });
      setSelected('');
      await loadTemplates();
    } catch {
      setMsg({ tone: 'error', text: t(`${PREFIX}.archivedError`, { defaultValue: 'Could not archive template.' }) });
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSelect
            id="event-filter"
            label={t(`${PREFIX}.notificationType`, { defaultValue: 'Notification type' })}
            value={eventFilter}
            options={eventOptions}
            onChange={(v) => {
              setEventFilter(v);
              const first = templates.find((tpl) => !v || (tpl as EmailTemplateRow).event_code === v);
              if (first) setSelected(first.code);
            }}
            searchable
          />
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

              {variables.length ? (
                <div className="mb-3 rounded-lg border border-[var(--admin-border)] p-3">
                  <p className="mb-2 text-xs font-semibold text-[var(--admin-text)]">
                    {t(`${PREFIX}.availableVariables`, { defaultValue: 'Available variables' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable) => (
                      <button
                        key={variable.key}
                        type="button"
                        className="inline-flex items-center gap-1 rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                        title={variable.description}
                        onClick={() => void copyVariable(variable.key)}
                      >
                        <Copy className="h-3 w-3" aria-hidden />
                        {`{{ ${variable.key} }}`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <EmailSystemFormActions className="email-system-template-editor__actions border-t-0 pt-0">
                <AdminButton variant="primary" size="md" disabled={saving} onClick={() => void save()}>
                  {t(`${PREFIX}.save`)}
                </AdminButton>
                <AdminButton variant="outline" size="md" onClick={() => void renderWithVariables()}>
                  <Eye className="h-4 w-4" aria-hidden />
                  {t(`${PREFIX}.renderPreview`)}
                </AdminButton>
                <AdminButton variant="outline" size="md" onClick={() => void markSelected()}>
                  <Star className="h-4 w-4" aria-hidden />
                  {t(`${PREFIX}.setSelected`, { defaultValue: 'Set selected' })}
                </AdminButton>
                <AdminButton variant="outline" size="md" onClick={() => void markDefault()}>
                  {t(`${PREFIX}.setDefault`, { defaultValue: 'Set default' })}
                </AdminButton>
                <AdminButton variant="outline" size="md" onClick={() => void createNew()}>
                  <Plus className="h-4 w-4" aria-hidden />
                  {t(`${PREFIX}.create`, { defaultValue: 'Create' })}
                </AdminButton>
                <AdminButton variant="outline" size="md" onClick={() => void duplicateCurrent()}>
                  {t(`${PREFIX}.duplicate`, { defaultValue: 'Duplicate' })}
                </AdminButton>
                <AdminButton variant="outline" size="md" onClick={() => void archiveCurrent()}>
                  <Archive className="h-4 w-4" aria-hidden />
                  {t(`${PREFIX}.archive`, { defaultValue: 'Archive' })}
                </AdminButton>
              </EmailSystemFormActions>

              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <AdminFormInput
                  id="test-email"
                  type="email"
                  placeholder={t(`${PREFIX}.testEmailPlaceholder`, { defaultValue: 'test@example.com' })}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <AdminButton variant="outline" size="md" disabled={!testEmail} onClick={() => void sendTest()}>
                  <Send className="h-4 w-4" aria-hidden />
                  {t(`${PREFIX}.sendTest`, { defaultValue: 'Send test' })}
                </AdminButton>
              </div>

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
