import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarClock,
  FileText,
  GraduationCap,
  Hash,
  Layers,
  Mail,
  Truck,
  User,
} from 'lucide-react';
import InternshipStudentAvatar from '../../offres-stage/chat/components/InternshipStudentAvatar';
import { getAdminUserInitials } from '../../dashboard/utils/adminUserDisplay';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import { SafeText, SafeTitleCell } from '../../../../design-system/safeContent';
import DocumentsStatusBadge from './DocumentsStatusBadge';
import type { DocumentRequestDetail } from '../types';

interface DocumentRequestStudentProfileCardProps {
  data: DocumentRequestDetail;
}

function formatDateTime(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DocumentRequestStudentProfileCard: FunctionComponent<DocumentRequestStudentProfileCardProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const { student } = data;
  const displayName =
    student.fullName && student.fullName !== student.email ? student.fullName : student.email.split('@')[0];
  const initials = student.avatarInitials || getAdminUserInitials(student.fullName, student.email);

  return (
    <div className="admin-doc-detail-profile">
      <div className="admin-doc-detail-profile__header">
        <InternshipStudentAvatar
          url={resolveMediaUrl(student.avatarUrl)}
          name={displayName}
          email={student.email}
          initials={initials}
          size="inspector"
        />
        <div className="admin-doc-detail-profile__identity min-w-0">
          <SafeTitleCell className="admin-doc-detail-profile__name">{displayName}</SafeTitleCell>
          <SafeText className="admin-doc-detail-profile__email">{student.email}</SafeText>
          <div className="admin-doc-detail-profile__badges">
            <DocumentsStatusBadge status={data.status} />
            {student.srfClearance ? (
              <span className="admin-doc-detail-chip admin-doc-detail-chip--success">
                {t('admin.documentsModule.detail.srfClearanceOk')}
              </span>
            ) : (
              <span className="admin-doc-detail-chip admin-doc-detail-chip--warning">
                {t('admin.documentsModule.detail.srfClearancePending')}
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="admin-doc-detail-profile__grid">
        <div className="admin-doc-detail-profile__item">
          <dt>
            <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
            {t('admin.documentsModule.detail.program')}
          </dt>
          <dd>{student.program || '—'}</dd>
        </div>
        <div className="admin-doc-detail-profile__item">
          <dt>
            <User className="h-4 w-4 shrink-0" aria-hidden />
            {t('admin.documentsModule.detail.classGroup')}
          </dt>
          <dd>
            {student.classGroup || '—'}
            {student.academicYear ? ` · ${student.academicYear}` : ''}
          </dd>
        </div>
        <div className="admin-doc-detail-profile__item">
          <dt>
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            {t('admin.documentsModule.detail.email')}
          </dt>
          <dd>{student.email}</dd>
        </div>
        {student.encadrantName ? (
          <div className="admin-doc-detail-profile__item">
            <dt>
              <User className="h-4 w-4 shrink-0" aria-hidden />
              {t('admin.documentsModule.detail.encadrant')}
            </dt>
            <dd>{student.encadrantName}</dd>
          </div>
        ) : null}
      </dl>

      <div className="admin-doc-detail-profile__request">
        <p className="admin-doc-detail-profile__request-title">
          {t('admin.documentsModule.detail.requestContext')}
        </p>
        <dl className="admin-doc-detail-profile__request-grid">
          <div className="admin-doc-detail-profile__request-item">
            <dt>
              <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('admin.documentsModule.table.reference')}
            </dt>
            <dd>{data.reference}</dd>
          </div>
          <div className="admin-doc-detail-profile__request-item">
            <dt>
              <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('admin.documentsModule.table.type')}
            </dt>
            <dd>
              {data.documentTypeName}
              <code className="admin-doc-detail-profile__code">{data.documentTypeCode}</code>
            </dd>
          </div>
          <div className="admin-doc-detail-profile__request-item">
            <dt>
              <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('admin.documentsModule.detail.service')}
            </dt>
            <dd>{data.serviceName}</dd>
          </div>
          <div className="admin-doc-detail-profile__request-item">
            <dt>
              <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('admin.documentsModule.detail.delivery')}
            </dt>
            <dd>{t(`admin.documentsModule.delivery.${data.deliveryMethod}`, data.deliveryMethod)}</dd>
          </div>
          <div className="admin-doc-detail-profile__request-item">
            <dt>
              <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('admin.documentsModule.detail.submittedAt')}
            </dt>
            <dd>{formatDateTime(data.submittedAt)}</dd>
          </div>
          <div className="admin-doc-detail-profile__request-item">
            <dt>
              <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('admin.documentsModule.detail.priority')}
            </dt>
            <dd>{t(`admin.documentsModule.priority.${data.priority}`, data.priority)}</dd>
          </div>
        </dl>
      </div>

      {data.fields.length > 0 ? (
        <div className="admin-doc-detail-profile__fields">
          <p className="admin-doc-detail-profile__request-title">
            {t('admin.documentsModule.detail.formData')}
          </p>
          <dl className="admin-doc-detail-profile__fields-grid">
            {data.fields.map((field) => (
              <div key={field.name} className="admin-doc-detail-profile__field">
                <dt>{field.labelKey}</dt>
                <dd>{field.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
};

export default DocumentRequestStudentProfileCard;
