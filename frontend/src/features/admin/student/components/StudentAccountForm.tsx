import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ImageIcon, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { adminStudentsApi } from '../../api/students';
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
}

const StudentAccountForm: FunctionComponent<StudentAccountFormProps> = ({
  mode,
  student,
  onCancel,
  onSaved,
  hidePanelHeader = false,
  stickyActions = true,
}) => {
  const { t, i18n } = useTranslation();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateLocale = i18n.language.startsWith('ar') ? 'ar-MA' : i18n.language.startsWith('en') ? 'en-GB' : 'fr-FR';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
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
    }
  }, [mode, student?.id]);

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
      await adminStudentsApi.regeneratePassword(student.id);
      setRevealedPassword(null);
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
  const actionsClass = stickyActions ? adminFormActionsFooterClass : adminFormActionsInlineClass;
  const formClassName =
    mode === 'edit'
      ? `${adminFormPanelFlexClass} admin-student-edit-form`
      : adminFormPanelFlexClass;

  return (
    <form className={formClassName} onSubmit={handleSubmit} noValidate>
      {!hidePanelHeader && <AdminFormPanelHeader title={title} subtitle={subtitle} />}

      <div className={adminFormBodyScrollClass}>
        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {success ? <AdminFormAlert variant="success">{success}</AdminFormAlert> : null}

        <div className={adminFormSectionsStackClass}>
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
            <AdminFormField fieldKey="email" label={t(`${FORM_PREFIX}.fields.email`)} required>
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

            <AdminFormField fieldKey="firstName" label={t(`${FORM_PREFIX}.fields.firstName`)}>
              <AdminFormInput
                fieldKey="firstName"
                id={`${formId}-first`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t(`${FORM_PREFIX}.placeholders.firstName`)}
                disabled={mode === 'edit'}
              />
            </AdminFormField>

            <AdminFormField fieldKey="lastName" label={t(`${FORM_PREFIX}.fields.lastName`)}>
              <AdminFormInput
                fieldKey="lastName"
                id={`${formId}-last`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t(`${FORM_PREFIX}.placeholders.lastName`)}
                disabled={mode === 'edit'}
              />
            </AdminFormField>

            <AdminFormField fieldKey="studentNumber" label={t(`${FORM_PREFIX}.fields.studentNumber`)}>
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
          <div className={adminFormGridClass}>
            <AdminAcademicHierarchyFields
              idPrefix={`${formId}-academic`}
              value={academic}
              onChange={setAcademic}
              autoResolveInternship
              autoSelectCurrentYear={mode === 'create'}
              pinnedSelections={pinnedAcademicSelections}
            />
          </div>
        </AdminFormSection>

        <AdminFormSection
          sectionKey="access"
          title={t(`${FORM_PREFIX}.sections.access`)}
          description={t(`${FORM_PREFIX}.sections.accessHint`)}
        >
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <AdminFormSwitch
              id={`${formId}-sso`}
              label={t(`${FORM_PREFIX}.fields.ssoAccess`)}
              checked={ssoEnabled}
              onChange={setSsoEnabled}
            />
            {mode === 'create' ? (
              <AdminFormSwitch
                id={`${formId}-grant-access`}
                label={t(`${FORM_PREFIX}.fields.grantPlatformAccess`)}
                checked={grantAccess}
                onChange={setGrantAccess}
              />
            ) : (
              <AdminFormSwitch
                id={`${formId}-platform-access`}
                label={t(`${FORM_PREFIX}.fields.platformAccess`)}
                checked={platformAccess}
                onChange={setPlatformAccess}
              />
            )}
          </div>

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
        </AdminFormSection>

        {mode === 'edit' && student && (
          <AdminFormSection
            sectionKey="credentials"
            title={t(`${FORM_PREFIX}.sections.credentials`)}
            description={t(`${FORM_PREFIX}.sections.credentialsHint`)}
          >
            <div className="grid gap-2 text-sm text-[var(--admin-text-secondary)] sm:grid-cols-2">
              <p>
                {t(`${FORM_PREFIX}.credentials.firstLogin`)} :{' '}
                <span className="text-[var(--admin-text)]">
                  {student.first_login_completed ? t('admin.common.yes') : t('admin.common.no')}
                </span>
              </p>
              <p>
                {t(`${FORM_PREFIX}.credentials.onboarding`)} :{' '}
                <span className="text-[var(--admin-text)]">{student.onboarding_percent}%</span>
              </p>
              <p className="sm:col-span-2">
                {t(`${FORM_PREFIX}.credentials.lastLogin`)} :{' '}
                <span className="text-[var(--admin-text)]">
                  {student.last_login_at
                    ? new Date(student.last_login_at).toLocaleString(dateLocale)
                    : '—'}
                </span>
              </p>
            </div>
            {student.risk_flags.length > 0 && (
              <p className="mt-2 text-xs font-medium text-amber-500">
                {t(`${FORM_PREFIX}.credentials.alerts`)} : {student.risk_flags.join(', ')}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="admin-btn-secondary inline-flex h-9 items-center gap-2 rounded-admin-sm px-4 text-sm font-medium"
                onClick={handleRegenerate}
                disabled={loading}
              >
                {t(`${FORM_PREFIX}.credentials.regeneratePassword`)}
              </button>
              <button
                type="button"
                className="admin-btn-outline inline-flex h-9 items-center gap-2 rounded-admin-sm px-4 text-sm font-medium"
                onClick={handleReveal}
                disabled={loading}
              >
                {t(`${FORM_PREFIX}.credentials.revealCredential`)}
              </button>
              {revealedPassword && (
                <code className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-sm text-emerald-400">
                  {revealedPassword}
                </code>
              )}
            </div>
          </AdminFormSection>
        )}
        </div>
      </div>

      <div className={actionsClass}>
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
