import { FormEvent, FunctionComponent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Hexagon, Loader2 } from 'lucide-react';
import { adminAdministratorsApi } from '../../api/administrators';
import type { AdminAdministratorRow } from '../../api/types';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import {
  CREATE_ADMIN_PERMISSIONS_COL_A,
  CREATE_ADMIN_PERMISSIONS_COL_B,
  type CreateAdminPermissionKey,
} from '../constants/createAdministrator';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import {
  adminFormActionsFooterClass,
  adminFormBodyScrollClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormHeaderClass,
  adminFormPanelFlexClass,
  adminFormSubtitleClass,
  adminFormTitleClass,
} from '../../shared/forms/adminFormClasses';
import { isSuperAdminAdministrator } from '../utils/platformAdministratorUtils';

const FORM_PREFIX = 'admin.forms.createAdministrator';

const AssignAdminPermissionsPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { showToast, warning: toastWarning } = useAdminToast();
  const backLabel = useAdminBackLabel('administrators');
  const goBack = () => navigate('/admin/admins');

  const [administrator, setAdministrator] = useState<AdminAdministratorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const adminId = Number(id);
    if (!adminId) {
      setLoading(false);
      return;
    }
    adminAdministratorsApi
      .get(adminId)
      .then((admin) => {
        if (isSuperAdminAdministrator(admin)) {
          toastWarning(t('admin.tables.administrators.superAdminProtected'));
          navigate('/admin/admins', { replace: true });
          return;
        }
        setAdministrator(admin);
        const map: Record<string, boolean> = {};
        admin.permission_keys.forEach((k) => {
          map[k] = true;
        });
        setPermissions(map);
      })
      .catch(() => setAdministrator(null))
      .finally(() => setLoading(false));
  }, [id, navigate, t, toastWarning]);

  const togglePermission = (key: CreateAdminPermissionKey) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const permissionLabel = (key: CreateAdminPermissionKey) =>
    t(`${FORM_PREFIX}.permissions.${key}`);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!administrator) return;
    const permission_keys = [
      ...CREATE_ADMIN_PERMISSIONS_COL_A,
      ...CREATE_ADMIN_PERMISSIONS_COL_B,
    ].filter((k) => permissions[k]) as CreateAdminPermissionKey[];

    setSaving(true);
    try {
      await adminAdministratorsApi.update(administrator.id, { permission_keys });
      showToast(t(`${FORM_PREFIX}.messages.updateSuccess`), 'success');
      goBack();
    } catch {
      showToast(t(`${FORM_PREFIX}.messages.saveError`), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-accent)]" aria-hidden />
        </div>
      </AdminFormPageShell>
    );
  }

  if (!administrator) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
          {t('admin.common.notFound.administrator')}
        </p>
      </AdminFormPageShell>
    );
  }

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t('admin.common.breadcrumbs.rolesPermissions')}
      heroSubtitle={t(`${FORM_PREFIX}.assignPermissionsSubtitle`, { name: administrator.full_name })}
    >
      <form className={adminFormPanelFlexClass} onSubmit={handleSave}>
        <div className={adminFormHeaderClass}>
          <Hexagon className="h-5 w-5 text-[var(--admin-accent)]" strokeWidth={1.75} aria-hidden />
          <div>
            <h2 className={adminFormTitleClass}>{administrator.full_name}</h2>
            <p className={adminFormSubtitleClass}>{administrator.email}</p>
          </div>
        </div>
        <div className={adminFormBodyScrollClass}>
          <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2 sm:gap-x-12">
            <div className="flex flex-col gap-3">
              {CREATE_ADMIN_PERMISSIONS_COL_A.map((key) => (
                <AdminFormSwitch
                  key={key}
                  id={`assign-perm-${key}`}
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
                  id={`assign-perm-${key}`}
                  label={permissionLabel(key)}
                  checked={!!permissions[key]}
                  onChange={() => togglePermission(key)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={adminFormActionsFooterClass}>
          <button type="button" onClick={goBack} className={adminFormBtnSecondaryClass} disabled={saving}>
            {t(`${FORM_PREFIX}.actions.cancel`)}
          </button>
          <button type="submit" className={adminFormBtnPrimaryClass} disabled={saving}>
            <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t(`${FORM_PREFIX}.actions.save`)}
          </button>
        </div>
      </form>
    </AdminFormPageShell>
  );
};

export default AssignAdminPermissionsPage;
