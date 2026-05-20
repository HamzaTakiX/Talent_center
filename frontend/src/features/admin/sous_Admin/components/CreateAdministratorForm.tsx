import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import {
  AdminFormField,
  AdminFormInput,
} from '../../shared/forms/AdminFormPrimitives';
import AdminFormPanelHeader from '../../shared/forms/AdminFormPanelHeader';
import AdminFormSection from '../../shared/forms/AdminFormSection';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import {
  adminFormActionsFooterClass,
  adminFormBodyScrollClass,
  adminFormPanelFlexClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';
import {
  CREATE_ADMIN_PERMISSIONS_COL_A,
  CREATE_ADMIN_PERMISSIONS_COL_B,
  CREATE_ADMIN_ROLE_OPTIONS,
  type CreateAdminPermissionKey,
} from '../constants/createAdministrator';

const FORM_PREFIX = 'admin.forms.createAdministrator';

interface CreateAdministratorFormProps {
  variant?: 'create' | 'edit';
  hidePanelHeader?: boolean;
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
  variant = 'create',
  hidePanelHeader = false,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const formTitle =
    variant === 'edit' ? t(`${FORM_PREFIX}.editTitle`) : t(`${FORM_PREFIX}.title`);
  const formSubtitle =
    variant === 'edit' ? t(`${FORM_PREFIX}.editSubtitle`) : t(`${FORM_PREFIX}.subtitle`);

  const roleOptions = useMemo(
    () =>
      CREATE_ADMIN_ROLE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.roles.${opt.labelKey}`),
      })),
    [t],
  );

  const permissionLabel = (key: CreateAdminPermissionKey) =>
    t(`${FORM_PREFIX}.permissions.${key}`);

  return (
    <div className={adminFormPanelFlexClass}>
      {!hidePanelHeader && <AdminFormPanelHeader title={formTitle} subtitle={formSubtitle} />}

      <div className={adminFormBodyScrollClass}>
        <div className={adminFormSectionsStackClass}>
          <AdminFormSection
            title={t(`${FORM_PREFIX}.sections.identity`)}
            description={t(`${FORM_PREFIX}.sections.identityHint`)}
          >
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
          </AdminFormSection>

          <AdminFormSection
            title={t(`${FORM_PREFIX}.permissionsTitle`)}
            description={t(`${FORM_PREFIX}.sections.permissionsHint`)}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-x-12 sm:gap-y-4">
              <div className="flex flex-col gap-3">
                {CREATE_ADMIN_PERMISSIONS_COL_A.map((key) => (
                  <AdminFormSwitch
                    key={key}
                    id={`admin-perm-${key}`}
                    label={permissionLabel(key)}
                    checked={!!permissions[key]}
                    onChange={() => onTogglePermission(key)}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {CREATE_ADMIN_PERMISSIONS_COL_B.map((key) => (
                  <AdminFormSwitch
                    key={key}
                    id={`admin-perm-${key}`}
                    label={permissionLabel(key)}
                    checked={!!permissions[key]}
                    onChange={() => onTogglePermission(key)}
                  />
                ))}
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection
            title={t(`${FORM_PREFIX}.fields.notes`)}
            description={t(`${FORM_PREFIX}.sections.notesHint`)}
          >
            <AdminFormInput
              type="text"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.notes`)}
            />
          </AdminFormSection>
        </div>
      </div>

      <div className={adminFormActionsFooterClass}>
        <button type="button" onClick={onCancel} className={adminFormBtnSecondaryClass}>
          {t(`${FORM_PREFIX}.actions.cancel`)}
        </button>
        <button type="button" onClick={onSubmit} className={adminFormBtnPrimaryClass}>
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {variant === 'edit' ? t(`${FORM_PREFIX}.actions.save`) : t(`${FORM_PREFIX}.actions.submit`)}
        </button>
      </div>
    </div>
  );
};

export default CreateAdministratorForm;
