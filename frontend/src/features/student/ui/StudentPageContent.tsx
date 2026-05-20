import { FunctionComponent, ReactNode } from 'react';
import AdminPageContent from '../../admin/ui/AdminPageContent';

interface StudentPageContentProps {
  children: ReactNode;
  className?: string;
}

/** Conteneur standard des pages étudiant — même animation et espacement que l’admin. */
const StudentPageContent: FunctionComponent<StudentPageContentProps> = ({
  children,
  className = '',
}) => <AdminPageContent className={className}>{children}</AdminPageContent>;

export default StudentPageContent;
