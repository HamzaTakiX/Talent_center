import { FunctionComponent } from 'react';
import { Check, Moon, Palette, SlidersHorizontal, Sun, GraduationCap, ChevronRight, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import AccountSection from './AccountSection';
import AdminToggle from './AdminToggle';
import DashboardSectionOrderControls from './DashboardSectionOrderControls';
import LanguageSelect from './LanguageSelect';
import type { AdminPreferences } from '../types';
import type { DashboardSectionId } from '../hooks/useDashboardLayout';

type AdminTheme = 'light' | 'dark';

interface ProfileSettingsPanelProps {
  draft: AdminPreferences;
  onDraftChange: (next: AdminPreferences) => void;
  themeDraft: AdminTheme;
  onThemeDraftChange: (theme: AdminTheme) => void;
  dashboardOrder: DashboardSectionId[];
  onDashboardOrderChange: (order: DashboardSectionId[]) => void;
  variant?: 'admin' | 'student';
}

const ProfileSettingsPanel: FunctionComponent<ProfileSettingsPanelProps> = ({
  draft,
  onDraftChange,
  themeDraft,
  onThemeDraftChange,
  dashboardOrder,
  onDashboardOrderChange,
  variant = 'admin',
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin =
    user?.is_super_admin === true ||
    (user as { admin_level?: string })?.admin_level === 'SUPER';

  const setNotification = (key: keyof AdminPreferences['notifications'], value: boolean) => {
    onDraftChange({
      ...draft,
      notifications: { ...draft.notifications, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <AccountSection
        sectionKey="personal"
        sectionId="settings-language"
        title={t('admin.settings.language.title')}
        description={t('admin.settings.language.description')}
      >
        <LanguageSelect
          id="language"
          value={draft.language}
          onChange={(language) => onDraftChange({ ...draft, language })}
        />
      </AccountSection>

      <AccountSection
        sectionKey="activity"
        sectionId="settings-notifications"
        title={t('admin.settings.notifications.title')}
        description={t('admin.settings.notifications.description')}
      >
        <div className="flex flex-col gap-1">
          <AdminToggle
            id="notif-email"
            label={t('admin.settings.notifications.email')}
            description={t('admin.settings.notifications.emailDesc')}
            checked={draft.notifications.email}
            onChange={(v) => setNotification('email', v)}
          />
          <AdminToggle
            id="notif-push"
            label={t('admin.settings.notifications.push')}
            description={t('admin.settings.notifications.pushDesc')}
            checked={draft.notifications.push}
            onChange={(v) => setNotification('push', v)}
          />
          <AdminToggle
            id="notif-system"
            label={t('admin.settings.notifications.system')}
            description={t('admin.settings.notifications.systemDesc')}
            checked={draft.notifications.system}
            onChange={(v) => setNotification('system', v)}
          />
          <AdminToggle
            id="notif-marketing"
            label={t('admin.settings.notifications.marketing')}
            description={t('admin.settings.notifications.marketingDesc')}
            checked={draft.notifications.marketing}
            onChange={(v) => setNotification('marketing', v)}
          />
        </div>
      </AccountSection>

      <AccountSection
        sectionId="settings-appearance"
        title={t('admin.settings.appearance.title')}
        description={t('admin.settings.appearance.description')}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onThemeDraftChange('light')}
            aria-pressed={themeDraft === 'light'}
            className={`admin-theme-card group relative overflow-hidden rounded-xl p-4 text-left ${
              themeDraft === 'light' ? 'admin-theme-card--active' : ''
            }`}
          >
            {themeDraft === 'light' && (
              <span className="admin-theme-card-check absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              </span>
            )}
            <div className="admin-theme-card-preview admin-theme-card-preview--light mb-3 flex h-20 items-center justify-center rounded-lg">
              <Sun className="h-8 w-8 text-amber-500" strokeWidth={1.5} aria-hidden />
            </div>
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
              <Palette className="h-4 w-4 text-[var(--admin-brand)]" strokeWidth={1.75} />
              {t('admin.settings.appearance.light')}
            </span>
            <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">
              {t('admin.settings.appearance.lightDesc')}
            </p>
          </button>
          <button
            type="button"
            onClick={() => onThemeDraftChange('dark')}
            aria-pressed={themeDraft === 'dark'}
            className={`admin-theme-card group relative overflow-hidden rounded-xl p-4 text-left ${
              themeDraft === 'dark' ? 'admin-theme-card--active' : ''
            }`}
          >
            {themeDraft === 'dark' && (
              <span className="admin-theme-card-check absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              </span>
            )}
            <div className="admin-theme-card-preview admin-theme-card-preview--dark mb-3 flex h-20 items-center justify-center rounded-lg">
              <Moon className="h-8 w-8 text-blue-400" strokeWidth={1.5} aria-hidden />
            </div>
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
              <Moon className="h-4 w-4 text-[var(--admin-brand)]" strokeWidth={1.75} />
              {t('admin.settings.appearance.dark')}
            </span>
            <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">
              {t('admin.settings.appearance.darkDesc')}
            </p>
          </button>
        </div>
      </AccountSection>

      {isSuperAdmin ? (
        <AccountSection
          sectionId="settings-email-system"
          title={t('admin.settings.emailSystem.title')}
          description={t('admin.settings.emailSystem.description')}
        >
          <Link
            to="/admin/settings/email-system"
            className="group flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/50 p-4 no-underline transition hover:border-[var(--admin-brand)]/40 hover:bg-[var(--admin-brand-muted)]/30 hover:no-underline"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
                <Mail className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--admin-text)]">
                  {t('admin.modules.emailSystem.title')}
                </span>
                <span className="text-xs text-[var(--admin-text-secondary)]">
                  {t('admin.settings.emailSystem.openModule')}
                </span>
              </span>
            </span>
            <ChevronRight className="h-5 w-5 text-[var(--admin-text-secondary)] transition group-hover:translate-x-0.5 group-hover:text-[var(--admin-brand)]" />
          </Link>
        </AccountSection>
      ) : null}

      {isSuperAdmin ? (
        <AccountSection
          sectionId="settings-academic-structure"
          title={t('admin.settings.academicStructure.title')}
          description={t('admin.settings.academicStructure.description')}
        >
          <Link
            to="/admin/settings/academic-structure"
            className="group flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/50 p-4 no-underline transition hover:border-[var(--admin-brand)]/40 hover:bg-[var(--admin-brand-muted)]/30 hover:no-underline"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--admin-text)]">
                  {t('admin.modules.academicStructure.title')}
                </span>
                <span className="text-xs text-[var(--admin-text-secondary)]">
                  {t('admin.settings.academicStructure.openModule')}
                </span>
              </span>
            </span>
            <ChevronRight className="h-5 w-5 text-[var(--admin-text-secondary)] transition group-hover:translate-x-0.5 group-hover:text-[var(--admin-brand)]" />
          </Link>
        </AccountSection>
      ) : null}

      <AccountSection
        sectionId="settings-preferences"
        title={t('admin.settings.preferences.title')}
        description={t('admin.settings.preferences.description')}
      >
        <div className="flex flex-col gap-1">
          <AdminToggle
            id="pref-compact"
            label={t('admin.settings.preferences.compact')}
            description={t('admin.settings.preferences.compactDesc')}
            checked={draft.compactMode}
            onChange={(compactMode) => onDraftChange({ ...draft, compactMode })}
          />
          <AdminToggle
            id="pref-autosave"
            label={t('admin.settings.preferences.autoSave')}
            description={t('admin.settings.preferences.autoSaveDesc')}
            checked={draft.autoSave}
            onChange={(autoSave) => onDraftChange({ ...draft, autoSave })}
          />
          {variant === 'admin' ? (
            <AdminToggle
              id="pref-dashboard"
              label={t('admin.settings.preferences.dashboard')}
              description={t('admin.settings.preferences.dashboardDesc')}
              checked={draft.dashboardPersonalization}
              onChange={(dashboardPersonalization) =>
                onDraftChange({ ...draft, dashboardPersonalization })
              }
            />
          ) : null}
        </div>

        {variant === 'admin' ? (
          <DashboardSectionOrderControls
            order={dashboardOrder}
            canPersonalize={draft.dashboardPersonalization}
            onMove={(id, direction) => {
              const index = dashboardOrder.indexOf(id);
              if (index === -1) return;
              const next = [...dashboardOrder];
              const swapWith = direction === 'up' ? index - 1 : index + 1;
              if (swapWith < 0 || swapWith >= next.length) return;
              [next[index], next[swapWith]] = [next[swapWith], next[index]];
              onDashboardOrderChange(next);
            }}
          />
        ) : null}
      </AccountSection>

      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--admin-border)] py-4 text-xs text-[var(--admin-text-muted)]">
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
        <span>{t('admin.settings.localNote')}</span>
      </div>
    </div>
  );
};

export default ProfileSettingsPanel;