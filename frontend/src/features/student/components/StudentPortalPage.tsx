import { FunctionComponent, ReactNode } from 'react';
import { PLATFORM_PAGE_DEFAULT, PLATFORM_PAGE_NARROW, PLATFORM_PAGE_WIDE } from '../../../design-system/platformTokens';
import AdminPageContent from '../../admin/ui/AdminPageContent';
import StudentLayout from './StudentLayout';

type StudentPageWidth = 'default' | 'wide' | 'narrow';

const widthClass: Record<StudentPageWidth, string> = {
  default: PLATFORM_PAGE_DEFAULT,
  wide: PLATFORM_PAGE_WIDE,
  narrow: PLATFORM_PAGE_NARROW,
};

interface StudentPortalPageProps {
  children: ReactNode;
  width?: StudentPageWidth;
  fillHeight?: boolean;
}

/**
 * Enveloppe standard portail étudiant — même système que AdminModulePageShell.
 * Utiliser sur toutes les pages (sauf chat/historique plein écran).
 */
const StudentPortalPage: FunctionComponent<StudentPortalPageProps> = ({
  children,
  width = 'wide',
  fillHeight = false,
}) => (
  <StudentLayout mainFillHeight={fillHeight} contentFlush={fillHeight}>
    <AdminPageContent className={widthClass[width]}>{children}</AdminPageContent>
  </StudentLayout>
);

export default StudentPortalPage;
