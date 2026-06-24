import { FunctionComponent } from 'react';
import type { AdminStudentRow } from '../../api/types';
import InternshipStudentAvatar from '../../offres-stage/chat/components/InternshipStudentAvatar';
import { getAdminUserInitials } from '../../dashboard/utils/adminUserDisplay';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import { SafeText, SafeTitleCell } from '../../../../design-system/safeContent';

interface StudentTableIdentityCellProps {
  student: AdminStudentRow;
}

const StudentTableIdentityCell: FunctionComponent<StudentTableIdentityCellProps> = ({ student }) => {
  const name = student.full_name || student.email;
  const initials = getAdminUserInitials(name, student.email);

  return (
    <div className="admin-students-table__identity">
      <InternshipStudentAvatar
        url={resolveMediaUrl(student.avatar_url)}
        name={name}
        email={student.email}
        initials={initials}
        size="list"
      />
      <div className="admin-students-table__identity-meta min-w-0">
        <SafeTitleCell className="font-medium">{name}</SafeTitleCell>
        <SafeText className="text-xs text-[var(--admin-text-secondary)]">{student.email}</SafeText>
      </div>
    </div>
  );
};

export default StudentTableIdentityCell;
