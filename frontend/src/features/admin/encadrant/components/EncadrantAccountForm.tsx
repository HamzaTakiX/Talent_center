import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  GraduationCap,
  ImageIcon,
  ImagePlus,
  Loader2,
  Mail,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react';
import AdminBackButton from '../../ui/AdminBackButton';
import { adminEncadrantsApi } from '../../api/encadrants';
import type { AdminEncadrantDetail, AdminEncadrantRow } from '../../api/types';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import ProfileAvatarUploader from '../../account/components/ProfileAvatarUploader';
import { getAdminUserInitials, resolveAvatarUrl } from '../../dashboard/utils/adminUserDisplay';
import {
  AdminFormField,
  AdminFormInput,
} from '../../shared/forms/AdminFormPrimitives';
import AdminFormPanelHeader from '../../shared/forms/AdminFormPanelHeader';
import AdminFormSection from '../../shared/forms/AdminFormSection';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import AdminFormAlert from '../../shared/forms/AdminFormAlert';
import {
  adminFormActionsInlineClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormBodyScrollClass,
  adminFormPanelFlexClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import AdminCredentialReveal from '../../ui/AdminCredentialReveal';
import EncadrantAcademicScopeFields, {
  type EncadrantAcademicScopeState,
  type EncadrantScopeFieldErrors,
} from './EncadrantAcademicScopeFields';
import EncadrantSupervisedInternshipFields, {
  type EncadrantSupervisedInternshipState,
} from './EncadrantSupervisedInternshipFields';
import { isSpecializationDomainOption } from '../utils/specializationDomainDisplay';

const FORM_PREFIX = 'admin.forms.createEncadrant';

export type EncadrantAccountFormMode = 'create' | 'edit';

interface EncadrantAccountFormProps {
  mode: EncadrantAccountFormMode;
  encadrant?: AdminEncadrantRow | AdminEncadrantDetail | null;
  onCancel: () => void;
  onSaved: () => void;
  hidePanelHeader?: boolean;
  /** Bouton retour dans l’en-tête du panneau formulaire. */
  backLabel?: string;
}

type IdentityFieldKey = 'fullName' | 'email' | 'maxStudents';

type FormFieldErrors = Partial<Record<IdentityFieldKey, string>> &
  EncadrantScopeFieldErrors & {
    supervisedInternshipTypeIds?: string;
  };

const emptyAcademicScope = (): EncadrantAcademicScopeState => ({
  filiereIds: [],
  yearFilter: '',
  classGroupIds: [],
  levelIds: [],
  sectorIds: [],
  levels: [],
  academicYears: [],
  specializationDomainIds: [],
});

const EncadrantAccountForm: FunctionComponent<EncadrantAccountFormProps> = ({
  mode,
  encadrant,
  onCancel,
  onSaved,
  hidePanelHeader = false,
  backLabel,
}) => {
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [academicScope, setAcademicScope] = useState<EncadrantAcademicScopeState>(emptyAcademicScope);
  const [supervisedInternships, setSupervisedInternships] =
    useState<EncadrantSupervisedInternshipState>({ supervisedInternshipTypeIds: [] });
  const [maxStudents, setMaxStudents] = useState('15');
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [grantAccess, setGrantAccess] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sectorsAvailable, setSectorsAvailable] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    setFormError('');
    setFieldErrors({});
    setCreatedUserId(null);
    setAvatarFile(null);
    setRemoveAvatar(false);
    if (mode === 'create') {
      setFullName('');
      setEmail('');
      setAcademicScope(emptyAcademicScope());
      setSupervisedInternships({ supervisedInternshipTypeIds: [] });
      setMaxStudents('15');
      setSsoEnabled(true);
      setGrantAccess(false);
      setIsActive(true);
      setAvatarPreview(null);
      return;
    }
    if (encadrant) {
      setFullName(encadrant.full_name);
      setEmail(encadrant.email);
      const scopeYears = encadrant.scopes?.academic_years ?? [];
      const domainIds = (encadrant.specialization_domains ?? [])
        .map((d) => (isSpecializationDomainOption(d) ? d.id : null))
        .filter((id): id is number => id !== null);
      setAcademicScope({
        filiereIds: encadrant.scopes?.filiere_ids ?? [],
        yearFilter: '',
        classGroupIds: encadrant.scopes?.class_group_ids ?? [],
        levelIds: encadrant.scopes?.level_ids ?? [],
        sectorIds: encadrant.scopes?.sector_ids ?? [],
        levels: [],
        academicYears: scopeYears,
        specializationDomainIds: domainIds,
      });
      setSupervisedInternships({
        supervisedInternshipTypeIds: (encadrant.supervised_internship_types ?? []).map((item) => item.id),
      });
      setMaxStudents(String(encadrant.max_students || 15));
      setSsoEnabled(encadrant.sso_enabled);
      setGrantAccess(encadrant.platform_access_granted);
      setIsActive(encadrant.is_encadrant_active);
      setAvatarPreview(resolveAvatarUrl(encadrant.profile?.avatar));
    }
  }, [mode, encadrant?.id]);

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

  const clearFieldError = (key: keyof FormFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (requireSectors: boolean): FormFieldErrors => {
    const errors: FormFieldErrors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      errors.fullName = t(`${FORM_PREFIX}.messages.requiredFullName`);
    }
    if (!trimmedEmail) {
      errors.email = t(`${FORM_PREFIX}.messages.requiredEmail`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = t(`${FORM_PREFIX}.messages.invalidEmailFormat`);
    }

    if (academicScope.filiereIds.length === 0) {
      errors.filiereIds = t(`${FORM_PREFIX}.messages.requiredFiliere`);
    }
    if (academicScope.academicYears.length === 0) {
      errors.academicYears = t(`${FORM_PREFIX}.messages.requiredAcademicYear`);
    }
    if (academicScope.levelIds.length === 0) {
      errors.levelIds = t(`${FORM_PREFIX}.messages.requiredLevel`);
    }
    if (supervisedInternships.supervisedInternshipTypeIds.length === 0) {
      errors.supervisedInternshipTypeIds = t(
        `${FORM_PREFIX}.messages.requiredSupervisedInternships`,
      );
    }
    if (requireSectors && academicScope.sectorIds.length === 0) {
      errors.sectorIds = t(`${FORM_PREFIX}.messages.requiredSector`);
    }

    const maxVal = parseInt(maxStudents, 10);
    if (maxStudents.trim() === '') {
      errors.maxStudents = t(`${FORM_PREFIX}.messages.requiredMaxStudents`);
    } else if (Number.isNaN(maxVal) || maxVal < 0) {
      errors.maxStudents = t(`${FORM_PREFIX}.messages.invalidMaxStudents`);
    } else if (maxVal === 0) {
      errors.maxStudents = t(`${FORM_PREFIX}.messages.maxStudentsMin`);
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const validationErrors = validate(sectorsAvailable);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const summary = t(`${FORM_PREFIX}.messages.validationSummary`);
      setFormError(summary);
      toastError(summary);
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const maxVal = parseInt(maxStudents, 10);

    const payload = {
      full_name: trimmedName,
      email: trimmedEmail,
      filiere_ids: academicScope.filiereIds,
      class_group_ids: academicScope.classGroupIds,
      level_ids: academicScope.levelIds,
      sector_ids: academicScope.sectorIds,
      academic_years: academicScope.academicYears,
      specialization_domain_ids: academicScope.specializationDomainIds,
      supervised_internship_type_ids: supervisedInternships.supervisedInternshipTypeIds,
      max_students: maxVal,
      ...(mode === 'create'
        ? { sso_enabled: ssoEnabled, grant_access: grantAccess, is_active: isActive }
        : {
            sso_enabled: ssoEnabled,
            platform_access_granted: grantAccess,
            is_active: isActive,
          }),
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        const created = await adminEncadrantsApi.create(payload);
        toastSuccess(t(`${FORM_PREFIX}.messages.createSuccess`));
        setCreatedUserId(created.id);
      } else if (encadrant) {
        if (avatarFile || removeAvatar) {
          const profilePayload = new FormData();
          if (avatarFile) profilePayload.append('avatar', avatarFile);
          if (removeAvatar) profilePayload.append('remove_avatar', 'true');
          const updatedProfile = await adminEncadrantsApi.updateProfile(encadrant.id, profilePayload);
          setAvatarPreview(resolveAvatarUrl(updatedProfile.profile?.avatar));
          setAvatarFile(null);
          setRemoveAvatar(false);
        }
        await adminEncadrantsApi.update(encadrant.id, payload);
        toastSuccess(t(`${FORM_PREFIX}.messages.updateSuccess`));
        onSaved();
      }
    } catch (err: unknown) {
      const { message, fieldErrors: apiFields } = parseAdminApiError(
        err,
        t(`${FORM_PREFIX}.messages.saveError`),
      );
      const mapped: FormFieldErrors = { ...fieldErrors };
      if (apiFields.email) mapped.email = apiFields.email;
      if (apiFields.full_name) mapped.fullName = apiFields.full_name;
      if (apiFields.filiere_ids) mapped.filiereIds = apiFields.filiere_ids;
      if (apiFields.level_ids) mapped.levelIds = apiFields.level_ids;
      if (apiFields.sector_ids) mapped.sectorIds = apiFields.sector_ids;
      if (apiFields.academic_years) mapped.academicYears = apiFields.academic_years;
      if (apiFields.max_students) mapped.maxStudents = apiFields.max_students;
      if (apiFields.specialization_domain_ids) {
        mapped.specializationDomainIds = apiFields.specialization_domain_ids;
      }
      if (apiFields.supervised_internship_type_ids) {
        mapped.supervisedInternshipTypeIds = apiFields.supervised_internship_type_ids;
      }
      setFieldErrors(mapped);
      setFormError(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  const scopeErrors: EncadrantScopeFieldErrors = {
    filiereIds: fieldErrors.filiereIds,
    levelIds: fieldErrors.levelIds,
    sectorIds: fieldErrors.sectorIds,
    academicYears: fieldErrors.academicYears,
  };

  const credentialUserId = mode === 'edit' ? encadrant?.id ?? null : createdUserId;
  const showCredentials = credentialUserId != null;
  const displayName = encadrant?.full_name?.trim() || fullName.trim() || email || '—';
  const initials = getAdminUserInitials(displayName, email);

  return (
    <form
      className={`${adminFormPanelFlexClass} admin-encadrant-form`}
      onSubmit={handleSubmit}
      id={formId}
      noValidate
    >
      {!hidePanelHeader && (
        <AdminFormPanelHeader
          title={mode === 'edit' ? t(`${FORM_PREFIX}.editTitle`) : t(`${FORM_PREFIX}.title`)}
          subtitle={mode === 'edit' ? t(`${FORM_PREFIX}.editSubtitle`) : undefined}
          icon={mode === 'edit' ? GraduationCap : UserPlus}
          leading={
            backLabel ? (
              <AdminBackButton onClick={onCancel} label={backLabel} className="!w-auto" />
            ) : null
          }
        />
      )}

      {formError ? (
        <div className="px-4 sm:px-6 pt-4">
          <AdminFormAlert variant="error">{formError}</AdminFormAlert>
        </div>
      ) : null}

      {createdUserId != null ? (
        <div className="px-4 sm:px-6 pt-4">
          <AdminFormAlert variant="success">
            {t(`${FORM_PREFIX}.messages.createSuccessWithPassword`)}
          </AdminFormAlert>
        </div>
      ) : null}

      <div className={adminFormBodyScrollClass}>
        <div className={`${adminFormSectionsStackClass} admin-encadrant-form__sections`}>
          {mode === 'edit' ? (
            <AdminFormSection
              sectionKey="photo"
              className="admin-student-edit-photo-section"
              title={t('admin.forms.createStudent.sections.photo')}
              description={t('admin.forms.createStudent.sections.photoHint')}
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
                          {t('admin.forms.createStudent.actions.removePhoto')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </AdminFormSection>
          ) : null}

          <AdminFormSection
            sectionKey="identity"
            title={t(`${FORM_PREFIX}.sections.identity`)}
            description={t(`${FORM_PREFIX}.sections.identityHint`)}
          >
            <div className={adminFormGridClass}>
              <AdminFormField
                fieldKey="fullName"
                label={t(`${FORM_PREFIX}.fields.fullName`)}
                htmlFor="enc-full-name"
                icon={User}
                required
                error={fieldErrors.fullName}
              >
                <AdminFormInput
                  fieldKey="fullName"
                  id="enc-full-name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError('fullName');
                  }}
                  placeholder={t(`${FORM_PREFIX}.placeholders.fullName`)}
                  required
                  disabled={createdUserId != null}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                />
              </AdminFormField>

              <AdminFormField
                fieldKey="email"
                label={t(`${FORM_PREFIX}.fields.email`)}
                htmlFor="enc-email"
                icon={Mail}
                required
                error={fieldErrors.email}
                hint={mode === 'edit' ? undefined : t(`${FORM_PREFIX}.fields.emailHint`)}
              >
                <AdminFormInput
                  fieldKey="email"
                  id="enc-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder={t(`${FORM_PREFIX}.placeholders.email`)}
                  required
                  disabled={mode === 'edit' || createdUserId != null}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </AdminFormField>
            </div>
          </AdminFormSection>

          {createdUserId == null && (
            <>
              <AdminFormSection
                sectionKey="academic"
                title={t(`${FORM_PREFIX}.sections.academicScope`)}
                description={t(`${FORM_PREFIX}.sections.academicScopeHint`)}
              >
                <EncadrantAcademicScopeFields
                  value={academicScope}
                  onChange={(next) => {
                    setAcademicScope(next);
                    setFieldErrors((prev) => {
                      const cleared = { ...prev };
                      delete cleared.filiereIds;
                      delete cleared.academicYears;
                      delete cleared.levelIds;
                      delete cleared.sectorIds;
                      delete cleared.specializationDomainIds;
                      return cleared;
                    });
                  }}
                  errors={scopeErrors}
                  onSectorsAvailabilityChange={setSectorsAvailable}
                />
              </AdminFormSection>

              <AdminFormSection
                sectionKey="overview"
                title={t(`${FORM_PREFIX}.sections.supervision`)}
                description={t(`${FORM_PREFIX}.sections.supervisionHint`)}
              >
                <div className="flex flex-col gap-6">
                  <EncadrantSupervisedInternshipFields
                    value={supervisedInternships}
                    levelIds={academicScope.levelIds}
                    onChange={(next) => {
                      setSupervisedInternships(next);
                      clearFieldError('supervisedInternshipTypeIds');
                    }}
                    error={fieldErrors.supervisedInternshipTypeIds}
                  />
                  <div className="max-w-md">
                    <AdminFormField
                      fieldKey="maxStudents"
                      label={t(`${FORM_PREFIX}.fields.maxStudents`)}
                      htmlFor="enc-max-students"
                      required
                      error={fieldErrors.maxStudents}
                      className="min-w-0"
                    >
                      <AdminFormInput
                        fieldKey="maxStudents"
                        id="enc-max-students"
                        type="number"
                        min={1}
                        value={maxStudents}
                        onChange={(e) => {
                          setMaxStudents(e.target.value);
                          clearFieldError('maxStudents');
                        }}
                        required
                        aria-invalid={Boolean(fieldErrors.maxStudents)}
                      />
                    </AdminFormField>
                  </div>
                </div>
              </AdminFormSection>

              <AdminFormSection
                sectionKey="access"
                title={t(`${FORM_PREFIX}.sections.access`)}
                description={t(`${FORM_PREFIX}.sections.accessHint`)}
              >
                <div className="admin-encadrant-form__switches flex flex-col gap-3">
                  <AdminFormSwitch
                    id="enc-sso-enabled"
                    label={
                      <span>
                        {t(`${FORM_PREFIX}.fields.ssoEnabled`)}
                        <span className="mt-0.5 block text-xs font-normal text-[var(--admin-text-secondary)]">
                          {t(`${FORM_PREFIX}.fields.ssoEnabledHint`)}
                        </span>
                      </span>
                    }
                    checked={ssoEnabled}
                    onChange={setSsoEnabled}
                  />
                  <AdminFormSwitch
                    id="enc-grant-access"
                    label={
                      <span>
                        {t(`${FORM_PREFIX}.fields.grantAccess`)}
                        <span className="mt-0.5 block text-xs font-normal text-[var(--admin-text-secondary)]">
                          {t(`${FORM_PREFIX}.fields.grantAccessHint`)}
                        </span>
                      </span>
                    }
                    checked={grantAccess}
                    onChange={setGrantAccess}
                  />
                  <AdminFormSwitch
                    id="enc-is-active"
                    label={
                      <span>
                        {t(`${FORM_PREFIX}.fields.isActive`)}
                        <span className="mt-0.5 block text-xs font-normal text-[var(--admin-text-secondary)]">
                          {t(`${FORM_PREFIX}.fields.isActiveHint`)}
                        </span>
                      </span>
                    }
                    checked={isActive}
                    onChange={setIsActive}
                  />
                </div>
              </AdminFormSection>
            </>
          )}

          {showCredentials && (
            <AdminFormSection
              sectionKey="credentials"
              title={t(`${FORM_PREFIX}.sections.credentials`)}
              description={t(`${FORM_PREFIX}.sections.credentialsHint`)}
            >
              <AdminCredentialReveal kind="encadrant" userId={credentialUserId} enabled />
            </AdminFormSection>
          )}
        </div>
      </div>

      <div
        className={
          createdUserId != null
            ? 'admin-form-actions admin-encadrant-form__actions flex min-w-0 shrink-0 justify-center px-4 py-6 sm:px-8'
            : `${adminFormActionsInlineClass} admin-encadrant-form__actions`
        }
      >
        {createdUserId != null ? (
          <button type="button" onClick={onSaved} className={adminFormBtnPrimaryClass}>
            <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t(`${FORM_PREFIX}.actions.done`)}
          </button>
        ) : (
          <>
            <button type="button" onClick={onCancel} className={adminFormBtnSecondaryClass} disabled={loading}>
              {t(`${FORM_PREFIX}.actions.cancel`)}
            </button>
            <button type="submit" className={adminFormBtnPrimaryClass} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={1.75} aria-hidden />
              ) : (
                <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              )}
              {mode === 'edit' ? t(`${FORM_PREFIX}.actions.save`) : t(`${FORM_PREFIX}.actions.submit`)}
            </button>
          </>
        )}
      </div>
    </form>
  );
};

export default EncadrantAccountForm;
