import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  FlaskConical,
  Inbox,
  Layers,
  Mail,
  Server,
  Settings2,
  Shield,
  SlidersHorizontal,
  Tags,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminBackButton from '../../ui/AdminBackButton';
import AdminPageHero from '../../ui/AdminPageHero';
import AdvancedSettingsTab from '../components/AdvancedSettingsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import CategoriesTab from '../components/CategoriesTab';
import GeneralSettingsTab from '../components/GeneralSettingsTab';
import ProviderTab from '../components/ProviderTab';
import QueueTab from '../components/QueueTab';
import SenderIdentitiesTab from '../components/SenderIdentitiesTab';
import TemplatesTab from '../components/TemplatesTab';
import TestCenterTab from '../components/TestCenterTab';
import { useEmailSystemWorkspace } from '../hooks/useEmailSystemWorkspace';
import type { EmailSystemTab } from '../types/emailSystemTypes';
import { EMAIL_SYSTEM_PANEL, EmailSystemAlert } from '../ui/EmailSystemPrimitives';
import '../styles/email-system.css';

const PREFIX = 'admin.modules.emailSystem';

const TABS: { id: EmailSystemTab; icon: typeof Mail; labelKey: string }[] = [
  { id: 'general', icon: Settings2, labelKey: 'tabs.general' },
  { id: 'provider', icon: Server, labelKey: 'tabs.provider' },
  { id: 'senders', icon: Users, labelKey: 'tabs.senders' },
  { id: 'categories', icon: Tags, labelKey: 'tabs.categories' },
  { id: 'templates', icon: Layers, labelKey: 'tabs.templates' },
  { id: 'analytics', icon: BarChart3, labelKey: 'tabs.analytics' },
  { id: 'queue', icon: Inbox, labelKey: 'tabs.queue' },
  { id: 'test', icon: FlaskConical, labelKey: 'tabs.test' },
  { id: 'advanced', icon: SlidersHorizontal, labelKey: 'tabs.advanced' },
];

const EmailSystemPageSkeleton: FunctionComponent = () => (
  <div className="space-y-6" aria-busy>
    <div className={`${EMAIL_SYSTEM_PANEL} h-28 animate-pulse`} />
    <div className={`${EMAIL_SYSTEM_PANEL} h-12 animate-pulse`} />
    <div className={`${EMAIL_SYSTEM_PANEL} h-80 animate-pulse`} />
  </div>
);

const EmailSystemPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin =
    user?.is_super_admin === true || (user as { admin_level?: string })?.admin_level === 'SUPER';

  const ws = useEmailSystemWorkspace();
  const [activeTab, setActiveTab] = useState<EmailSystemTab>('general');
  const [generalDraft, setGeneralDraft] = useState(ws.general);
  const [providerDraft, setProviderDraft] = useState(ws.provider);
  const [advancedDraft, setAdvancedDraft] = useState(ws.advanced);

  useEffect(() => {
    if (!isSuperAdmin) navigate('/admin/profile#settings', { replace: true });
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    if (ws.general) setGeneralDraft(ws.general);
  }, [ws.general]);

  useEffect(() => {
    if (ws.provider) setProviderDraft(ws.provider);
  }, [ws.provider]);

  useEffect(() => {
    if (ws.advanced) setAdvancedDraft(ws.advanced);
  }, [ws.advanced]);

  if (!isSuperAdmin) return null;

  return (
    <AdminModulePageShell width="wide">
      <AdminBackButton
        label={t(`${PREFIX}.back`)}
        onClick={() => navigate('/admin/profile#settings')}
        className="mb-4"
      />

      <AdminPageHero
        className="mb-6"
        title={t(`${PREFIX}.title`)}
        subtitle={t(`${PREFIX}.subtitle`)}
        badge={
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--admin-brand)]/25 bg-[var(--admin-brand-muted)] px-3 py-1 text-xs font-semibold text-[var(--admin-brand)]">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            {t(`${PREFIX}.superAdminBadge`)}
          </span>
        }
      />

      {ws.loading || !generalDraft || !providerDraft || !advancedDraft ? (
        <EmailSystemPageSkeleton />
      ) : (
        <>
          {ws.error ? (
            <EmailSystemAlert tone="error" className="mb-4">
              {t(`${PREFIX}.errors.${ws.error}`)}
            </EmailSystemAlert>
          ) : null}

          <nav
            className="admin-section-nav email-system-tabs mb-6 flex flex-wrap gap-1 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-1 shadow-sm"
            aria-label={t(`${PREFIX}.tabsAria`, { defaultValue: 'Email system sections' })}
          >
            {TABS.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`admin-section-tab flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === id ? 'admin-section-tab--active' : ''
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">{t(`${PREFIX}.${labelKey}`)}</span>
              </button>
            ))}
          </nav>

          <div className="email-system-tab-stack">
            {activeTab === 'general' ? (
              <GeneralSettingsTab
                draft={generalDraft}
                saving={ws.saving}
                onChange={setGeneralDraft}
                onSave={() => void ws.saveGeneral(generalDraft)}
              />
            ) : null}

            {activeTab === 'provider' ? (
              <ProviderTab
                draft={providerDraft}
                saving={ws.saving}
                onChange={setProviderDraft}
                onSave={() => void ws.saveProvider(providerDraft)}
                onValidate={async () => {
                  const res = await ws.validateProvider();
                  if (ws.provider) setProviderDraft(ws.provider);
                  return { success: res.success, message: res.message };
                }}
                onConnect={async () => {
                  await ws.connectProvider();
                  if (ws.provider) setProviderDraft(ws.provider);
                }}
                onDisconnect={async () => {
                  await ws.disconnectProvider();
                  if (ws.provider) setProviderDraft(ws.provider);
                }}
                onTest={async () => {
                  const res = await ws.testProvider();
                  return { success: res.success, message: res.message };
                }}
              />
            ) : null}

            {activeTab === 'senders' ? (
              <SenderIdentitiesTab
                items={ws.senders}
                saving={ws.saving}
                onCreate={ws.createSender}
                onUpdate={ws.updateSender}
                onDelete={ws.deleteSender}
                onSetDefault={ws.setDefaultSender}
                onVerify={ws.verifySender}
              />
            ) : null}

            {activeTab === 'categories' ? (
              <CategoriesTab items={ws.categories} saving={ws.saving} onSave={(items) => ws.saveCategories(items)} />
            ) : null}

            {activeTab === 'templates' ? (
              <TemplatesTab
                templates={ws.templates}
                saving={ws.saving}
                loadTemplate={ws.loadTemplate}
                updateTemplate={ws.updateTemplate}
                previewTemplate={ws.previewTemplate}
                testTemplate={async (code, payload) => {
                  const res = await ws.testTemplate(code, payload);
                  return { success: res.success, message: res.message };
                }}
              />
            ) : null}

            {activeTab === 'analytics' ? <AnalyticsTab load={ws.loadAnalytics} /> : null}

            {activeTab === 'queue' ? (
              <QueueTab load={ws.loadQueue} onRetry={ws.retryQueue} onCancel={ws.cancelQueue} />
            ) : null}

            {activeTab === 'test' ? (
              <TestCenterTab
                templates={ws.templates}
                onSend={async (payload) => {
                  const res = await ws.sendTest(payload);
                  return { success: res.success, message: res.message, data: res.data as Record<string, unknown> };
                }}
              />
            ) : null}

            {activeTab === 'advanced' ? (
              <AdvancedSettingsTab
                draft={advancedDraft}
                saving={ws.saving}
                onChange={setAdvancedDraft}
                onSave={() => void ws.saveAdvanced(advancedDraft)}
              />
            ) : null}
          </div>
        </>
      )}
    </AdminModulePageShell>
  );
};

export default EmailSystemPage;
