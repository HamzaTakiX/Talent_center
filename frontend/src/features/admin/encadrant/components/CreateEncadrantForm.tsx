import { FormEvent, FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import {
  AdminFormField,
  AdminFormInput,
  AdminFormTextarea,
} from '../../shared/forms/AdminFormPrimitives';
import {
  adminFormActionsClass,
  adminFormBodyClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormHeaderClass,
  adminFormPanelClass,
  adminFormSubtitleClass,
  adminFormTitleClass,
} from '../../shared/forms/adminFormClasses';
import {
  ENCADRANT_DEPARTMENT_OPTIONS,
  ENCADRANT_ROLE_OPTIONS,
} from '../constants/createEncadrant';

const FORM_PREFIX = 'admin.forms.createEncadrant';

interface CreateEncadrantFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  roleTitle: string;
  specialization: string;
  maxStudents: string;
  bio: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRoleTitleChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;
  onMaxStudentsChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const CreateEncadrantForm: FunctionComponent<CreateEncadrantFormProps> = ({
  firstName,
  lastName,
  email,
  phone,
  department,
  roleTitle,
  specialization,
  maxStudents,
  bio,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onDepartmentChange,
  onRoleTitleChange,
  onSpecializationChange,
  onMaxStudentsChange,
  onBioChange,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const departmentOptions = useMemo(
    () =>
      ENCADRANT_DEPARTMENT_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.departments.${opt.labelKey}`),
      })),
    [t]
  );

  const roleOptions = useMemo(
    () =>
      ENCADRANT_ROLE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.roles.${opt.labelKey}`),
      })),
    [t]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className={adminFormPanelClass} onSubmit={handleSubmit} noValidate>
      <div className={adminFormBodyClass}>
        <header className={adminFormHeaderClass}>
          <h1 className={adminFormTitleClass}>{t(`${FORM_PREFIX}.title`)}</h1>
          <p className={adminFormSubtitleClass}>{t(`${FORM_PREFIX}.subtitle`)}</p>
        </header>

        <div className={adminFormGridClass}>
          <AdminFormField label={t(`${FORM_PREFIX}.fields.firstName`)} htmlFor="enc-first-name" required>
            <AdminFormInput
              id="enc-first-name"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.firstName`)}
              autoComplete="given-name"
              required
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.lastName`)} htmlFor="enc-last-name" required>
            <AdminFormInput
              id="enc-last-name"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.lastName`)}
              autoComplete="family-name"
              required
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.email`)} htmlFor="enc-email" required>
            <AdminFormInput
              id="enc-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.email`)}
              autoComplete="email"
              required
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.phone`)} htmlFor="enc-phone">
            <AdminFormInput
              id="enc-phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.phone`)}
              autoComplete="tel"
            />
          </AdminFormField>

          <AdminSelect
            id="enc-department"
            label={`${t(`${FORM_PREFIX}.fields.department`)} *`}
            value={department}
            onChange={onDepartmentChange}
            options={departmentOptions}
          />

          <AdminSelect
            id="enc-role"
            label={`${t(`${FORM_PREFIX}.fields.roleTitle`)} *`}
            value={roleTitle}
            onChange={onRoleTitleChange}
            options={roleOptions}
          />

          <AdminFormField label={t(`${FORM_PREFIX}.fields.specialization`)} htmlFor="enc-specialization">
            <AdminFormInput
              id="enc-specialization"
              value={specialization}
              onChange={(e) => onSpecializationChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.specialization`)}
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.maxStudents`)} htmlFor="enc-max-students">
            <AdminFormInput
              id="enc-max-students"
              type="number"
              min={1}
              value={maxStudents}
              onChange={(e) => onMaxStudentsChange(e.target.value)}
            />
          </AdminFormField>
        </div>

        <AdminFormField className="mt-6" label={t(`${FORM_PREFIX}.fields.bio`)} htmlFor="enc-bio">
          <AdminFormTextarea
            id="enc-bio"
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder={t(`${FORM_PREFIX}.placeholders.bio`)}
            rows={3}
          />
        </AdminFormField>
      </div>

      <div className={adminFormActionsClass}>
        <button type="button" onClick={onCancel} className={adminFormBtnSecondaryClass}>
          {t(`${FORM_PREFIX}.actions.cancel`)}
        </button>
        <button type="submit" className={adminFormBtnPrimaryClass}>
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t(`${FORM_PREFIX}.actions.submit`)}
        </button>
      </div>
    </form>
  );
};

export default CreateEncadrantForm;
