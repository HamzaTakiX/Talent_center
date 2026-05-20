import { FunctionComponent, ReactNode } from 'react';
import AdminModulePanel from '../features/admin/ui/AdminModulePanel';
import { PLATFORM_PAGE_DEFAULT } from './platformTokens';

interface PlatformModuleSectionProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  /** Enveloppe page complète avec espacement admin-page */
  asPage?: boolean;
}

/** Section module — panneau admin standard (carte, table, formulaire). */
const PlatformModuleSection: FunctionComponent<PlatformModuleSectionProps> = ({
  children,
  header,
  className = '',
  asPage = false,
}) => {
  const panel = (
    <AdminModulePanel header={header} className={className}>
      {children}
    </AdminModulePanel>
  );
  if (asPage) {
    return <div className={PLATFORM_PAGE_DEFAULT}>{panel}</div>;
  }
  return panel;
};

export default PlatformModuleSection;
