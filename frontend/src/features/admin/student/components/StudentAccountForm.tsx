import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  ImageIcon,
  ImagePlus,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  RefreshCw,
  Trash2,
  User,
  UserPlus,
  GraduationCap,
  XCircle,
} from 'lucide-react';
import AdminBackButton from '../../ui/AdminBackButton';
import { adminStudentsApi } from '../../api/students';
import { adminMicrosoftAccessApi, type MicrosoftAccessStatus } from '../../api/microsoftAccess';
import type { AcademicHierarchyValue, AdminStudentDetail, AdminStudentRow } from '../../api/types';
import ProfileAvatarUploader from '../../account/components/ProfileAvatarUploader';
import AdminSelect from '../../account/components/AdminSelect';
import { getAdminUserInitials, resolveAvatarUrl } from '../../dashboard/utils/adminUserDisplay';
import AdminAcademicHierarchyFields, {
  emptyAcademicHierarchy,
  type AcademicHierarchyPinnedSelections,
} from '../../shared/academic/AdminAcademicHierarchyFields';
import {
  AdminFormField,
  AdminFormInput,
} from '../../shared/forms/AdminFormPrimitives';
import AdminFormPanelHeader from '../../shared/forms/AdminFormPanelHeader';
import AdminFormSection from '../../shared/forms/AdminFormSection';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import AdminFormAlert from '../../shared/forms/AdminFormAlert';
import {
  adminFormActionsFooterClass,
  adminFormActionsInlineClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormBodyScrollClass,
  adminFormPanelFlexClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';

const FORM_PREFIX = 'admin.forms.createStudent';

function nestedEntityLabel(
  value: number | { id: number; name?: string; code?: string } | null | undefined,
  fallback = '',
): string {
  if (value == null) return fallback;
  if (typeof value === 'object') return value.name || value.code || fallback;
  return fallback;
}

function resolveAcademicYearId(student: AdminStudentDetail): string {
  if (student.academic_year_id) return String(student.academic_year_id);
  const yearRef = student.student_profile?.academic_year_ref;
  if (typeof yearRef === 'number') return String(yearRef);
  return '';
}

export type StudentAccountFormMode = 'create' | 'edit';

interface StudentAccountFormProps {
  mode: StudentAccountFormMode;
  student?: AdminStudentRow | AdminStudentDetail | null;
  onCancel: () => void;
  onSaved: () => void;
  /** Masquer l’en-tête du panneau si un hero page est affiché au-dessus. */
  hidePanelHeader?: boolean;
  /** Pied d’actions fixe en bas du viewport (désactivé sur la page édition). */
  stickyActions?: boolean;
  /** Bouton retour dans l’en-tête du panneau formulaire. */
  backLabel?: string;
}

const StudentAccountForm: FunctionComponent<StudentAccountFormProps> = ({
  mode,
  student,
  onCancel,
  onSaved,
  hidePanelHeader = false,
  stickyActions = true,
  backLabel,
}) => {
  const { t, i18n } = useTranslation();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateLocale = i18n.language.startsWith('ar') ? 'ar-MA' : i18n.language.startsWith('en') ? 'en-GB' : 'fr-FR';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [academic, setAcademic] = useState<AcademicHierarchyValue>(emptyAcademicHierarchy());

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [grantAccess, setGrantAccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState('PENDING');
  const [platformAccess, setPlatformAccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [microsoftAccess, setMicrosoftAccess] = useState<MicrosoftAccessStatus | null>(null);
  const [microsoftBusy, setMicrosoftBusy] = useState(false);

  useEffect(() => {
    setError('');
    setSuccess('');
    setRevealedPassword(null);
    setAvatarFile(null);
    setRemoveAvatar(false);

    if (mode === 'create') {
      setEmail('');
      setFirstName('');
      setLastName('');
      setStudentNumber('');
      setAcademic(emptyAcademicHierarchy());
      setSsoEnabled(true);
      setGrantAccess(false);
      setAccountStatus('PENDING');
      setPlatformAccess(false);
      setAvatarPreview(null);
      return;
    }

    if (student) {
      const detail = student as AdminStudentDetail;
      setEmail(student.email);
      setFirstName(student.first_name || '');
      setLastName(student.last_name || '');
      setStudentNumber(student.student_number || '');
      setAcademic({
        filiereId: student.filiere_id ? String(student.filiere_id) : '',
        levelId: student.academic_level_id ? String(student.academic_level_id) : '',
        sectorId: student.academic_sector_id ? String(student.academic_sector_id) : '',
        internshipTypeId: student.internship_type_id ? String(student.internship_type_id) : '',
        academicYearId: resolveAcademicYearId(detail),
        academicYearCode: student.academic_year || '',
        classGroupId: student.class_group_id ? String(student.class_group_id) : '',
      });
      setSsoEnabled(student.sso_enabled);
      setPlatformAccess(student.platform_access_granted);
      setAccountStatus(student.account_status);
      setAvatarPreview(resolveAvatarUrl(detail.profile?.avatar));
      setMicrosoftAccess(null);
      void adminMicrosoftAccessApi
        .get(student.id)
        .then(setMicrosoftAccess)
        .catch(() => setMicrosoftAccess(null));
    }
  }, [mode, student?.id]);

  const refreshMicrosoftAccess = async () => {
    if (!student) return;
    try {
      setMicrosoftBusy(true);
      setMicrosoftAccess(await adminMicrosoftAccessApi.get(student.id));
    } catch {
      // status remains previous / null
    } finally {
      setMicrosoftBusy(false);
    }
  };

  const grantMicrosoftAccess = async () => {
    if (!student) return;
    try {
      setMicrosoftBusy(true);
      setError('');
      const status = await adminMicrosoftAccessApi.grant(student.id);
      setMicrosoftAccess(status);
      setPlatformAccess(true);
      setSsoEnabled(true);
      setSuccess(
        t(`${FORM_PREFIX}.microsoftAccess.granted`, {
          defaultValue: 'Microsoft Enterprise access granted.',
        }),
      );
      onSaved?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to grant Microsoft access');
    } finally {
      setMicrosoftBusy(false);
    }
  };

  const revokeMicrosoftAccess = async () => {
    if (!student) return;
    try {
      setMicrosoftBusy(true);
      setError('');
      const status = await adminMicrosoftAccessApi.revoke(student.id);
      setMicrosoftAccess(status);
      setPlatformAccess(false);
      setSuccess(
        t(`${FORM_PREFIX}.microsoftAccess.revoked`, {
          defaultValue: 'Microsoft Enterprise access revoked.',
        }),
      );
      onSaved?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revoke Microsoft access');
    } finally {
      setMicrosoftBusy(false);
    }
  };
  const pinnedAcademicSelections = useMemo((): AcademicHierarchyPinnedSelections | undefined => {
    if (mode !== 'edit' || !student) return undefined;
    const sp = (student as AdminStudentDetail).student_profile;
    const selections: AcademicHierarchyPinnedSelections = {};
    if (student.filiere_id) {
      selections.filiere = {
        id: student.filiere_id,
        label: nestedEntityLabel(sp?.filiere, student.program_major || student.filiere_code || ''),
      };
    }
    if (student.academic_level_id) {
      selections.level = {
        id: student.academic_level_id,
        label: nestedEntityLabel(sp?.academic_level, ''),
      };
    }
    if (student.academic_sector_id) {
      selections.sector = {
        id: student.academic_sector_id,
        label: nestedEntityLabel(sp?.academic_sector, ''),
      };
    }
    if (student.academic_year_id) {
      selections.academicYear = {
        id: student.academic_year_id,
        label: student.academic_year || '',
      };
    }
    if (student.class_group_id) {
      selections.classGroup = {
        id: student.class_group_id,
        label: nestedEntityLabel(sp?.class_group, student.current_class || ''),
      };
    }
    return selections;
  }, [mode, student]);

  const academicPayload = () => ({
    filiere_id: academic.filiereId ? Number(academic.filiereId) : null,
    academic_level_id: academic.levelId ? Number(academic.levelId) : null,
    academic_sector_id: academic.sectorId ? Number(academic.sectorId) : null,
    class_group_id: academic.classGroupId ? Number(academic.classGroupId) : null,
    academic_year: academic.academicYearCode || undefined,
    academic_year_id: academic.academicYearId ? Number(academic.academicYearId) : null,
  });

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await adminStudentsApi.create({
        email,
        first_name: firstName,
        last_name: lastName,
        student_number: studentNumber,
        ...academicPayload(),
        sso_enabled: ssoEnabled,
        grant_access: grantAccess,
      });
      setSuccess(t(`${FORM_PREFIX}.messages.createSuccess`));
      onSaved();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || t(`${FORM_PREFIX}.messages.createError`));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!student) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (avatarFile || removeAvatar) {
        const profilePayload = new FormData();
        if (avatarFile) profilePayload.append('avatar', avatarFile);
        if (removeAvatar) profilePayload.append('remove_avatar', 'true');
        const updated = await adminStudentsApi.updateProfile(student.id, profilePayload);
        setAvatarPreview(resolveAvatarUrl(updated.profile?.avatar));
        setAvatarFile(null);
        setRemoveAvatar(false);
      }
      await adminStudentsApi.updateAccess(student.id, {
        account_status: accountStatus as AdminStudentRow['account_status'],
        platform_access_granted: platformAccess,
        sso_enabled: ssoEnabled,
      });
      await adminStudentsApi.updateAssignment(student.id, academicPayload());
      setSuccess(t(`${FORM_PREFIX}.messages.updateSuccess`));
      onSaved();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || t(`${FORM_PREFIX}.messages.updateError`));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setRemoveAvatar(false);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setRemoveAvatar(true);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAvatarPicker = () => fileInputRef.current?.click();

  const handleRegenerate = async () => {
    if (!student) return;
    setLoading(true);
    setError('');
    try {
      const pwd = await adminStudentsApi.regeneratePassword(student.id);
      setRevealedPassword(pwd);
      setSuccess(t(`${FORM_PREFIX}.messages.regenerateSuccess`));
    } catch {
      setError(t(`${FORM_PREFIX}.messages.regenerateError`));
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    if (!student) return;
    setLoading(true);
    setError('');
    try {
      const pwd = await adminStudentsApi.revealCredential(student.id);
      setRevealedPassword(pwd);
    } catch {
      setError(t(`${FORM_PREFIX}.messages.revealError`));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!revealedPassword) return;
    try {
      await navigator.clipboard.writeText(revealedPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {
      // clipboard not available — fail silently
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      void handleCreate();
    } else {
      void handleSaveEdit();
    }
  };

  const statusOptions = useMemo(
    () =>
      (['PENDING', 'AUTHORIZED', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'ARCHIVED'] as const).map(
        (value) => ({
          value,
          label: t(`${FORM_PREFIX}.accountStatus.${value}`),
        }),
      ),
    [t],
  );

  const title = mode === 'create' ? t(`${FORM_PREFIX}.title`) : t(`${FORM_PREFIX}.editTitle`);
  const subtitle =
    mode === 'create' ? t(`${FORM_PREFIX}.subtitle`) : t(`${FORM_PREFIX}.editSubtitle`);
  const displayName =
    student?.full_name?.trim() || `${firstName} ${lastName}`.trim() || email || '—';
  const initials = getAdminUserInitials(displayName, email);
  const isCreateMode = mode === 'create';
  const actionsClass = isCreateMode
    ? adminFormActionsInlineClass
    : stickyActions
      ? adminFormActionsFooterClass
      : adminFormActionsInlineClass;
  const formClassName = isCreateMode
    ? `${adminFormPanelFlexClass} admin-student-form`
    : mode === 'edit'
      ? `${adminFormPanelFlexClass} admin-student-edit-form`
      : adminFormPanelFlexClass;

  return (
    <form className={formClassName} onSubmit={handleSubmit} id={formId} noValidate>
      {!hidePanelHeader && (
        <AdminFormPanelHeader
          title={title}
          subtitle={mode === 'edit' ? subtitle : undefined}
          icon={mode === 'edit' ? GraduationCap : UserPlus}
          leading={
            backLabel ? (
              <AdminBackButton onClick={onCancel} label={backLabel} className="!w-auto" />
            ) : null
          }
        />
      )}

      {isCreateMode && error ? (
        <div className="px-4 sm:px-6 pt-4">
          <AdminFormAlert variant="error">{error}</AdminFormAlert>
        </div>
      ) : null}

      {isCreateMode && success ? (
        <div className="px-4 sm:px-6 pt-4">
          <AdminFormAlert variant="success">{success}</AdminFormAlert>
        </div>
      ) : null}

      <div className={adminFormBodyScrollClass}>
        {!isCreateMode && error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {!isCreateMode && success ? <AdminFormAlert variant="success">{success}</AdminFormAlert> : null}

        <div className={`${adminFormSectionsStackClass}${isCreateMode ? ' admin-student-form__sections' : ''}`}>
        {mode === 'edit' && student ? (
          <AdminFormSection
            sectionKey="photo"
            className="admin-student-edit-photo-section"
            title={t(`${FORM_PREFIX}.sections.photo`)}
            description={t(`${FORM_PREFIX}.sections.photoHint`)}
          >
            <div className="admin-student-edit-photo-panel">
              <div className="admin-student-edit-photo">
                <div className="admin-student-edit-photo__visual">
                  <ProfileAvatarUploader
                    initials={initials}
                    avatarPreview={avatarPreview}
                    fileInputRef={fileInputRef}
                    onFileChange={handleAvatarChange}
                    showChangeLink={false}
                  />
                </div>
                <div className="admin-student-edit-photo__content">
                  <div className="admin-student-edit-photo__meta">
                    <p className="admin-student-edit-photo__name">{displayName}</p>
                    <p className="admin-student-edit-photo__email">{email}</p>
                    <p className="admin-student-edit-photo__formats">
                      <ImageIcon className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                      JPEG, PNG, WebP
                    </p>
                  </div>
                  <div className="admin-student-edit-photo__actions">
                    <button
                      type="button"
                      className="admin-student-edit-photo__change-btn"
                      onClick={openAvatarPicker}
                      disabled={loading}
                    >
                      <ImagePlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                      {t('admin.account.changePhoto')}
                    </button>
                    {avatarPreview ? (
                      <button
                        type="button"
                        className="admin-student-edit-photo__remove-btn"
                        onClick={handleRemovePhoto}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                        {t(`${FORM_PREFIX}.actions.removePhoto`)}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </AdminFormSection>
        ) : null}

        <AdminFormSection
          sectionKey="personal"
          title={t(`${FORM_PREFIX}.sections.personal`)}
          description={t(`${FORM_PREFIX}.sections.personalHint`)}
        >
          <div className={adminFormGridClass}>
            <AdminFormField
              fieldKey="email"
              label={t(`${FORM_PREFIX}.fields.email`)}
              htmlFor={`${formId}-email`}
              icon={Mail}
              required
              hint={isCreateMode ? t(`${FORM_PREFIX}.fields.emailHint`) : undefined}
            >
              <AdminFormInput
                fieldKey="email"
                id={`${formId}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={mode === 'edit'}
                placeholder={t(`${FORM_PREFIX}.placeholders.email`)}
                required
              />
            </AdminFormField>

            <AdminFormField
              fieldKey="firstName"
              label={t(`${FORM_PREFIX}.fields.firstName`)}
              htmlFor={`${formId}-first`}
              icon={User}
            >
              <AdminFormInput
                fieldKey="firstName"
                id={`${formId}-first`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t(`${FORM_PREFIX}.placeholders.firstName`)}
                disabled={mode === 'edit'}
              />
            </AdminFormField>

            <AdminFormField
              fieldKey="lastName"
              label={t(`${FORM_PREFIX}.fields.lastName`)}
              htmlFor={`${formId}-last`}
              icon={User}
            >
              <AdminFormInput
                fieldKey="lastName"
                id={`${formId}-last`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t(`${FORM_PREFIX}.placeholders.lastName`)}
                disabled={mode === 'edit'}
              />
            </AdminFormField>

            <AdminFormField
              fieldKey="studentNumber"
              label={t(`${FORM_PREFIX}.fields.studentNumber`)}
              htmlFor={`${formId}-number`}
            >
              <AdminFormInput
                fieldKey="studentNumber"
                id={`${formId}-number`}
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder={t(`${FORM_PREFIX}.placeholders.studentNumber`)}
                disabled={mode === 'edit'}
              />
            </AdminFormField>
          </div>
        </AdminFormSection>

        <AdminFormSection
          sectionKey="academic"
          title={t(`${FORM_PREFIX}.sections.academic`)}
          description={t(`${FORM_PREFIX}.sections.academicHint`)}
        >
          <AdminAcademicHierarchyFields
            idPrefix={`${formId}-academic`}
            value={academic}
            onChange={setAcademic}
            autoResolveInternship
            autoSelectCurrentYear={mode === 'create'}
            pinnedSelections={pinnedAcademicSelections}
          />
        </AdminFormSection>

        <AdminFormSection
          sectionKey="access"
          title={t(`${FORM_PREFIX}.sections.access`)}
          description={t(`${FORM_PREFIX}.sections.accessHint`)}
        >
          {isCreateMode ? (
            <div className="admin-student-form__switches flex flex-col gap-3">
              <AdminFormSwitch
                id={`${formId}-sso`}
                label={
                  <span>
                    {t(`${FORM_PREFIX}.fields.ssoAccess`)}
                    <span className="mt-0.5 block text-xs font-normal text-[var(--admin-text-secondary)]">
                      {t(`${FORM_PREFIX}.fields.ssoAccessHint`)}
                    </span>
                  </span>
                }
                checked={ssoEnabled}
                onChange={setSsoEnabled}
              />
              <AdminFormSwitch
                id={`${formId}-grant-access`}
                label={
                  <span>
                    {t(`${FORM_PREFIX}.fields.grantPlatformAccess`)}
                    <span className="mt-0.5 block text-xs font-normal text-[var(--admin-text-secondary)]">
                      {t(`${FORM_PREFIX}.fields.grantPlatformAccessHint`)}
                    </span>
                  </span>
                }
                checked={grantAccess}
                onChange={setGrantAccess}
              />
            </div>
          ) : (
            <>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <AdminFormSwitch
              id={`${formId}-sso`}
              label={t(`${FORM_PREFIX}.fields.ssoAccess`)}
              checked={ssoEnabled}
              onChange={setSsoEnabled}
            />
            <AdminFormSwitch
              id={`${formId}-platform-access`}
              label={t(`${FORM_PREFIX}.fields.platformAccess`)}
              checked={platformAccess}
              onChange={setPlatformAccess}
            />
          </div>

          {mode === 'edit' && student && (
            <div className="mt-4 rounded-xl border border-[var(--admin-border,rgba(0,0,0,0.08))] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    {t(`${FORM_PREFIX}.microsoftAccess.title`, {
                      defaultValue: 'Microsoft Enterprise access',
                    })}
                  </p>
                  <p className="mt-1 text-xs text-[var(--admin-muted,#64748b)]">
                    {microsoftAccess?.configured === false
                      ? t(`${FORM_PREFIX}.microsoftAccess.notConfigured`, {
                          defaultValue: 'Microsoft Graph is not configured on the server.',
                        })
                      : microsoftAccess?.microsoft_access
                        ? t(`${FORM_PREFIX}.microsoftAccess.active`, {
                            defaultValue: 'Assigned to the Talent Center Enterprise Application.',
                          })
                        : t(`${FORM_PREFIX}.microsoftAccess.inactive`, {
                            defaultValue: 'Not assigned to the Talent Center Enterprise Application.',
                          })}
                  </p>
                </div>
                <button
                  type="button"
                  className={adminFormBtnSecondaryClass}
                  disabled={microsoftBusy}
                  onClick={() => void refreshMicrosoftAccess()}
                >
                  {microsoftBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span>{t('admin.common.refresh', { defaultValue: 'Refresh' })}</span>
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={adminFormBtnPrimaryClass}
                  disabled={microsoftBusy || microsoftAccess?.microsoft_access === true}
                  onClick={() => void grantMicrosoftAccess()}
                >
                  {t(`${FORM_PREFIX}.microsoftAccess.grant`, {
                    defaultValue: 'Grant Microsoft access',
                  })}
                </button>
                <button
                  type="button"
                  className={adminFormBtnSecondaryClass}
                  disabled={microsoftBusy || microsoftAccess?.microsoft_access === false}
                  onClick={() => void revokeMicrosoftAccess()}
                >
                  {t(`${FORM_PREFIX}.microsoftAccess.revoke`, {
                    defaultValue: 'Revoke Microsoft access',
                  })}
                </button>
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <div className="mt-4">
              <AdminSelect
                id={`${formId}-status`}
                label={t(`${FORM_PREFIX}.fields.accountStatus`)}
                value={accountStatus}
                onChange={setAccountStatus}
                options={statusOptions}
              />
            </div>
          )}
            </>
          )}
        </AdminFormSection>

        {mode === 'edit' && student && (
          <AdminFormSection
            sectionKey="credentials"
            title={t(`${FORM_PREFIX}.sections.credentials`)}
            description={t(`${FORM_PREFIX}.sections.credentialsHint`)}
          >
            {/* ── Stat cards ─────────────────────────────────────────── */}
            <div className="cred-stats-row">

              {/* First login */}
              <div className="cred-stat-card">
                <div className="cred-stat-card__icon cred-stat-card__icon--login">
                  <LogIn className="h-4 w-4" aria-hidden strokeWidth={2} />
                </div>
                <div className="cred-stat-card__body">
                  <span className="cred-stat-card__label">
                    {t(`${FORM_PREFIX}.credentials.firstLogin`)}
                  </span>
                  <span className={`cred-stat-card__value ${student.first_login_completed ? 'cred-stat-card__value--yes' : 'cred-stat-card__value--no'}`}>
                    {student.first_login_completed ? (
                      <><CheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2} />{t('admin.common.yes')}</>
                    ) : (
                      <><XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2} />{t('admin.common.no')}</>
                    )}
                  </span>
                </div>
              </div>

              {/* Onboarding progress */}
              <div className="cred-stat-card">
                <div className="cred-stat-card__ring" aria-hidden>
                  <svg viewBox="0 0 36 36" className="cred-stat-card__ring-svg">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--admin-border)" strokeWidth="3.2" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="var(--admin-brand)"
                      strokeWidth="3.2"
                      strokeDasharray={`${student.onboarding_percent} ${100 - student.onboarding_percent}`}
                      strokeDashoffset="25"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="cred-stat-card__ring-pct">{student.onboarding_percent}%</span>
                </div>
                <div className="cred-stat-card__body">
                  <span className="cred-stat-card__label">
                    {t(`${FORM_PREFIX}.credentials.onboarding`)}
                  </span>
                  <span className="cred-stat-card__value">
                    {student.onboarding_percent}%
                  </span>
                  <div className="cred-onboarding-bar" aria-hidden>
                    <div
                      className="cred-onboarding-bar__fill"
                      style={{ width: `${student.onboarding_percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Last login */}
              <div className="cred-stat-card">
                <div className="cred-stat-card__icon cred-stat-card__icon--clock">
                  <Clock className="h-4 w-4" aria-hidden strokeWidth={2} />
                </div>
                <div className="cred-stat-card__body">
                  <span className="cred-stat-card__label">
                    {t(`${FORM_PREFIX}.credentials.lastLogin`)}
                  </span>
                  <span className="cred-stat-card__value cred-stat-card__value--date">
                    {student.last_login_at
                      ? new Date(student.last_login_at).toLocaleString(dateLocale)
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Risk flags ─────────────────────────────────────────── */}
            {student.risk_flags.length > 0 && (
              <div className="cred-risk-row">
                <div className="cred-risk-row__header">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2} />
                  <span>{t(`${FORM_PREFIX}.credentials.alerts`)}</span>
                </div>
                <div className="cred-risk-row__badges">
                  {student.risk_flags.map((flag) => (
                    <span key={flag} className="cred-risk-badge">{flag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Divider ────────────────────────────────────────────── */}
            <div className="cred-divider" aria-hidden />

            {/* ── Actions ────────────────────────────────────────────── */}
            <div className="cred-actions">
              <button
                type="button"
                className="cred-action-btn cred-action-btn--primary"
                onClick={handleRegenerate}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
                )}
                {t(`${FORM_PREFIX}.credentials.regeneratePassword`)}
              </button>
              <button
                type="button"
                className="cred-action-btn cred-action-btn--outline"
                onClick={handleReveal}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
                )}
                {t(`${FORM_PREFIX}.credentials.revealCredential`)}
              </button>
            </div>

            {/* ── Revealed password ──────────────────────────────────── */}
            {revealedPassword && (
              <div className="cred-password-reveal">
                <KeyRound className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden strokeWidth={2} />
                <code className="cred-password-reveal__code">{revealedPassword}</code>
                <button
                  type="button"
                  className="cred-password-reveal__copy"
                  onClick={() => { void handleCopyPassword(); }}
                  title="Copier le mot de passe"
                >
                  {copiedPassword ? (
                    <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden strokeWidth={2} />
                  )}
                </button>
              </div>
            )}
          </AdminFormSection>
        )}
        </div>
      </div>

      <div className={`${actionsClass}${isCreateMode ? ' admin-student-form__actions' : ''}`}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={adminFormBtnSecondaryClass}
        >
          {t(`${FORM_PREFIX}.actions.cancel`)}
        </button>
        <button type="submit" disabled={loading} className={adminFormBtnPrimaryClass}>
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          )}
          {mode === 'create' ? t(`${FORM_PREFIX}.actions.create`) : t(`${FORM_PREFIX}.actions.save`)}
        </button>
      </div>
    </form>
  );
};

export default StudentAccountForm;
