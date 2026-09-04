import { FunctionComponent } from 'react';
import type { StudentFinancialTableRow } from '../../api/srf';
import InternshipStudentAvatar from '../../offres-stage/chat/components/InternshipStudentAvatar';
import { getAdminUserInitials } from '../../dashboard/utils/adminUserDisplay';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import { SafeText, SafeTitleCell } from '../../../../design-system/safeContent';

interface SrfStudentIdentityCellProps {
  row: StudentFinancialTableRow;
}

const SrfStudentIdentityCell: FunctionComponent<SrfStudentIdentityCellProps> = ({ row }) => {
  const name = row.studentName;
  const email = row.studentEmail ?? '';
  const initials = getAdminUserInitials(name, email);

  return (
    <div className="admin-students-table__identity">
      <InternshipStudentAvatar
        url={resolveMediaUrl(row.studentAvatarUrl)}
        name={name}
        email={email}
        initials={initials}
        size="list"
      />
      <div className="admin-students-table__identity-meta min-w-0">
        <SafeTitleCell className="font-medium">{name}</SafeTitleCell>
        {email ? (
          <SafeText className="text-xs text-[var(--admin-text-secondary)]">{email}</SafeText>
        ) : null}
      </div>
    </div>
  );
};

export default SrfStudentIdentityCell;
