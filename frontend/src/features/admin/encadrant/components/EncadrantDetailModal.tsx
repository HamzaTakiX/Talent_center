import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminEncadrantRow } from '../../api/types';
import AdminEntityDetailModal from '../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../ui/AdminDetailGrid';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { specializationDomainLabel } from '../utils/specializationDomainDisplay';

const FORM_PREFIX = 'admin.forms.createEncadrant';

interface EncadrantDetailModalProps {
  open: boolean;
  encadrant: AdminEncadrantRow | null;
  onClose: () => void;
  onEdit: (id: number) => void;
}

function workloadLabel(
  current: number,
  max: number,
  translate: (key: string, options?: Record<string, number>) => string,
): string {
  if (max <= 0) return `${current}`;
  const pct = Math.round((current / max) * 100);
  if (pct >= 100) return translate(`${FORM_PREFIX}.detail.workloadFull`, { current, max });
  if (pct >= 80) return translate(`${FORM_PREFIX}.detail.workloadHigh`, { current, max });
  return translate(`${FORM_PREFIX}.detail.workloadOk`, { current, max });
}

const EncadrantDetailModal: FunctionComponent<EncadrantDetailModalProps> = ({
  open,
  encadrant,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const { accountStatus } = useAdminTableValues();
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
    if (!encadrant) return [];
    const scopes = encadrant.scopes;
    const domains =
      encadrant.specialization_domains.length === 0
        ? t(`${FORM_PREFIX}.detail.generalSupervision`)
        : encadrant.specialization_domains
            .map((d) => specializationDomainLabel(d, t))
            .join(', ');

    const supervisedTypeList = encadrant.supervised_internship_types ?? [];
    const supervisedTypes =
      supervisedTypeList.length === 0
        ? '—'
        : supervisedTypeList
            .map((item) =>
              item.duration_hint ? `${item.name} (${item.duration_hint})` : item.name,
            )
            .join(', ');

    return [
      {
        sectionKey: 'identity',
        title: t('admin.common.detailModal.sections.identity'),
        fields: [
          {
            fieldKey: 'fullName',
            label: t(`${FORM_PREFIX}.fields.fullName`),
            value: encadrant.full_name,
          },
          { fieldKey: 'email', label: t(`${FORM_PREFIX}.fields.email`), value: encadrant.email },
          {
            fieldKey: 'createdAt',
            label: t('admin.common.detailModal.fields.createdAt'),
            value: formatDate(encadrant.created_at),
          },
        ],
      },
      {
        sectionKey: 'academic',
        title: t('admin.common.detailModal.sections.academicScope'),
        fields: [
          {
            fieldKey: 'filiere',
            label: t(`${FORM_PREFIX}.detail.filieres`),
            value: scopes?.filiere_labels?.length
              ? scopes.filiere_labels.join(', ')
              : t('admin.tables.administrators.scopeGlobal'),
          },
          {
            fieldKey: 'skills',
            label: t(`${FORM_PREFIX}.detail.levels`),
            value: scopes?.level_labels?.length ? scopes.level_labels.join(', ') : '—',
          },
          {
            fieldKey: 'class',
            label: t(`${FORM_PREFIX}.detail.classes`),
            value: scopes?.class_group_labels?.length ? scopes.class_group_labels.join(', ') : '—',
          },
          {
            fieldKey: 'specialization',
            label: t(`${FORM_PREFIX}.detail.sectors`),
            value: scopes?.sector_labels?.length ? scopes.sector_labels.join(', ') : '—',
          },
          {
            fieldKey: 'academicYear',
            label: t(`${FORM_PREFIX}.detail.academicYears`),
            value: scopes?.academic_years?.length ? scopes.academic_years.join(', ') : '—',
          },
        ],
      },
      {
        sectionKey: 'overview',
        title: t(`${FORM_PREFIX}.sections.supervision`),
        fields: [
          {
            fieldKey: 'specialization',
            label: t(`${FORM_PREFIX}.fields.specializationDomains`),
            value: domains,
          },
          {
            fieldKey: 'supervisedInternships',
            label: t(`${FORM_PREFIX}.supervisedInternships.label`),
            value: supervisedTypes,
          },
          {
            fieldKey: 'maxStudents',
            label: t(`${FORM_PREFIX}.fields.maxStudents`),
            value: String(encadrant.max_students),
          },
          {
            fieldKey: 'student',
            label: t(`${FORM_PREFIX}.detail.assignedStudents`),
            value: workloadLabel(encadrant.current_students, encadrant.max_students, (key, opts) =>
              t(key, opts as Record<string, number>),
            ),
          },
        ],
      },
      {
        sectionKey: 'access',
        title: t('admin.common.detailModal.sections.access'),
        fields: [
          {
            fieldKey: 'status',
            label: t(`${FORM_PREFIX}.detail.accountStatus`),
            value: accountStatus(encadrant.account_status),
          },
          {
            fieldKey: 'platformAccess',
            label: t(`${FORM_PREFIX}.fields.grantAccess`),
            value: encadrant.platform_access_granted ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'active',
            label: t(`${FORM_PREFIX}.fields.isActive`),
            value: encadrant.is_encadrant_active ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'sso',
            label: t('admin.common.detailModal.fields.sso'),
            value: encadrant.sso_enabled ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'lastLogin',
            label: t('admin.common.detailModal.fields.lastLogin'),
            value: formatDate(encadrant.last_login_at),
          },
          {
            fieldKey: 'onboarding',
            label: t(`${FORM_PREFIX}.detail.firstLoginCompleted`),
            value: encadrant.first_login_completed
              ? t('admin.common.yes')
              : t('admin.common.no'),
          },
        ],
      },
    ];
  }, [encadrant, t, accountStatus, neverLogin, dateLocale]);

  if (!encadrant) return null;

  return (
    <AdminEntityDetailModal
      open={open}
      title={t('admin.common.detailModal.encadrant.title')}
      description={encadrant.email}
      sections={sections}
      onClose={onClose}
      onEdit={() => onEdit(encadrant.id)}
    />
  );
};

export default EncadrantDetailModal;
