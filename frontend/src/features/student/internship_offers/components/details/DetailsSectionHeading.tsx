import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { DETAILS_SECTION_TITLE } from '../../constants/internshipOfferDetailsStyles';

interface DetailsSectionHeadingProps {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

/** Titre de section détail offre — icône + label alignés. */
const DetailsSectionHeading: FunctionComponent<DetailsSectionHeadingProps> = ({
  icon: Icon,
  children,
  className = 'mb-4',
}) => (
  <h2 className={`${DETAILS_SECTION_TITLE} m-0 flex min-w-0 items-center gap-2.5 ${className}`}>
    <span
      className="student-icon-chip student-icon-chip--brand h-8 w-8 shrink-0 rounded-lg"
      aria-hidden
    >
      <Icon className="h-4 w-4" strokeWidth={1.85} />
    </span>
    <span className="min-w-0 break-words">{children}</span>
  </h2>
);

export default DetailsSectionHeading;
