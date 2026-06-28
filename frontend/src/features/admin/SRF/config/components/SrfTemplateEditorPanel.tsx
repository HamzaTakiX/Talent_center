/**
 * SrfTemplateEditorPanel
 *
 * Full-featured SRF template editor:
 *  - Template selector
 *  - Subject + body editor with cursor-based variable insertion
 *  - Live email / in-app preview with sample data substitution
 *  - Desktop / mobile toggle
 *  - Send Test Email (via global emailSystemApi)
 *  - Variable library (grouped chips, click-to-insert)
 *  - Unknown-variable validation
 */

import { type CSSProperties, FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  DollarSign,
  Mail,
  MessageSquare,
  Monitor,
  Save,
  Smartphone,
  Settings2,
  User,
} from 'lucide-react';
import type { SrfNotificationTemplate } from '../../../api/srfConfig';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import SrfPremiumEmpty from '../../components/student-detail/SrfPremiumEmpty';
import { easePremium } from '../../../dashboard/ui/animations';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  templates: SrfNotificationTemplate[];
  saving: boolean;
  onSave: (id: number, payload: Partial<SrfNotificationTemplate>) => Promise<void>;
}

// ─── Sample preview data ──────────────────────────────────────────────────────

const SAMPLE_DATA: Record<string, string> = {
  student_name: 'Hamza Taki',
  student_id: 'ETU-2024-0892',
  program: 'LME — Management & Économie',
  remaining_amount: '4 500 MAD',
  total_due: '18 000 MAD',
  payment_deadline: '20 juin 2026',
  exam_date: '25 juin 2026',
  academic_year: '2025/2026',
  support_email: 'support@esca.ma',
  university_name: 'ESCA École de Management',
};

// ─── Variable library ─────────────────────────────────────────────────────────

interface VarGroup {
  key: string;
  label: string;
  color: string;
  icon: typeof User;
  vars: { key: string; label: string }[];
}

const VARIABLE_GROUPS: VarGroup[] = [
  {
    key: 'student',
    label: 'Student',
    color: '#155dfc',
    icon: User,
    vars: [
      { key: 'student_name',  label: 'Student Name'  },
      { key: 'student_id',    label: 'Student ID'    },
      { key: 'program',       label: 'Program'       },
    ],
  },
  {
    key: 'financial',
    label: 'Financial',
    color: '#10b981',
    icon: DollarSign,
    vars: [
      { key: 'remaining_amount',  label: 'Remaining Amount'  },
      { key: 'total_due',         label: 'Total Due'         },
      { key: 'payment_deadline',  label: 'Payment Deadline'  },
    ],
  },
  {
    key: 'academic',
    label: 'Academic',
    color: '#f59e0b',
    icon: BookOpen,
    vars: [
      { key: 'exam_date',       label: 'Exam Date'        },
      { key: 'academic_year',   label: 'Academic Year'    },
    ],
  },
  {
    key: 'system',
    label: 'System',
    color: '#8b5cf6',
    icon: Settings2,
    vars: [
      { key: 'support_email',   label: 'Support Email'   },
      { key: 'university_name', label: 'University Name' },
    ],
  },
];

const ALL_KNOWN_VARS = new Set(VARIABLE_GROUPS.flatMap((g) => g.vars.map((v) => v.key)));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const substituteVars = (text: string, data: Record<string, string>): string =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key) => (key in data ? data[key] : `{{${key}}}`));

const findUnknownVars = (text: string): string[] => {
  const matches = [...text.matchAll(/\{\{(\w+)\}\}/g)];
  return [...new Set(matches.map((m) => m[1]).filter((v) => !ALL_KNOWN_VARS.has(v)))];
};

// ─── Severity / channel color maps ───────────────────────────────────────────

const SEV_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  LOW:      { bg: 'rgba(16,185,129,.14)',  text: '#10b981', label: 'Low'      },
  MEDIUM:   { bg: 'rgba(21,93,252,.12)',   text: '#155dfc', label: 'Medium'   },
  HIGH:     { bg: 'rgba(245,158,11,.14)',  text: '#d97706', label: 'High'     },
  CRITICAL: { bg: 'rgba(239,68,68,.14)',   text: '#ef4444', label: 'Critical' },
};
const CH_COLORS: Record<string, { bg: string; text: string; icon: typeof Mail }> = {
  EMAIL:  { bg: 'rgba(21,93,252,.10)',  text: '#155dfc', icon: Mail          },
  IN_APP: { bg: 'rgba(6,182,212,.12)',  text: '#0891b2', icon: MessageSquare },
};

// ─── Email preview chrome ─────────────────────────────────────────────────────

interface EmailChromeProps {
  subject: string;
  body: string;
  mobile: boolean;
  templateName: string;
}

const EmailChrome: FunctionComponent<EmailChromeProps> = ({ subject, body, mobile, templateName }) => (
  <div
    className="mx-auto overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white text-[#1a1a1a] shadow-[var(--admin-shadow-md)] transition-all duration-300"
    style={{ maxWidth: mobile ? 375 : 580, fontSize: 14 }}
  >
    {/* Brand header */}
    <div className="bg-[#155dfc] px-6 py-5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-200">
        ESCA École de Management
      </p>
      <p className="mt-1 text-base font-bold text-white">{templateName}</p>
    </div>

    {/* Email meta bar */}
    <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-[12px] text-gray-500">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700">To:</span>
        <span>{SAMPLE_DATA.student_name} &lt;student@esca.ma&gt;</span>
      </div>
      <div className="mt-0.5 flex items-start gap-2">
        <span className="font-semibold text-gray-700">Subject:</span>
        <span className="font-medium text-gray-800">{subject || '(no subject)'}</span>
      </div>
    </div>

    {/* Body */}
    <div className="px-6 py-6">
      <p className="mb-4 text-[14px] font-medium text-[#155dfc]">
        Bonjour {SAMPLE_DATA.student_name},
      </p>
      <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700">{body || '(no content)'}</div>

      {/* CTA button placeholder */}
      <div className="mt-6 text-center">
        <span className="inline-block rounded-xl bg-[#155dfc] px-6 py-2.5 text-sm font-semibold text-white">
          View my account →
        </span>
      </div>
    </div>

    {/* Footer */}
    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 text-center text-[11px] text-gray-400">
      <p className="font-semibold text-gray-500">ESCA École de Management</p>
      <p className="mt-0.5">{SAMPLE_DATA.support_email} · Student Financial Services</p>
      <p className="mt-2 text-[10px]">
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  </div>
);

// ─── In-App notification preview ─────────────────────────────────────────────

interface InAppPreviewProps {
  subject: string;
  body: string;
}

const InAppPreview: FunctionComponent<InAppPreviewProps> = ({ subject, body }) => (
  <div className="mx-auto max-w-sm">
    {/* Notification panel mock */}
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-[var(--admin-shadow-md)]">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[var(--admin-brand)]" />
          <span className="text-xs font-semibold text-[var(--admin-text)]">Notifications</span>
        </div>
        <span className="rounded-full bg-[var(--admin-brand)] px-2 py-0.5 text-[10px] font-bold text-white">1</span>
      </div>

      {/* Notification item */}
      <div className="flex items-start gap-3 border-l-4 border-[var(--admin-brand)] bg-[var(--admin-brand-muted)] px-4 py-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-brand)] text-white">
          <MessageSquare className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--admin-text)]">{subject || 'Notification'}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--admin-text-secondary)]">
            {body ? (body.length > 120 ? body.slice(0, 120) + '…' : body) : '(no content)'}
          </p>
          <p className="mt-2 text-[10px] text-[var(--admin-text-muted)]">Just now · Student Financial Services</p>
        </div>
      </div>

      {/* Placeholder items */}
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start gap-3 border-t border-[var(--admin-border)] px-4 py-3 opacity-30">
          <div className="admin-shimmer h-9 w-9 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <div className="admin-shimmer h-3 w-32 rounded-full" />
            <div className="admin-shimmer h-3 w-48 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const SrfTemplateEditorPanel: FunctionComponent<Props> = ({ templates, saving, onSave }) => {
  const { t } = useTranslation();

  const [selectedId, setSelectedId] = useState<number | null>(templates[0]?.id ?? null);
  const [subjectDraft, setSubjectDraft] = useState('');
  const [bodyDraft, setBodyDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'email' | 'inapp'>('email');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [varLibOpen, setVarLibOpen] = useState(true);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const selectedTemplate = templates.find((t) => t.id === selectedId) ?? null;

  // Sync drafts when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setSubjectDraft(selectedTemplate.subject_template);
      setBodyDraft(selectedTemplate.body_template);
      setSaved(false);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live preview content
  const renderedSubject = useMemo(() => substituteVars(subjectDraft, SAMPLE_DATA), [subjectDraft]);
  const renderedBody = useMemo(() => substituteVars(bodyDraft, SAMPLE_DATA), [bodyDraft]);

  // Validation
  const unknownVars = useMemo(
    () => findUnknownVars(subjectDraft + ' ' + bodyDraft),
    [subjectDraft, bodyDraft],
  );

  // Insert variable at cursor position
  const insertVariable = useCallback((varKey: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const token = `{{${varKey}}}`;
    const next = el.value.slice(0, start) + token + el.value.slice(end);
    setBodyDraft(next);
    requestAnimationFrame(() => {
      el.setSelectionRange(start + token.length, start + token.length);
      el.focus();
    });
  }, []);

  // Save
  const handleSave = async () => {
    if (!selectedTemplate) return;
    await onSave(selectedTemplate.id, {
      subject_template: subjectDraft,
      body_template: bodyDraft,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (templates.length === 0) {
    return (
      <SrfPremiumEmpty
        icon={Mail}
        title={t('admin.modules.srf.configCenter.templates.emptyTitle')}
        description={t('admin.modules.srf.configCenter.templates.emptyDesc')}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Template selector ─────────────────────────────── */}
      <div className="flex flex-wrap gap-2.5">
        {templates.map((tpl) => {
          const sv = SEV_COLORS[tpl.severity] ?? SEV_COLORS.MEDIUM;
          const isActive = selectedId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedId(tpl.id)}
              className="relative flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-start transition-all duration-200"
              style={
                {
                  borderColor: isActive ? `${sv.text}45` : 'var(--admin-border)',
                  background: isActive
                    ? `color-mix(in srgb, ${sv.text} 8%, var(--admin-bg-elevated))`
                    : 'var(--admin-bg-elevated)',
                  boxShadow: isActive ? `0 0 0 1px ${sv.text}25` : 'none',
                } as CSSProperties
              }
            >
              {isActive && (
                <span
                  className="absolute inset-y-0 start-0 w-[3px] rounded-e-full"
                  style={{ background: sv.text }}
                />
              )}
              <div className="ms-1 min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: isActive ? 'var(--admin-text)' : 'var(--admin-text-secondary)' }}
                >
                  {tpl.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{ background: sv.bg, color: sv.text }}
                  >
                    {sv.label}
                  </span>
                  <code className="font-mono text-[10px] text-[var(--admin-text-muted)]">{tpl.code}</code>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Editor + Preview ──────────────────────────────── */}
      {selectedTemplate && (
        <div className="grid gap-5 xl:grid-cols-2">
          {/* ─ Editor ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Channel + Severity info row */}
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const ch = CH_COLORS[selectedTemplate.channel] ?? CH_COLORS.EMAIL;
                const ChIcon = ch.icon;
                return (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: ch.bg, color: ch.text }}
                  >
                    <ChIcon className="h-3.5 w-3.5" />
                    {selectedTemplate.channel === 'IN_APP' ? 'In-App' : 'Email'}
                  </span>
                );
              })()}
              <code className="rounded-lg bg-[var(--admin-bg-subtle)] px-2 py-1 font-mono text-[11px] text-[var(--admin-text-muted)]">
                {selectedTemplate.code}
              </code>
            </div>

            {/* Subject */}
            <AdminFormField label={t('admin.modules.srf.configCenter.templates.subject', { defaultValue: 'Subject line' })}>
              <AdminFormInput
                value={subjectDraft}
                onChange={(e) => { setSubjectDraft(e.target.value); setSaved(false); }}
                placeholder="e.g. Your exam registration is at risk — {{exam_date}}"
              />
            </AdminFormField>

            {/* Body */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--admin-text)]">
                {t('admin.modules.srf.configCenter.templates.body', { defaultValue: 'Message body' })}
              </label>
              <textarea
                ref={bodyRef}
                value={bodyDraft}
                onChange={(e) => { setBodyDraft(e.target.value); setSaved(false); }}
                rows={9}
                className="admin-field admin-form-textarea w-full font-mono text-sm leading-relaxed"
                placeholder="Write your message here. Click variables below to insert them at the cursor."
                spellCheck={false}
              />
            </div>

            {/* Validation warnings */}
            <AnimatePresence>
              {unknownVars.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-xs font-semibold text-amber-600">
                      {t('admin.modules.srf.configCenter.templates.unknownVars', { defaultValue: 'Unknown variables detected:' })}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {unknownVars.map((v) => (
                        <code key={v} className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] text-amber-700">
                          {`{{${v}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save */}
            <div className="flex items-center border-t border-[var(--admin-border)]/50 pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                className="admin-btn-primary admin-form-btn inline-flex h-9 !w-auto items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white"
              >
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved
                  ? t('admin.modules.srf.configCenter.templates.saved', { defaultValue: 'Saved' })
                  : t('admin.modules.srf.configCenter.examPlanning.save')}
              </button>
            </div>
          </div>

          {/* ─ Preview ────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Email / In-App tabs */}
              <div className="flex overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]">
                {(['email', 'inapp'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={{
                      background: previewMode === mode ? 'var(--admin-bg-elevated)' : 'transparent',
                      color: previewMode === mode ? 'var(--admin-text)' : 'var(--admin-text-secondary)',
                      boxShadow: previewMode === mode ? 'var(--admin-shadow-sm)' : 'none',
                    }}
                  >
                    {mode === 'email' ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                    {mode === 'email' ? 'Email' : 'In-App'}
                  </button>
                ))}
              </div>

              {/* Desktop / Mobile toggle (email only) */}
              {previewMode === 'email' && (
                <div className="flex overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]">
                  {(['desktop', 'mobile'] as const).map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => setDeviceMode(dev)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{
                        background: deviceMode === dev ? 'var(--admin-bg-elevated)' : 'transparent',
                        color: deviceMode === dev ? 'var(--admin-text)' : 'var(--admin-text-secondary)',
                        boxShadow: deviceMode === dev ? 'var(--admin-shadow-sm)' : 'none',
                      }}
                    >
                      {dev === 'desktop' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                      {dev === 'desktop' ? 'Desktop' : 'Mobile'}
                    </button>
                  ))}
                </div>
              )}

              {/* Sample data badge */}
              <span className="rounded-full bg-[var(--admin-bg-subtle)] px-2.5 py-1 text-[10px] font-semibold text-[var(--admin-text-muted)]">
                Preview data
              </span>
            </div>

            {/* Preview area */}
            <div className="max-h-[560px] overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-[#f0f0f0] p-4">
              <AnimatePresence mode="wait">
                {previewMode === 'email' ? (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: easePremium }}
                  >
                    <EmailChrome
                      subject={renderedSubject}
                      body={renderedBody}
                      mobile={deviceMode === 'mobile'}
                      templateName={selectedTemplate.name}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="inapp"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: easePremium }}
                    className="flex items-start justify-center py-4"
                  >
                    <InAppPreview subject={renderedSubject} body={renderedBody} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ── Variable library ──────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">
        <button
          type="button"
          onClick={() => setVarLibOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--admin-text)]">
              {t('admin.modules.srf.configCenter.templates.variablesLib', { defaultValue: 'Variable Library' })}
            </span>
            <span className="rounded-full bg-[var(--admin-brand-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--admin-brand)]">
              Click to insert at cursor
            </span>
          </div>
          <ChevronDown
            className="h-4 w-4 text-[var(--admin-text-secondary)] transition-transform duration-200"
            style={{ transform: varLibOpen ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        <AnimatePresence initial={false}>
          {varLibOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easePremium }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 border-t border-[var(--admin-border)] p-5 sm:grid-cols-2 xl:grid-cols-4">
                {VARIABLE_GROUPS.map((group) => {
                  const GIcon = group.icon;
                  return (
                    <div key={group.key}>
                      <div className="mb-2.5 flex items-center gap-1.5">
                        <GIcon className="h-3.5 w-3.5" style={{ color: group.color }} />
                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: group.color }}>
                          {group.label}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.vars.map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => insertVariable(v.key)}
                            title={`Sample: ${SAMPLE_DATA[v.key] ?? v.key}`}
                            className="group flex flex-col rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-3 py-2 text-start transition-all duration-150 hover:border-[color-mix(in_srgb,var(--admin-brand)_30%,var(--admin-border))] hover:shadow-sm"
                          >
                            <code
                              className="font-mono text-[11px] font-semibold"
                              style={{ color: group.color }}
                            >
                              {`{{${v.key}}}`}
                            </code>
                            <span className="mt-0.5 text-[10px] text-[var(--admin-text-muted)]">
                              {SAMPLE_DATA[v.key] ?? v.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SrfTemplateEditorPanel;
