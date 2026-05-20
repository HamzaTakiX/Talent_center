import { FunctionComponent, ReactNode } from 'react';
import StudentLayout from '../components/StudentLayout';
import StudentPageContent from './StudentPageContent';

type StudentPageWidth = 'default' | 'wide' | 'narrow';

const widthClass: Record<StudentPageWidth, string> = {
  default: 'max-w-[1680px]',
  wide: 'max-w-[1600px]',
  narrow: 'max-w-[1228px]',
};

interface StudentModulePageShellProps {
  children: ReactNode;
  width?: StudentPageWidth;
  fillHeight?: boolean;
  className?: string;
}

/** Enveloppe standard : StudentLayout + conteneur page aligné écosystème admin. */
const StudentModulePageShell: FunctionComponent<StudentModulePageShellProps> = ({
  children,
  width = 'wide',
  fillHeight = false,
  className = '',
}) => (
  <StudentLayout mainFillHeight={fillHeight} contentFlush={fillHeight}>
    <StudentPageContent className={`${widthClass[width]} ${className}`}>
      {children}
    </StudentPageContent>
  </StudentLayout>
);

export default StudentModulePageShell;
