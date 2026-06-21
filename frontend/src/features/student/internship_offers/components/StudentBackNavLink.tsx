import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import BackButtonRow from '../../../../shared/navigation/BackButtonRow';
import { useBackNavigation } from '../../../../shared/navigation/useBackNavigation';
import { STUDENT_BACK_NAV_BUTTON } from '../constants/internshipOffersStyles';

interface StudentBackNavLinkProps {
  to: string;
  label: string;
}

const StudentBackNavLink: FunctionComponent<StudentBackNavLinkProps> = ({ to, label }) => {
  const { BackIcon, controlClassName } = useBackNavigation();

  return (
    <BackButtonRow>
      <Link
        to={to}
        className={`${STUDENT_BACK_NAV_BUTTON} ${controlClassName} group`}
      >
        <span className="student-back-nav-icon" aria-hidden>
          <BackIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" strokeWidth={2.25} />
        </span>
        <span className="min-w-0 break-words">{label}</span>
      </Link>
    </BackButtonRow>
  );
};

export default StudentBackNavLink;
