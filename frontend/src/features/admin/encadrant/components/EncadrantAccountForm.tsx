import { FormEvent, FunctionComponent, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2, Mail, User } from 'lucide-react';
import { adminEncadrantsApi } from '../../api/encadrants';
import type { AdminEncadrantRow } from '../../api/types';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
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
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormBodyScrollClass,
  adminFormPanelFlexClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import { ESCA_SSO_EMAIL_SUFFIX } from '../constants/supervisionDomains';
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
  encadrant?: AdminEncadrantRow | null;
  onCancel: () => void;
  onSaved: () => void;
  hidePanelHeader?: boolean;
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
}) => {
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const formId = useId();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [academicScope, setAcademicScope] = useState<EncadrantAcademicScopeState>(emptyAcademicScope);
  const [supervisedInternships, setSupervisedInternships] =
    useState<EncadrantSupervisedInternshipState>({ supervisedInternshipTypeIds: [] });
  const [maxStudents, setMaxStudents] = useState('15');
  const [grantAccess, setGrantAccess] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sectorsAvailable, setSectorsAvailable] = useState(false);

  useEffect(() => {
    setFormError('');
    setFieldErrors({});
    if (mode === 'create') {
      setFullName('');
      setEmail('');
      setAcademicScope(emptyAcademicScope());
      setSupervisedInternships({ supervisedInternshipTypeIds: [] });
      setMaxStudents('15');
      setGrantAccess(false);
      setIsActive(true);
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
      setGrantAccess(encadrant.platform_access_granted);
      setIsActive(encadrant.is_encadrant_active);
    }
  }, [mode, encadrant?.id]);

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
    } else if (!trimmedEmail.endsWith(ESCA_SSO_EMAIL_SUFFIX)) {
      errors.email = t(`${FORM_PREFIX}.messages.invalidEmailDomain`);
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
        ? { grant_access: grantAccess, is_active: isActive }
        : { platform_access_granted: grantAccess, is_active: isActive }),
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        await adminEncadrantsApi.create(payload);
        toastSuccess(t(`${FORM_PREFIX}.messages.createSuccess`));
      } else if (encadrant) {
        await adminEncadrantsApi.update(encadrant.id, payload);
        toastSuccess(t(`${FORM_PREFIX}.messages.updateSuccess`));
      }
      onSaved();
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

  return (
    <form className={adminFormPanelFlexClass} onSubmit={handleSubmit} id={formId} noValidate>
      {!hidePanelHeader && (
        <AdminFormPanelHeader
          title={mode === 'edit' ? t(`${FORM_PREFIX}.editTitle`) : t(`${FORM_PREFIX}.title`)}
          subtitle={
            mode === 'edit' ? t(`${FORM_PREFIX}.editSubtitle`) : t(`${FORM_PREFIX}.subtitle`)
          }
        />
      )}

      {formError ? (
        <div className="px-4 sm:px-6">
          <AdminFormAlert variant="error">{formError}</AdminFormAlert>
        </div>
      ) : null}

      <div className={adminFormBodyScrollClass}>
        <div className={adminFormSectionsStackClass}>
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
                  disabled={mode === 'edit'}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </AdminFormField>
            </div>
          </AdminFormSection>

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
            <div className={adminFormGridClass}>
              <EncadrantSupervisedInternshipFields
                value={supervisedInternships}
                onChange={(next) => {
                  setSupervisedInternships(next);
                  clearFieldError('supervisedInternshipTypeIds');
                }}
                error={fieldErrors.supervisedInternshipTypeIds}
              />
              <AdminFormField
                fieldKey="maxStudents"
                label={t(`${FORM_PREFIX}.fields.maxStudents`)}
                htmlFor="enc-max-students"
                required
                error={fieldErrors.maxStudents}
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
          </AdminFormSection>

          <AdminFormSection
            sectionKey="access"
            title={t(`${FORM_PREFIX}.sections.access`)}
            description={t(`${FORM_PREFIX}.sections.accessHint`)}
          >
            <div className="flex flex-col gap-4">
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
        </div>
      </div>

      <div className={adminFormActionsFooterClass}>
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
      </div>
    </form>
  );
};

export default EncadrantAccountForm;
