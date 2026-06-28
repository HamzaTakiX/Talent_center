import { FormEvent, FunctionComponent, useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2 } from 'lucide-react';
import { adminAdministratorsApi } from '../../api/administrators';
import type { AdminAccountStatus, AdminAdministratorRow } from '../../api/types';
import AdminSelect from '../../account/components/AdminSelect';
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
import {
  ACCOUNT_STATUS_OPTIONS,
  CREATE_ADMIN_PERMISSIONS_COL_A,
  CREATE_ADMIN_PERMISSIONS_COL_B,
  CREATE_ADMIN_ROLE_OPTIONS,
  type CreateAdminPermissionKey,
  type CreateAdminRoleValue,
} from '../constants/createAdministrator';

const FORM_PREFIX = 'admin.forms.createAdministrator';

export type AdministratorAccountFormMode = 'create' | 'edit';

interface AdministratorAccountFormProps {
  mode: AdministratorAccountFormMode;
  administrator?: AdminAdministratorRow | null;
  onCancel: () => void;
  onSaved: () => void;
  hidePanelHeader?: boolean;
}

const AdministratorAccountForm: FunctionComponent<AdministratorAccountFormProps> = ({
  mode,
  administrator,
  onCancel,
  onSaved,
  hidePanelHeader = false,
}) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useAdminToast();
  const formId = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<CreateAdminRoleValue[]>([]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [grantAccess, setGrantAccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState('PENDING');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setError('');
    if (mode === 'create') {
      setFullName('');
      setEmail('');
      setSelectedRoles([]);
      setPermissions({});
      setSsoEnabled(false);
      setGrantAccess(false);
      setAccountStatus('PENDING');
      setIsActive(true);
      return;
    }
    if (administrator) {
      setFullName(administrator.full_name);
      setEmail(administrator.email);
      setSelectedRoles(administrator.role_slugs as CreateAdminRoleValue[]);
      const permMap: Record<string, boolean> = {};
      administrator.permission_keys.forEach((k) => {
        permMap[k] = true;
      });
      setPermissions(permMap);
      setSsoEnabled(administrator.sso_enabled);
      setGrantAccess(administrator.platform_access_granted);
      setAccountStatus(administrator.account_status);
      setIsActive(administrator.is_active);
    }
  }, [mode, administrator?.id]);

  const formTitle =
    mode === 'edit' ? t(`${FORM_PREFIX}.editTitle`) : t(`${FORM_PREFIX}.title`);
  const formSubtitle =
    mode === 'edit' ? t(`${FORM_PREFIX}.editSubtitle`) : t(`${FORM_PREFIX}.subtitle`);

  const statusOptions = useMemo(
    () =>
      ACCOUNT_STATUS_OPTIONS.map((value) => ({
        value,
        label: t(`admin.values.accountStatus.${value.toLowerCase()}`),
      })),
    [t, i18n.language],
  );

  const permissionLabel = (key: CreateAdminPermissionKey) =>
    t(`${FORM_PREFIX}.permissions.${key}`);

  const toggleRole = (role: CreateAdminRoleValue) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const togglePermission = (key: CreateAdminPermissionKey) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim()) {
      setError(t(`${FORM_PREFIX}.messages.requiredIdentity`));
      return;
    }
    if (selectedRoles.length === 0) {
      setError(t(`${FORM_PREFIX}.messages.requiredRole`));
      return;
    }

    const permission_keys = [
      ...CREATE_ADMIN_PERMISSIONS_COL_A,
      ...CREATE_ADMIN_PERMISSIONS_COL_B,
    ].filter((k) => permissions[k]) as CreateAdminPermissionKey[];

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      role_slugs: selectedRoles,
      permission_keys,
      sso_enabled: ssoEnabled,
      account_status: accountStatus as AdminAccountStatus,
      grant_access: grantAccess,
      ...(mode === 'edit' ? { platform_access_granted: grantAccess, is_active: isActive } : {}),
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        await adminAdministratorsApi.create(payload);
        showToast(t(`${FORM_PREFIX}.messages.createSuccess`), 'success');
      } else if (administrator) {
        await adminAdministratorsApi.update(administrator.id, payload);
        showToast(t(`${FORM_PREFIX}.messages.updateSuccess`), 'success');
      }
      onSaved();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t(`${FORM_PREFIX}.messages.saveError`);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={adminFormPanelFlexClass} onSubmit={handleSubmit} id={formId}>
      {!hidePanelHeader && <AdminFormPanelHeader title={formTitle} subtitle={formSubtitle} />}

      {error ? (
        <div className="px-4 sm:px-6">
          <AdminFormAlert variant="error">{error}</AdminFormAlert>
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
              <AdminFormField fieldKey="fullName" label={t(`${FORM_PREFIX}.fields.fullName`)} required>
                <AdminFormInput
                  fieldKey="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t(`${FORM_PREFIX}.placeholders.fullName`)}
                  required
                />
              </AdminFormField>
              <AdminFormField fieldKey="email" label={t(`${FORM_PREFIX}.fields.email`)} required>
                <AdminFormInput
                  fieldKey="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t(`${FORM_PREFIX}.placeholders.email`)}
                  required
                  disabled={mode === 'edit'}
                />
              </AdminFormField>
            </div>
          </AdminFormSection>

          <AdminFormSection
            sectionKey="roles"
            title={t(`${FORM_PREFIX}.sections.roles`)}
            description={t(`${FORM_PREFIX}.sections.rolesHint`)}
          >
            <div className={adminFormGridClass}>
              {CREATE_ADMIN_ROLE_OPTIONS.map((opt) => (
                <AdminFormSwitch
                  key={opt.value}
                  id={`admin-role-${opt.value}`}
                  label={t(`${FORM_PREFIX}.roles.${opt.labelKey}`)}
                  checked={selectedRoles.includes(opt.value)}
                  onChange={() => toggleRole(opt.value)}
                />
              ))}
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--admin-text-primary)]">
              {t(`${FORM_PREFIX}.permissionsTitle`)}
            </p>
            <p className="mb-3 text-xs text-[var(--admin-text-secondary)]">
              {t(`${FORM_PREFIX}.sections.permissionsHint`)}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-x-12 sm:gap-y-4">
              <div className="flex flex-col gap-3">
                {CREATE_ADMIN_PERMISSIONS_COL_A.map((key) => (
                  <AdminFormSwitch
                    key={key}
                    id={`admin-perm-${key}`}
                    label={permissionLabel(key)}
                    checked={!!permissions[key]}
                    onChange={() => togglePermission(key)}
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
                    onChange={() => togglePermission(key)}
                  />
                ))}
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection
            sectionKey="access"
            title={t(`${FORM_PREFIX}.sections.accessControl`)}
            description={t(`${FORM_PREFIX}.sections.accessControlHint`)}
          >
            <div className={adminFormGridClass}>
              <AdminSelect
                id="admin-account-status"
                label={t(`${FORM_PREFIX}.fields.accountStatus`)}
                value={accountStatus}
                onChange={setAccountStatus}
                options={statusOptions}
              />
              <AdminFormSwitch
                id="admin-sso-enabled"
                label={t(`${FORM_PREFIX}.fields.ssoEnabled`)}
                checked={ssoEnabled}
                onChange={() => setSsoEnabled((v) => !v)}
              />
              <AdminFormSwitch
                id="admin-grant-access"
                label={t(`${FORM_PREFIX}.fields.grantAccess`)}
                checked={grantAccess}
                onChange={() => setGrantAccess((v) => !v)}
              />
              {mode === 'edit' ? (
                <AdminFormSwitch
                  id="admin-is-active"
                  label={t(`${FORM_PREFIX}.fields.isActive`)}
                  checked={isActive}
                  onChange={() => setIsActive((v) => !v)}
                />
              ) : null}
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
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          )}
          {mode === 'edit' ? t(`${FORM_PREFIX}.actions.save`) : t(`${FORM_PREFIX}.actions.submit`)}
        </button>
      </div>
    </form>
  );
};

export default AdministratorAccountForm;
