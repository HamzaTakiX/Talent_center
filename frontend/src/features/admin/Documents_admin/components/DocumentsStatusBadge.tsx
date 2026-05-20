import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentRequestStatus } from '../types';

const STATUS_CLASS: Record<DocumentRequestStatus, string> = {
  draft: 'admin-doc-status--draft',
  submitted: 'admin-doc-status--submitted',
  incomplete: 'admin-doc-status--incomplete',
  under_verification: 'admin-doc-status--verify',
  waiting_reservation: 'admin-doc-status--waiting',
  reserved: 'admin-doc-status--reserved',
  validated: 'admin-doc-status--validated',
  ready: 'admin-doc-status--ready',
  delivered: 'admin-doc-status--delivered',
  rejected: 'admin-doc-status--rejected',
  cancelled: 'admin-doc-status--cancelled',
};

interface Props {
  status: DocumentRequestStatus;
}

const DocumentsStatusBadge: FunctionComponent<Props> = ({ status }) => {
  const { t } = useTranslation();
  return (
    <span className={`admin-doc-status ${STATUS_CLASS[status] ?? ''}`}>
      {t(`admin.documentsModule.status.${status}`)}
    </span>
  );
};

export default DocumentsStatusBadge;
