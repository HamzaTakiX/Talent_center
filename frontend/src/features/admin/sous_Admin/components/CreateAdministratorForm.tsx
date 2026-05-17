import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Hexagon } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import {
  AdminFormField,
  AdminFormInput,
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
  CREATE_ADMIN_PERMISSIONS_COL_A,
  CREATE_ADMIN_PERMISSIONS_COL_B,
  CREATE_ADMIN_ROLE_OPTIONS,
  type CreateAdminPermissionKey,
} from '../constants/createAdministrator';

const FORM_PREFIX = 'admin.forms.createAdministrator';

interface CreateAdministratorFormProps {
  fullName: string;
  email: string;
  role: string;
  phone: string;
  notes: string;
  permissions: Record<string, boolean>;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onTogglePermission: (key: CreateAdminPermissionKey) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const CreateAdministratorForm: FunctionComponent<CreateAdministratorFormProps> = ({
  fullName,
  email,
  role,
  phone,
  notes,
  permissions,
  onFullNameChange,
  onEmailChange,
  onRoleChange,
  onPhoneChange,
  onNotesChange,
  onTogglePermission,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const roleOptions = useMemo(
    () =>
      CREATE_ADMIN_ROLE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.roles.${opt.labelKey}`),
      })),
    [t]
  );

  const permissionLabel = (key: CreateAdminPermissionKey) =>
    t(`${FORM_PREFIX}.permissions.${key}`);

  return (
    <div className={adminFormPanelClass}>
      <div className={adminFormBodyClass}>
        <header className={adminFormHeaderClass}>
          <h1 className={adminFormTitleClass}>{t(`${FORM_PREFIX}.title`)}</h1>
          <p className={adminFormSubtitleClass}>{t(`${FORM_PREFIX}.subtitle`)}</p>
        </header>

        <div className={adminFormGridClass}>
          <AdminFormField label={t(`${FORM_PREFIX}.fields.fullName`)} required>
            <AdminFormInput
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.fullName`)}
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.email`)} required>
            <AdminFormInput
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.email`)}
            />
          </AdminFormField>

          <AdminSelect
            id="admin-role"
            label={`${t(`${FORM_PREFIX}.fields.role`)} *`}
            value={role}
            onChange={onRoleChange}
            options={roleOptions}
          />

          <AdminFormField label={t(`${FORM_PREFIX}.fields.phone`)}>
            <AdminFormInput
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.phone`)}
            />
          </AdminFormField>
        </div>

        <div className="mt-10 admin-module-panel px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 flex items-center gap-2.5">
            <Hexagon className="h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
            <h2 className="text-base font-semibold text-[var(--admin-text)]">
              {t(`${FORM_PREFIX}.permissionsTitle`)}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-x-12 sm:gap-y-4">
            <div className="flex flex-col gap-3">
              {CREATE_ADMIN_PERMISSIONS_COL_A.map((key) => (
                <label key={key} className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!permissions[key]}
                    onChange={() => onTogglePermission(key)}
                    className="admin-form-checkbox"
                  />
                  <span className="text-num-14 leading-num-20 text-[var(--admin-text)]">
                    {permissionLabel(key)}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {CREATE_ADMIN_PERMISSIONS_COL_B.map((key) => (
                <label key={key} className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!permissions[key]}
                    onChange={() => onTogglePermission(key)}
                    className="admin-form-checkbox"
                  />
                  <span className="text-num-14 leading-num-20 text-[var(--admin-text)]">
                    {permissionLabel(key)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <AdminFormField className="mt-10" label={t(`${FORM_PREFIX}.fields.notes`)}>
          <AdminFormInput
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t(`${FORM_PREFIX}.placeholders.notes`)}
          />
        </AdminFormField>
      </div>

      <div className={adminFormActionsClass}>
        <button type="button" onClick={onCancel} className={adminFormBtnSecondaryClass}>
          {t(`${FORM_PREFIX}.actions.cancel`)}
        </button>
        <button type="button" onClick={onSubmit} className={adminFormBtnPrimaryClass}>
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t(`${FORM_PREFIX}.actions.submit`)}
        </button>
      </div>
    </div>
  );
};

export default CreateAdministratorForm;
