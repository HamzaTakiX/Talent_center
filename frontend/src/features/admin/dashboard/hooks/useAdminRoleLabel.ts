import { useTranslation } from 'react-i18next';

/** Libellé de rôle traduit pour l’interface admin. */
export const useAdminRoleLabel = (role?: string | null): string => {
  const { t } = useTranslation();
  const normalized = (role ?? '').toLowerCase().trim();

  if (normalized === 'encadrant' || normalized === 'supervisor') {
    return t('roles.encadrant');
  }

  if (
    normalized === 'admin' ||
    normalized === 'super_admin' ||
    normalized === 'superadmin' ||
    normalized === 'super admin' ||
    normalized === 'administrator' ||
    normalized === 'staff' ||
    normalized.includes('admin')
  ) {
    return t('roles.superAdmin');
  }

  return t('roles.superAdmin');
};
