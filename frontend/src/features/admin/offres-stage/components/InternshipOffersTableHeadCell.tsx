import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InternshipOffersTableHeadCellProps {
  label: string;
  icon: LucideIcon;
  className?: string;
}

const InternshipOffersTableHeadCell: FunctionComponent<InternshipOffersTableHeadCellProps> = ({
  label,
  icon: Icon,
  className = '',
}) => (
  <th className={className}>
    <span className="admin-offers-table__head-cell">
      <span className="admin-offers-table__head-icon" aria-hidden>
        <Icon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="admin-offers-table__head-label">{label}</span>
    </span>
  </th>
);

export default InternshipOffersTableHeadCell;
