import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminAdministratorRow } from '../../api/types';
import AdminCredentialReveal from '../../ui/AdminCredentialReveal';
import AdminEntityDetailModal from '../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../ui/AdminDetailGrid';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import {
  administratorRoleSlugs,
  isSuperAdminAdministrator,
} from '../utils/platformAdministratorUtils';

const FORM_PREFIX = 'admin.forms.createAdministrator';

interface AdministratorDetailModalProps {
  open: boolean;
  administrator: AdminAdministratorRow | null;
  onClose: () => void;
  onEdit?: (id: number) => void;
}

const AdministratorDetailModal: FunctionComponent<AdministratorDetailModalProps> = ({
  open,
  administrator,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const { adminRole, accountStatus } = useAdminTableValues();
  const neverLogin = t('admin.tables.administrators.neverLoggedIn');
  const dateLocale = i18n.language.startsWith('ar')
    ? 'ar-MA'
    : i18n.language.startsWith('en')
      ? 'en-GB'
      : 'fr-FR';

  const formatDate = (iso: string | null) => {
    if (!iso) return neverLogin;
    try {
      return new Date(iso).toLocaleString(dateLocale);
    } catch {
      return neverLogin;
    }
  };

  const sections: AdminDetailSection[] = useMemo(() => {
    if (!administrator) return [];
    const scopes = administrator.scopes;
    const rolesLabel = administratorRoleSlugs(administrator)
      .map((slug) => adminRole(slug))
      .join(', ');
    const permissionsLabel =
      administrator.permission_keys.length === 0
        ? '—'
        : administrator.permission_keys
            .map((key) => t(`${FORM_PREFIX}.permissions.${key}`))
            .join(', ');

    return [
      {
        sectionKey: 'identity',
        title: t('admin.common.detailModal.sections.identity'),
        fields: [
          { fieldKey: 'fullName', label: t(`${FORM_PREFIX}.fields.fullName`), value: administrator.full_name },
          { fieldKey: 'email', label: t(`${FORM_PREFIX}.fields.email`), value: administrator.email },
          {
            fieldKey: 'createdAt',
            label: t('admin.common.detailModal.fields.createdAt'),
            value: formatDate(administrator.created_at),
          },
        ],
      },
      {
        sectionKey: 'roles',
        title: t('admin.common.detailModal.sections.roles'),
        fields: [
          { fieldKey: 'roles', label: t(`${FORM_PREFIX}.sections.roles`), value: rolesLabel },
          { fieldKey: 'permissions', label: t(`${FORM_PREFIX}.permissionsTitle`), value: permissionsLabel },
        ],
      },
      {
        sectionKey: 'academic',
        title: t('admin.common.detailModal.sections.academicScope'),
        fields: [
          {
            fieldKey: 'filiere',
            label: t(`${FORM_PREFIX}.fields.filiere`),
            value: scopes?.filiere_labels?.length ? scopes.filiere_labels.join(', ') : t('admin.tables.administrators.scopeGlobal'),
          },
          {
            fieldKey: 'class',
            label: t(`${FORM_PREFIX}.fields.classGroup`),
            value: scopes?.class_group_labels?.length ? scopes.class_group_labels.join(', ') : '—',
          },
          {
            fieldKey: 'skills',
            label: t(`${FORM_PREFIX}.fields.levels`),
            value: scopes?.levels?.length ? scopes.levels.join(', ') : '—',
          },
          {
            fieldKey: 'academicYear',
            label: t(`${FORM_PREFIX}.fields.academicYears`),
            value: scopes?.academic_years?.length ? scopes.academic_years.join(', ') : '—',
          },
        ],
      },
      {
        sectionKey: 'access',
        title: t('admin.common.detailModal.sections.access'),
        fields: [
          {
            fieldKey: 'status',
            label: t(`${FORM_PREFIX}.fields.accountStatus`),
            value: accountStatus(administrator.account_status),
          },
          {
            fieldKey: 'sso',
            label: t(`${FORM_PREFIX}.fields.ssoEnabled`),
            value: administrator.sso_enabled ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'platformAccess',
            label: t(`${FORM_PREFIX}.fields.grantAccess`),
            value: administrator.platform_access_granted ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'active',
            label: t(`${FORM_PREFIX}.fields.isActive`),
            value: administrator.is_active ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'lastLogin',
            label: t('admin.common.detailModal.fields.lastLogin'),
            value: formatDate(administrator.last_login_at),
          },
          {
            fieldKey: 'onboarding',
            label: t('admin.tables.columns.onboarding'),
            value: administrator.onboarding_complete
              ? t('admin.tables.administrators.onboardingComplete')
              : t('admin.tables.administrators.onboardingPending'),
          },
        ],
      },
    ];
  }, [administrator, t, adminRole, accountStatus, neverLogin, dateLocale]);

  if (!administrator) return null;

  return (
    <AdminEntityDetailModal
      open={open}
      onClose={onClose}
      title={t('admin.common.detailModal.administrator.title')}
      description={administrator.full_name}
      sections={sections}
      onEdit={onEdit && !isSuperAdminAdministrator(administrator) ? () => onEdit(administrator.id) : undefined}
      afterSections={
        isSuperAdminAdministrator(administrator) ? null : (
          <AdminCredentialReveal kind="administrator" userId={administrator.id} enabled={open} />
        )
      }
    />
  );
};

export default AdministratorDetailModal;
