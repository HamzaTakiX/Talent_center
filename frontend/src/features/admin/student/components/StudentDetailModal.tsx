import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminStudentRow } from '../../api/types';
import AdminEntityDetailModal from '../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../ui/AdminDetailGrid';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';

const FORM_PREFIX = 'admin.forms.createStudent';

interface StudentDetailModalProps {
  open: boolean;
  student: AdminStudentRow | null;
  onClose: () => void;
  onEdit: (id: number) => void;
}

const StudentDetailModal: FunctionComponent<StudentDetailModalProps> = ({
  open,
  student,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const { accountStatus } = useAdminTableValues();
  const dateLocale = i18n.language.startsWith('ar')
    ? 'ar-MA'
    : i18n.language.startsWith('en')
      ? 'en-GB'
      : 'fr-FR';

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(dateLocale);
    } catch {
      return '—';
    }
  };

  const sections: AdminDetailSection[] = useMemo(() => {
    if (!student) return [];
    return [
      {
        sectionKey: 'identity',
        title: t('admin.common.detailModal.sections.identity'),
        fields: [
          { fieldKey: 'email', label: t(`${FORM_PREFIX}.fields.email`), value: student.email },
          { fieldKey: 'firstName', label: t(`${FORM_PREFIX}.fields.firstName`), value: student.first_name || '—' },
          { fieldKey: 'lastName', label: t(`${FORM_PREFIX}.fields.lastName`), value: student.last_name || '—' },
          { fieldKey: 'studentNumber', label: t(`${FORM_PREFIX}.fields.studentNumber`), value: student.student_number || '—' },
        ],
      },
      {
        sectionKey: 'academic',
        title: t('admin.common.detailModal.sections.assignment'),
        fields: [
          { fieldKey: 'filiere', label: t('admin.tables.columns.field'), value: student.program_major || '—' },
          { fieldKey: 'class', label: t('admin.tables.columns.class'), value: student.current_class || '—' },
          { fieldKey: 'academicYear', label: t(`${FORM_PREFIX}.fields.academicYear`), value: student.academic_year || '—' },
          {
            fieldKey: 'onboarding',
            label: t('admin.common.detailModal.fields.onboardingPercent'),
            value: `${student.onboarding_percent}%`,
          },
        ],
      },
      {
        sectionKey: 'access',
        title: t('admin.common.detailModal.sections.access'),
        fields: [
          {
            fieldKey: 'status',
            label: t('admin.tables.columns.status'),
            value: accountStatus(student.account_status),
          },
          {
            fieldKey: 'sso',
            label: t('admin.common.detailModal.fields.sso'),
            value: student.sso_enabled ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'platformAccess',
            label: t('admin.common.detailModal.fields.platformAccess'),
            value: student.platform_access_granted ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'active',
            label: t('admin.common.detailModal.fields.active'),
            value: student.is_active ? t('admin.common.yes') : t('admin.common.no'),
          },
          {
            fieldKey: 'lastLogin',
            label: t('admin.common.detailModal.fields.lastLogin'),
            value: formatDate(student.last_login_at),
          },
          {
            fieldKey: 'createdAt',
            label: t('admin.common.detailModal.fields.createdAt'),
            value: formatDate(student.created_at),
          },
        ],
      },
    ];
  }, [student, t, accountStatus, dateLocale]);

  if (!student) return null;

  return (
    <AdminEntityDetailModal
      open={open}
      onClose={onClose}
      title={t('admin.common.detailModal.student.title')}
      description={student.full_name || student.email}
      sections={sections}
      onEdit={() => onEdit(student.id)}
    />
  );
};

export default StudentDetailModal;
