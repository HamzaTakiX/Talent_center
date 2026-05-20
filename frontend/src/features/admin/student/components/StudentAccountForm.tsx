import { FormEvent, FunctionComponent, useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2 } from 'lucide-react';
import { adminStudentsApi } from '../../api/students';
import type { AcademicHierarchyValue, AdminStudentRow } from '../../api/types';
import AdminSelect from '../../account/components/AdminSelect';
import AdminAcademicHierarchyFields, {
  emptyAcademicHierarchy,
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
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormBodyScrollClass,
  adminFormPanelFlexClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';

const FORM_PREFIX = 'admin.forms.createStudent';

export type StudentAccountFormMode = 'create' | 'edit';

interface StudentAccountFormProps {
  mode: StudentAccountFormMode;
  student?: AdminStudentRow | null;
  onCancel: () => void;
  onSaved: () => void;
  /** Masquer l’en-tête du panneau si un hero page est affiché au-dessus. */
  hidePanelHeader?: boolean;
}

const StudentAccountForm: FunctionComponent<StudentAccountFormProps> = ({
  mode,
  student,
  onCancel,
  onSaved,
  hidePanelHeader = false,
}) => {
  const { t, i18n } = useTranslation();
  const formId = useId();
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

  useEffect(() => {
    setError('');
    setSuccess('');
    setRevealedPassword(null);

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
      return;
    }

    if (student) {
      setEmail(student.email);
      setFirstName(student.first_name || '');
      setLastName(student.last_name || '');
      setStudentNumber(student.student_number || '');
      setAcademic({
        filiereId: student.filiere_id ? String(student.filiere_id) : '',
        levelId: student.academic_level_id ? String(student.academic_level_id) : '',
        sectorId: student.academic_sector_id ? String(student.academic_sector_id) : '',
        internshipTypeId: student.internship_type_id ? String(student.internship_type_id) : '',
        academicYearId: '',
        academicYearCode: student.academic_year || '',
        classGroupId: student.class_group_id ? String(student.class_group_id) : '',
      });
      setSsoEnabled(student.sso_enabled);
      setPlatformAccess(student.platform_access_granted);
      setAccountStatus(student.account_status);
    }
  }, [mode, student?.id]);

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

  return (
    <form className={adminFormPanelFlexClass} onSubmit={handleSubmit} noValidate>
      {!hidePanelHeader && <AdminFormPanelHeader title={title} subtitle={subtitle} />}

      <div className={adminFormBodyScrollClass}>
        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {success ? <AdminFormAlert variant="success">{success}</AdminFormAlert> : null}

        <div className={adminFormSectionsStackClass}>
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

      <div className={adminFormActionsFooterClass}>
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
