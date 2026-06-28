import { ChangeEvent, FormEvent, FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../dashboard/components/AdminLayout';
import StudentLayout from '../../../student/components/StudentLayout';
import { authApi } from '../../../auth/api';
import { useAuth } from '../../../auth/hooks/useAuth';
import {
  getAdminDisplayName,
  getAdminUserInitials,
  resolveAvatarUrl,
  splitFullName,
} from '../../dashboard/utils/adminUserDisplay';
import { useAdminRoleLabel } from '../../dashboard/hooks/useAdminRoleLabel';
import { staggerContainer } from '../../dashboard/ui/animations';
import AccountActivityGrid from '../components/AccountActivityGrid';
import AccountSection from '../components/AccountSection';
import AccountSectionNav from '../components/AccountSectionNav';
import PasswordField from '../components/PasswordField';
import ProfileAvatarUploader from '../components/ProfileAvatarUploader';
import ProfileSettingsPanel from '../components/ProfileSettingsPanel';
import AccountPageActionsBar from '../components/AccountPageActionsBar';
import { ProfilePageSkeleton } from '../components/AccountPageSkeleton';
import { useAccountHydration } from '../hooks/useAccountHydration';
import {
  defaultAdminPreferences,
  useAdminPreferences,
} from '../hooks/useAdminPreferences';
import { useAdminTheme } from '../../dashboard/context/AdminThemeContext';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import {
  DEFAULT_DASHBOARD_SECTIONS,
  type DashboardSectionId,
  useDashboardLayout,
} from '../hooks/useDashboardLayout';
import {
  areAdminPreferencesEqual,
  areDashboardOrdersEqual,
} from '../utils/accountDraftUtils';
import type { AdminPreferences } from '../types';
import { useApplyAdminSettings } from '../hooks/useApplyAdminSettings';
import { useScrollToSection } from '../hooks/useScrollToSection';
import StudentOnboardingInfoSection from '../../../student/account/components/StudentOnboardingInfoSection';
import StudentProfileMainWidgets from '../../../student/account/components/StudentProfileMainWidgets';
import { STUDENT_PROFILE_PAGE_ROOT } from '../../../student/account/constants/studentProfileLayout';
import type { ProfileFormState } from '../types';

const MIN_PASSWORD_LENGTH = 8;
const isFrontendOnlyAdmin = import.meta.env.VITE_FRONTEND_ONLY_ADMIN === 'true';

const emptyForm = (email: string, fullName = ''): ProfileFormState => ({
  fullName,
  email,
  currentPassword: '',
  password: '',
  confirmPassword: '',
});

const AdminProfilePage: FunctionComponent<{ variant?: 'admin' | 'student' }> = ({
  variant = 'admin',
}) => {
  const isStudentPortal = variant === 'student';
  const Layout = isStudentPortal ? StudentLayout : AdminLayout;
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const ready = useAccountHydration();
  const { activeSection, scrollToSection } = useScrollToSection(ready);
  const { preferences, hydrated: prefsHydrated } = useAdminPreferences();
  const { theme } = useAdminTheme();
  const applyAdminSettings = useApplyAdminSettings();
  const toast = useAdminToast();
  const { storedOrder } = useDashboardLayout();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const profileInitializedRef = useRef(false);

  const [settingsDraft, setSettingsDraft] = useState<AdminPreferences>(defaultAdminPreferences);
  const [savedPreferences, setSavedPreferences] = useState<AdminPreferences>(defaultAdminPreferences);
  const [themeDraft, setThemeDraft] = useState<'light' | 'dark'>('light');
  const [savedTheme, setSavedTheme] = useState<'light' | 'dark'>('light');
  const [dashboardOrderDraft, setDashboardOrderDraft] =
    useState<DashboardSectionId[]>(DEFAULT_DASHBOARD_SECTIONS);
  const [savedDashboardOrder, setSavedDashboardOrder] =
    useState<DashboardSectionId[]>(DEFAULT_DASHBOARD_SECTIONS);
  const roleLabel = useAdminRoleLabel(user?.role);
  const email = user?.email ?? 'admin@talentcenter.local';

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormState>(() => emptyForm(email));
  const [savedSnapshot, setSavedSnapshot] = useState<Pick<ProfileFormState, 'fullName' | 'email'>>({
    fullName: '',
    email,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const displayName = form.fullName || getAdminDisplayName(user);
  const initials = getAdminUserInitials(displayName, form.email);

  useEffect(() => {
    if (!user || profileInitializedRef.current) return;
    profileInitializedRef.current = true;
    const fullName = getAdminDisplayName(user);
    setForm(emptyForm(user.email, fullName));
    setSavedSnapshot({ fullName, email: user.email });
    setAvatarPreview(resolveAvatarUrl(user.profile?.avatar));
  }, [user]);

  const isProfileDirty =
    (!isStudentPortal && (
      form.fullName !== savedSnapshot.fullName ||
      form.email !== savedSnapshot.email
    )) ||
    form.password !== '' ||
    form.confirmPassword !== '' ||
    avatarFile !== null;

  const isSettingsDirty = !areAdminPreferencesEqual(settingsDraft, savedPreferences);
  const isThemeDirty = themeDraft !== savedTheme;
  const isOrderDirty =
    !isStudentPortal && !areDashboardOrdersEqual(dashboardOrderDraft, savedDashboardOrder);
  const isDirty = isProfileDirty || isSettingsDirty || isThemeDirty || isOrderDirty;

  const draftsInitializedRef = useRef(false);
  useEffect(() => {
    if (!prefsHydrated || draftsInitializedRef.current) return;
    draftsInitializedRef.current = true;
    setSettingsDraft(preferences);
    setSavedPreferences(preferences);
    setThemeDraft(theme);
    setSavedTheme(theme);
    setDashboardOrderDraft(storedOrder);
    setSavedDashboardOrder(storedOrder);
  }, [prefsHydrated, preferences, theme, storedOrder]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof ProfileFormState, string>> = {};
    if (!isStudentPortal) {
      if (!form.fullName.trim()) next.fullName = t('admin.account.personalInfo.fullNameRequired');
      if (!form.email.trim()) next.email = t('admin.account.personalInfo.emailRequired');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        next.email = t('admin.account.personalInfo.emailInvalid');
      }
    }
    if (form.password || form.confirmPassword || form.currentPassword) {
      if (!form.currentPassword) {
        next.currentPassword = t('admin.account.security.currentPasswordRequired');
      }
      if (form.password.length < MIN_PASSWORD_LENGTH) {
        next.password = t('admin.account.security.minLength', { count: MIN_PASSWORD_LENGTH });
      }
      if (form.password !== form.confirmPassword) {
        next.confirmPassword = t('admin.account.security.mismatch');
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const persistProfile = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!validate()) {
        toast.error(t('admin.account.fixErrors'));
        return false;
      }
      if (!options?.silent) setIsSaving(true);

      try {
        if (isFrontendOnlyAdmin) {
          await new Promise((r) => setTimeout(r, 500));
        } else {
          const payload = new FormData();
          if (!isStudentPortal) {
            const { first_name, last_name } = splitFullName(form.fullName);
            payload.append('email', form.email);
            payload.append('first_name', first_name);
            payload.append('last_name', last_name);
          }
          if (avatarFile) payload.append('avatar', avatarFile);

          let updatedUser = await authApi.updateMe(payload);

          if (form.password) {
            await authApi.changePassword({
              old_password: form.currentPassword,
              new_password: form.password,
            });
            updatedUser = await authApi.me();
          }

          updateUser(updatedUser);
          setAvatarPreview(resolveAvatarUrl(updatedUser.profile?.avatar));
          setAvatarFile(null);
        }

        setSavedSnapshot({ fullName: form.fullName, email: form.email });
        setForm((f) => ({
          ...f,
          currentPassword: '',
          password: '',
          confirmPassword: '',
        }));
        if (!options?.silent) {
          toast.success(t('admin.account.saved'));
        }
        return true;
      } catch (error: unknown) {
        const apiMessage =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t('admin.account.saveFailed');
        toast.error(apiMessage);
        return false;
      } finally {
        if (!options?.silent) setIsSaving(false);
      }
    },
    [avatarFile, form, t, toast, updateUser]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleSaveAll();
  };

  useEffect(() => {
    if (!savedPreferences.autoSave || !isProfileDirty || isSaving) return;
    const timer = window.setTimeout(() => {
      void persistProfile();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [savedPreferences.autoSave, isProfileDirty, persistProfile, isSaving]);

  const handleSaveAll = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isProfileDirty) {
        const profileOk = await persistProfile({ silent: true });
        if (!profileOk) return;
      }

      await applyAdminSettings({
        preferences: settingsDraft,
        theme: themeDraft,
        dashboardOrder: isStudentPortal ? storedOrder : dashboardOrderDraft,
      });

      setSavedPreferences(settingsDraft);
      setSavedTheme(themeDraft);
      if (!isStudentPortal) {
        setSavedDashboardOrder(dashboardOrderDraft);
      }

      toast.success(t('admin.account.saved'));
    } catch {
      toast.error(t('admin.account.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAll = () => {
    setForm({
      ...emptyForm(savedSnapshot.email, savedSnapshot.fullName),
    });
    setAvatarFile(null);
    setAvatarPreview(resolveAvatarUrl(user?.profile?.avatar));
    setErrors({});
    setSettingsDraft(savedPreferences);
    setThemeDraft(savedTheme);
    if (!isStudentPortal) {
      setDashboardOrderDraft(savedDashboardOrder);
    }
  };

  const handleResetAll = async () => {
    const fullName = getAdminDisplayName(user);
    const resetEmail = user?.email ?? email;
    setForm(emptyForm(resetEmail, fullName));
    setSavedSnapshot({ fullName, email: resetEmail });
    setAvatarFile(null);
    setAvatarPreview(resolveAvatarUrl(user?.profile?.avatar));
    setErrors({});

    await applyAdminSettings({
      preferences: defaultAdminPreferences,
      theme: 'light',
      dashboardOrder: isStudentPortal ? storedOrder : DEFAULT_DASHBOARD_SECTIONS,
    });

    setSettingsDraft(defaultAdminPreferences);
    setSavedPreferences(defaultAdminPreferences);
    setThemeDraft('light');
    setSavedTheme('light');
    if (!isStudentPortal) {
      setDashboardOrderDraft(DEFAULT_DASHBOARD_SECTIONS);
      setSavedDashboardOrder(DEFAULT_DASHBOARD_SECTIONS);
    }

    toast.success(t('admin.account.saved'));
  };

  if (!ready) {
    return (
      <Layout>
        <ProfilePageSkeleton />
      </Layout>
    );
  }

  const pageRootClass = isStudentPortal
    ? STUDENT_PROFILE_PAGE_ROOT
    : 'admin-page mx-auto max-w-5xl space-y-6 pb-8';

  return (
    <Layout>
      <motion.div
        id={isStudentPortal ? 'student-profile-root' : undefined}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className={pageRootClass}
      >
        <AccountSectionNav active={activeSection} onSelect={scrollToSection} />

        <section id="profile" className="scroll-mt-28 space-y-6">
        {/* Profile header card */}
        <motion.div
          variants={staggerContainer}
          className="admin-profile-header relative overflow-hidden rounded-admin-xl border border-[var(--admin-border)] shadow-admin-md"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'linear-gradient(135deg, var(--admin-brand-muted) 0%, transparent 45%, var(--admin-mesh-2) 100%)',
            }}
            aria-hidden
          />
          <motion.div className="relative flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-10">
            <ProfileAvatarUploader
              initials={initials}
              avatarPreview={avatarPreview}
              fileInputRef={fileInputRef}
              onFileChange={handleAvatarChange}
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">
                  {form.fullName}
                </h2>
                <span className="admin-role-badge inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                  <Shield className="h-3.5 w-3.5" strokeWidth={2} />
                  {roleLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{form.email}</p>
            </div>
          </motion.div>
        </motion.div>

        {isStudentPortal ? <StudentProfileMainWidgets /> : null}

        <AccountSection
          sectionKey="activity"
          title={t('admin.account.activity.title')}
          description={t('admin.account.activity.description')}
        >
          <AccountActivityGrid />
        </AccountSection>

        {isStudentPortal ? <StudentOnboardingInfoSection /> : null}

        <form id="admin-profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <AccountSection
              sectionKey="personal"
              sectionId="profile-personal-info"
              title={t('admin.account.personalInfo.title')}
              description={t('admin.account.personalInfo.description')}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-[var(--admin-text)]">
                    {t('admin.account.personalInfo.fullName')}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => !isStudentPortal && setForm((f) => ({ ...f, fullName: e.target.value }))}
                    readOnly={isStudentPortal}
                    className={`admin-input rounded-xl px-4 py-2.5 text-sm ${
                      errors.fullName ? 'border-red-500/50' : ''
                    } ${isStudentPortal ? 'cursor-default opacity-70 select-none' : ''}`}
                  />
                  {errors.fullName && (
                    <p className="text-xs font-medium text-red-500">{errors.fullName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="profileEmail" className="text-sm font-medium text-[var(--admin-text)]">
                    {t('admin.account.personalInfo.email')}
                  </label>
                  <input
                    id="profileEmail"
                    type="email"
                    value={form.email}
                    onChange={(e) => !isStudentPortal && setForm((f) => ({ ...f, email: e.target.value }))}
                    readOnly={isStudentPortal}
                    className={`admin-input rounded-xl px-4 py-2.5 text-sm ${
                      errors.email ? 'border-red-500/50' : ''
                    } ${isStudentPortal ? 'cursor-default opacity-70 select-none' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>
            </AccountSection>

            <AccountSection
              sectionKey="security"
              sectionId="profile-security"
              title={t('admin.account.security.title')}
              description={t('admin.account.security.description')}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <PasswordField
                    label={t('admin.account.security.currentPassword')}
                    value={form.currentPassword}
                    onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    error={errors.currentPassword}
                    placeholder="••••••••"
                  />
                </div>
                <div className="sm:col-span-1">
                  <PasswordField
                    label={t('admin.account.security.newPassword')}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    error={errors.password}
                    placeholder="••••••••"
                  />
                </div>
                <div className="sm:col-span-1">
                  <PasswordField
                    label={t('admin.account.security.confirmPassword')}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    error={errors.confirmPassword}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </AccountSection>

          </div>
        </form>
        </section>

        <section id="settings" className="scroll-mt-28 space-y-6 pt-4">
          <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-text)]">
                {t('admin.account.settingsHeader')}
              </h2>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {t('admin.account.settingsSubtitle')}
              </p>
            </div>
          </div>
          {prefsHydrated && (
            <ProfileSettingsPanel
              draft={settingsDraft}
              onDraftChange={setSettingsDraft}
              themeDraft={themeDraft}
              onThemeDraftChange={setThemeDraft}
              dashboardOrder={dashboardOrderDraft}
              onDashboardOrderChange={setDashboardOrderDraft}
              variant={variant}
            />
          )}
        </section>

        {prefsHydrated && (
          <AccountPageActionsBar
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={() => void handleSaveAll()}
            onCancel={handleCancelAll}
            onReset={handleResetAll}
          />
        )}
      </motion.div>
    </Layout>
  );
};

export default AdminProfilePage;
