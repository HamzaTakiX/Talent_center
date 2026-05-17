import { FunctionComponent, ReactNode } from 'react';
import AdminLayout from '../dashboard/components/AdminLayout';
import AdminPageContent from './AdminPageContent';

type AdminPageWidth = 'default' | 'wide' | 'narrow';

const widthClass: Record<AdminPageWidth, string> = {
  default: 'max-w-[1680px]',
  wide: 'max-w-[1600px]',
  narrow: 'max-w-[1228px]',
};

interface AdminModulePageShellProps {
  children: ReactNode;
  width?: AdminPageWidth;
  fillHeight?: boolean;
  className?: string;
}

/** Enveloppe standard : AdminLayout + conteneur page aligné dashboard. */
const AdminModulePageShell: FunctionComponent<AdminModulePageShellProps> = ({
  children,
  width = 'wide',
  fillHeight = false,
  className = '',
}) => (
  <AdminLayout mainFillHeight={fillHeight}>
    <AdminPageContent className={`${widthClass[width]} ${className}`}>{children}</AdminPageContent>
  </AdminLayout>
);

export default AdminModulePageShell;
