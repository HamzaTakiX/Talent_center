import { FunctionComponent } from 'react';
import type { AdminAdministratorRow } from '../../api/types';
import InternshipStudentAvatar from '../../offres-stage/chat/components/InternshipStudentAvatar';
import { getAdminUserInitials } from '../../dashboard/utils/adminUserDisplay';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import { SafeText, SafeTitleCell } from '../../../../design-system/safeContent';

interface AdministratorTableIdentityCellProps {
  administrator: AdminAdministratorRow;
}

const AdministratorTableIdentityCell: FunctionComponent<AdministratorTableIdentityCellProps> = ({
  administrator,
}) => {
  const name = administrator.full_name || administrator.email;
  const initials = getAdminUserInitials(name, administrator.email);

  return (
    <div className="admin-students-table__identity">
      <InternshipStudentAvatar
        url={resolveMediaUrl(administrator.avatar_url)}
        name={name}
        email={administrator.email}
        initials={initials}
        size="list"
      />
      <div className="admin-students-table__identity-meta min-w-0">
        <SafeTitleCell className="font-medium">{name}</SafeTitleCell>
        <SafeText className="text-xs text-[var(--admin-text-secondary)]">{administrator.email}</SafeText>
      </div>
    </div>
  );
};

export default AdministratorTableIdentityCell;
