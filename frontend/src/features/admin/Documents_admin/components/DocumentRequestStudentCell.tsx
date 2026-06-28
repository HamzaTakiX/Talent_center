import { FunctionComponent } from 'react';
import InternshipStudentAvatar from '../../offres-stage/chat/components/InternshipStudentAvatar';
import { getAdminUserInitials } from '../../dashboard/utils/adminUserDisplay';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import { SafeText, SafeTitleCell } from '../../../../design-system/safeContent';
import type { StudentSummary } from '../types';

interface DocumentRequestStudentCellProps {
  student: StudentSummary;
}

const DocumentRequestStudentCell: FunctionComponent<DocumentRequestStudentCellProps> = ({ student }) => {
  const displayName =
    student.fullName && student.fullName !== student.email ? student.fullName : student.email.split('@')[0];
  const initials = student.avatarInitials || getAdminUserInitials(student.fullName, student.email);
  const subtitle = [student.email, student.classGroup].filter(Boolean).join(' · ');

  return (
    <div className="admin-doc-table__student">
      <InternshipStudentAvatar
        url={resolveMediaUrl(student.avatarUrl)}
        name={displayName}
        email={student.email}
        initials={initials}
        size="list"
      />
      <div className="admin-doc-table__student-meta min-w-0">
        <SafeTitleCell className="admin-doc-table__student-name">{displayName}</SafeTitleCell>
        <SafeText className="admin-doc-table__student-sub">{subtitle}</SafeText>
      </div>
    </div>
  );
};

export default DocumentRequestStudentCell;
